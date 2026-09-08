"""
SideQuest Inference Module
Handles collaborator place verification and hidden gem filtering.
"""
import numpy as np
import pandas as pd
import pickle
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class PlaceResult:
    """Result of place analysis"""
    place_id: str
    name: str
    hidden_gem_score: float
    safety_score: float
    collab_auth_score: float
    is_hidden_gem: bool
    is_verified: bool
    is_safe: bool
    recommendation: str  # "hidden_gem", "verified", "regular", "rejected"
    confidence: float
    details: Dict


class SideQuestInference:
    """
    Inference engine for SideQuest.
    Handles collaborator verification and place filtering.
    """
    
    def __init__(self, models_dir: str = "D:/sidequest_model/models"):
        self.models_dir = Path(models_dir)
        self.model = None
        self.config = None
        self.metrics = None
        
        # Thresholds
        self.hidden_gem_threshold = 60.0  # Minimum score to qualify as hidden gem
        self.safety_threshold = 50.0      # Minimum safety score
        self.collab_auth_threshold = 0.5  # Minimum auth score (classification)
        
        # Load models on initialization
        self.load_models()
    
    def load_models(self):
        """Load trained models from disk"""
        try:
            # Import here to avoid circular imports
            import sys
            sys.path.insert(0, str(Path(__file__).parent))
            from unified_model import UnifiedSideQuestModel
            
            self.model = UnifiedSideQuestModel()
            self.model.load_models(str(self.models_dir))
            
            # Load metrics if available
            metrics_path = self.models_dir / "metrics.json"
            if metrics_path.exists():
                with open(metrics_path, 'r') as f:
                    self.metrics = json.load(f)
            
            logger.info(f"Models loaded from {self.models_dir}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise
    
    def analyze_place(self, place_data: pd.DataFrame) -> PlaceResult:
        """
        Analyze a single place and determine if it qualifies as hidden gem.
        
        Args:
            place_data: DataFrame with place features (single row)
        
        Returns:
            PlaceResult with scores and recommendation
        """
        if self.model is None:
            raise ValueError("Models not loaded. Call load_models() first.")
        
        # Get predictions for all tasks
        predictions = {}
        for task_name in ["hidden_gem", "safety_score", "collaboration_auth"]:
            try:
                pred = self.model.predict(place_data, task=task_name)
                predictions[task_name] = pred[0] if len(pred) > 0 else 0
            except Exception as e:
                logger.warning(f"Error predicting {task_name}: {e}")
                predictions[task_name] = 0
        
        # Extract scores
        hidden_gem_score = float(predictions.get("hidden_gem", 0))
        safety_score = float(predictions.get("safety_score", 50))
        collab_auth_score = float(predictions.get("collaboration_auth", 0))
        
        # Determine flags
        is_hidden_gem = hidden_gem_score >= self.hidden_gem_threshold
        is_verified = collab_auth_score >= self.collab_auth_threshold
        is_safe = safety_score >= self.safety_threshold
        
        # Determine recommendation
        recommendation = self._get_recommendation(
            is_hidden_gem, is_verified, is_safe, 
            hidden_gem_score, safety_score, collab_auth_score
        )
        
        # Calculate confidence
        confidence = self._calculate_confidence(
            hidden_gem_score, safety_score, collab_auth_score
        )
        
        # Build result
        result = PlaceResult(
            place_id=place_data.get("place_id", ["unknown"])[0] if "place_id" in place_data.columns else "unknown",
            name=place_data.get("name", ["Unknown"])[0] if "name" in place_data.columns else "Unknown",
            hidden_gem_score=hidden_gem_score,
            safety_score=safety_score,
            collab_auth_score=collab_auth_score,
            is_hidden_gem=is_hidden_gem,
            is_verified=is_verified,
            is_safe=is_safe,
            recommendation=recommendation,
            confidence=confidence,
            details={
                "hidden_gem_threshold": self.hidden_gem_threshold,
                "safety_threshold": self.safety_threshold,
                "collab_auth_threshold": self.collab_auth_threshold,
                "meets_all_criteria": is_hidden_gem and is_verified and is_safe,
                "raw_predictions": predictions
            }
        )
        
        return result
    
    def analyze_places_batch(self, places_df: pd.DataFrame) -> List[PlaceResult]:
        """
        Analyze multiple places and return results.
        
        Args:
            places_df: DataFrame with multiple places
        
        Returns:
            List of PlaceResult objects
        """
        results = []
        
        for idx, row in places_df.iterrows():
            # Convert row to DataFrame for model input
            place_data = pd.DataFrame([row])
            
            try:
                result = self.analyze_place(place_data)
                results.append(result)
            except Exception as e:
                logger.warning(f"Error analyzing place at index {idx}: {e}")
                continue
        
        return results
    
    def filter_hidden_gems(self, places_df: pd.DataFrame, 
                           min_score: float = None) -> pd.DataFrame:
        """
        Filter places to only include those that qualify as hidden gems.
        
        Args:
            places_df: DataFrame with all places
            min_score: Minimum hidden gem score (overrides default threshold)
        
        Returns:
            Filtered DataFrame with only hidden gems
        """
        threshold = min_score if min_score is not None else self.hidden_gem_threshold
        
        results = self.analyze_places_batch(places_df)
        
        # Filter places that qualify
        gem_place_ids = [
            r.place_id for r in results 
            if r.hidden_gem_score >= threshold
        ]
        
        # Return filtered DataFrame
        if "place_id" in places_df.columns:
            return places_df[places_df["place_id"].isin(gem_place_ids)]
        else:
            return places_df.iloc[[
                i for i, r in enumerate(results) 
                if r.hidden_gem_score >= threshold
            ]]
    
    def verify_collaborator(self, collaborator_data: pd.DataFrame) -> Dict:
        """
        Verify a collaborator's place and determine listing eligibility.
        
        Args:
            collaborator_data: DataFrame with collaborator place features
        
        Returns:
            Dictionary with verification results
        """
        result = self.analyze_place(collaborator_data)
        
        # Determine if collaborator can list
        can_list = result.is_verified and result.is_safe
        
        # Determine listing type
        listing_type = None
        if can_list:
            if result.is_hidden_gem:
                listing_type = "hidden_gem"
            else:
                listing_type = "verified"
        
        # Build verification response
        verification = {
            "can_list": can_list,
            "listing_type": listing_type,
            "scores": {
                "hidden_gem": result.hidden_gem_score,
                "safety": result.safety_score,
                "collab_auth": result.collab_auth_score
            },
            "flags": {
                "is_hidden_gem": result.is_hidden_gem,
                "is_verified": result.is_verified,
                "is_safe": result.safety_score >= self.safety_threshold
            },
            "recommendation": result.recommendation,
            "confidence": result.confidence,
            "message": self._get_verification_message(result, can_list, listing_type),
            "details": result.details
        }
        
        return verification
    
    def get_recommendations_for_user(self, user_preferences: Dict,
                                      places_df: pd.DataFrame,
                                      max_results: int = 10) -> List[Dict]:
        """
        Get personalized recommendations for a user.
        
        Args:
            user_preferences: User's travel preferences
            places_df: DataFrame with all available places
            max_results: Maximum number of recommendations
        
        Returns:
            List of recommended places with scores
        """
        # Filter by user preferences if provided
        filtered_places = places_df.copy()
        
        if "categories" in user_preferences:
            # Filter by preferred categories
            preferred = user_preferences["categories"]
            if "categories" in filtered_places.columns:
                filtered_places = filtered_places[
                    filtered_places["categories"].apply(
                        lambda x: any(cat in str(x) for cat in preferred)
                    )
                ]
        
        if "max_price" in user_preferences:
            if "price_level" in filtered_places.columns:
                filtered_places = filtered_places[
                    filtered_places["price_level"] <= user_preferences["max_price"]
                ]
        
        if "min_rating" in user_preferences:
            if "rating" in filtered_places.columns:
                filtered_places = filtered_places[
                    filtered_places["rating"] >= user_preferences["min_rating"]
                ]
        
        # Analyze remaining places
        results = self.analyze_places_batch(filtered_places)
        
        # Sort by hidden gem score (prefer hidden gems)
        sorted_results = sorted(
            results, 
            key=lambda x: (x.is_hidden_gem, x.hidden_gem_score, x.safety_score),
            reverse=True
        )
        
        # Take top results
        top_results = sorted_results[:max_results]
        
        # Convert to dictionaries
        recommendations = []
        for result in top_results:
            rec = {
                "place_id": result.place_id,
                "name": result.name,
                "hidden_gem_score": result.hidden_gem_score,
                "safety_score": result.safety_score,
                "is_hidden_gem": result.is_hidden_gem,
                "recommendation": result.recommendation,
                "confidence": result.confidence
            }
            recommendations.append(rec)
        
        return recommendations
    
    def _get_recommendation(self, is_hidden_gem: bool, is_verified: bool,
                           is_safe: bool, gem_score: float, 
                           safety_score: float, auth_score: float) -> str:
        """Determine recommendation type based on scores"""
        
        if is_hidden_gem and is_verified and is_safe:
            return "hidden_gem"  # Best case: verified hidden gem
        elif is_hidden_gem and is_safe:
            return "hidden_gem_unverified"  # Hidden gem but not verified
        elif is_verified and is_safe:
            return "verified"  # Verified but not a hidden gem
        elif is_safe:
            return "regular"  # Safe but not special
        else:
            return "rejected"  # Doesn't meet safety standards
    
    def _calculate_confidence(self, gem_score: float, safety_score: float,
                             auth_score: float) -> float:
        """Calculate confidence score based on all predictions"""
        
        # Weighted average
        confidence = (
            gem_score * 0.4 +      # Hidden gem importance
            safety_score * 0.3 +   # Safety importance
            auth_score * 100 * 0.3 # Auth importance (scale to 0-100)
        )
        
        # Normalize to 0-1
        return min(1.0, confidence / 100)
    
    def _get_verification_message(self, result: PlaceResult, 
                                  can_list: bool, listing_type: Optional[str]) -> str:
        """Generate human-readable verification message"""
        
        if can_list and listing_type == "hidden_gem":
            return (
                f"Great news! Your place qualifies as a Hidden Gem "
                f"(Score: {result.hidden_gem_score:.1f}/100). "
                f"It will be featured in our hidden gem recommendations."
            )
        elif can_list and listing_type == "verified":
            return (
                f"Your place is verified and safe "
                f"(Auth: {result.collab_auth_score:.2f}, Safety: {result.safety_score:.1f}). "
                f"It will be listed as a verified location."
            )
        elif not result.is_verified:
            return (
                f"Your place could not be verified "
                f"(Auth Score: {result.collab_auth_score:.2f}). "
                f"Please ensure all documentation is complete."
            )
        elif result.safety_score < self.safety_threshold:
            return (
                f"Your place does not meet our safety standards "
                f"(Safety Score: {result.safety_score:.1f}). "
                f"Please address safety concerns."
            )
        else:
            return "Your place is under review. We'll update you soon."
    
    def update_thresholds(self, hidden_gem: float = None, 
                         safety: float = None, 
                         collab_auth: float = None):
        """Update classification thresholds"""
        if hidden_gem is not None:
            self.hidden_gem_threshold = hidden_gem
        if safety is not None:
            self.safety_threshold = safety
        if collab_auth is not None:
            self.collab_auth_threshold = collab_auth
        
        logger.info(f"Thresholds updated: gem={self.hidden_gem_threshold}, "
                    f"safety={self.safety_threshold}, auth={self.collab_auth_threshold}")
    
    def get_model_accuracy(self) -> Dict:
        """Get model accuracy metrics"""
        if self.metrics is None:
            return {"error": "No metrics available"}
        
        return self.metrics


# Convenience function for quick analysis
def analyze_place(place_data: pd.DataFrame, 
                  models_dir: str = "D:/sidequest_model/models") -> PlaceResult:
    """
    Quick function to analyze a place.
    
    Args:
        place_data: DataFrame with place features
        models_dir: Path to trained models
    
    Returns:
        PlaceResult with analysis
    """
    engine = SideQuestInference(models_dir)
    return engine.analyze_place(place_data)


def verify_collaborator(collaborator_data: pd.DataFrame,
                       models_dir: str = "D:/sidequest_model/models") -> Dict:
    """
    Quick function to verify a collaborator.
    
    Args:
        collaborator_data: DataFrame with collaborator features
        models_dir: Path to trained models
    
    Returns:
        Verification dictionary
    """
    engine = SideQuestInference(models_dir)
    return engine.verify_collaborator(collaborator_data)


# CLI interface for Express server integration
if __name__ == "__main__":
    import argparse
    import sys
    
    parser = argparse.ArgumentParser(description="SideQuest ML Inference CLI")
    parser.add_argument("--mode", required=True, 
                       choices=["analyze", "verify", "gems", "fake-detect"],
                       help="Inference mode")
    parser.add_argument("--name", default="Unknown", help="Place name")
    parser.add_argument("--category", default="Nature", help="Place category")
    parser.add_argument("--description", default="", help="Place description")
    parser.add_argument("--lat", type=float, default=15.5, help="Latitude")
    parser.add_argument("--lng", type=float, default=73.8, help="Longitude")
    parser.add_argument("--reviews", type=int, default=50, help="Review count")
    parser.add_argument("--rating", type=float, default=4.5, help="Rating")
    parser.add_argument("--price", type=int, default=2, help="Price range (1-4)")
    parser.add_argument("--distance", type=float, default=10, help="Distance in km")
    parser.add_argument("--text", default="", help="Review text (for fake-detect)")
    parser.add_argument("--user-reviews", type=int, default=10, help="User review count")
    parser.add_argument("--biz-reviews", type=int, default=100, help="Business review count")
    parser.add_argument("--limit", type=int, default=10, help="Max results for gems")
    parser.add_argument("--min-score", type=float, default=8.0, help="Min gem score")
    
    args = parser.parse_args()
    
    try:
        engine = SideQuestInference()
        
        if args.mode == "analyze":
            # Create place data with all required features
            review_count_log = np.log1p(args.reviews)
            is_sweet_spot = 1 if 3.5 <= args.rating <= 4.5 else 0
            is_budget_friendly = 1 if args.price <= 2 else 0
            has_reviews = 1 if args.reviews > 0 else 0
            is_open = 1
            category_count = 1
            
            place_data = pd.DataFrame([{
                "name": args.name,
                "category": args.category,
                "latitude": args.lat,
                "longitude": args.lng,
                "review_count": args.reviews,
                "rating": args.rating,
                "price_level": args.price,
                "distance_km": args.distance,
                # Hidden gem features
                "review_count_log": review_count_log,
                "category_count": category_count,
                "is_sweet_spot": is_sweet_spot,
                "is_budget_friendly": is_budget_friendly,
                "has_reviews": has_reviews,
                "is_open": is_open,
                "is_mainstream": 0,
                "is_tourist_trap": 0,
                "review_text_mean_len": 50.0,
                "review_text_max_len": 100.0,
                "review_text_mean_words": 8.0,
                "review_exclamation_mean": 0.1,
                "review_uppercase_mean": 0.05,
                "review_useful_sum": args.reviews * 0.3,
                "review_funny_sum": args.reviews * 0.1,
                "review_cool_sum": args.reviews * 0.2,
                "review_votes_total": args.reviews * 0.6,
                "has_wifi": 1,
                "has_parking": 1,
                "hours_per_week": 60.0,
                "city_avg_rating": 4.0,
                "city_avg_reviews": 100.0,
                "city_business_count": 50.0,
                "rating_vs_city": args.rating - 4.0,
                "review_ratio_vs_city": args.reviews / 100.0,
                # Safety features
                "pharmacy_distance": 2.0,
                "hospital_distance": 5.0,
                "has_pharmacy_nearby": 1,
                "has_hospital_nearby": 1,
                "violent_crime_rate": 0.02,
                "property_crime_rate": 0.05,
                # Collaboration auth features
                "has_business_registration": 1,
                "has_phone": 1,
                "has_email": 1,
                "has_website": 1,
                "has_instagram": 1,
                "has_facebook": 1,
                "instagram_followers": 500,
                "facebook_likes": 300,
                "social_media_age_days": 365,
                "has_unique_photos": 1,
                "platform_count": 3,
                "on_google_maps": 1,
                "on_yelp": 1,
                "on_tripadvisor": 1,
                "total_reviews": args.reviews,
                "avg_rating": args.rating,
                "review_velocity": args.reviews / 12.0,
                "by_appointment": 0,
                "competitor_density": np.random.uniform(0.1, 0.9),
                "geographic_isolation": np.random.uniform(0.3, 0.95),
                "category_rarity": np.random.uniform(0.2, 0.8),
                "women_safety_index": np.random.uniform(0.6, 0.95),
                "solo_traveler_rating": np.random.uniform(0.5, 0.9),
            }])
            
            result = engine.analyze_place(place_data)
            
            def convert_numpy(obj):
                if isinstance(obj, (np.floating, np.integer)):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                elif isinstance(obj, dict):
                    return {k: convert_numpy(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_numpy(i) for i in obj]
                return obj
            
            output = {
                "success": True,
                "place_id": str(result.place_id),
                "name": str(result.name),
                "hidden_gem_score": float(result.hidden_gem_score),
                "safety_score": float(result.safety_score),
                "collab_auth_score": float(result.collab_auth_score),
                "is_hidden_gem": bool(result.is_hidden_gem),
                "is_verified": bool(result.is_verified),
                "is_safe": bool(result.is_safe),
                "recommendation": str(result.recommendation),
                "confidence": float(result.confidence),
                "details": convert_numpy(result.details),
            }
        
        elif args.mode == "verify":
            collab_data = pd.DataFrame([{
                "name": args.name,
                "category": args.category,
                "description": args.description,
                "latitude": args.lat,
                "longitude": args.lng,
                "review_count": args.reviews,
                "rating": args.rating,
                "price_level": args.price,
                "review_count_log": np.log1p(args.reviews),
                "category_count": 1,
                "is_sweet_spot": 1 if 3.5 <= args.rating <= 4.5 else 0,
                "is_budget_friendly": 1 if args.price <= 2 else 0,
                "has_reviews": 1 if args.reviews > 0 else 0,
                "is_open": 1,
                "is_mainstream": 0,
                "is_tourist_trap": 0,
                "review_text_mean_len": 50.0,
                "review_text_max_len": 100.0,
                "review_text_mean_words": 8.0,
                "review_exclamation_mean": 0.1,
                "review_uppercase_mean": 0.05,
                "review_useful_sum": args.reviews * 0.3,
                "review_funny_sum": args.reviews * 0.1,
                "review_cool_sum": args.reviews * 0.2,
                "review_votes_total": args.reviews * 0.6,
                "has_wifi": 1,
                "has_parking": 1,
                "hours_per_week": 60.0,
                "city_avg_rating": 4.0,
                "city_avg_reviews": 100.0,
                "city_business_count": 50.0,
                "rating_vs_city": args.rating - 4.0,
                "review_ratio_vs_city": args.reviews / 100.0,
                "pharmacy_distance": 2.0,
                "hospital_distance": 5.0,
                "has_pharmacy_nearby": 1,
                "has_hospital_nearby": 1,
                "violent_crime_rate": 0.02,
                "property_crime_rate": 0.05,
                "has_business_registration": 1,
                "has_phone": 1,
                "has_email": 1,
                "has_website": 1,
                "has_instagram": 1,
                "has_facebook": 1,
                "instagram_followers": 500,
                "facebook_likes": 300,
                "social_media_age_days": 365,
                "has_unique_photos": 1,
                "platform_count": 3,
                "on_google_maps": 1,
                "on_yelp": 1,
                "on_tripadvisor": 1,
                "total_reviews": args.reviews,
                "avg_rating": args.rating,
                "review_velocity": args.reviews / 12.0,
                "by_appointment": 0,
                "competitor_density": np.random.uniform(0.1, 0.9),
                "geographic_isolation": np.random.uniform(0.3, 0.95),
                "category_rarity": np.random.uniform(0.2, 0.8),
                "women_safety_index": np.random.uniform(0.6, 0.95),
                "solo_traveler_rating": np.random.uniform(0.5, 0.9),
            }])
            
            raw_output = engine.verify_collaborator(collab_data)
            
            def convert_numpy(obj):
                if isinstance(obj, (np.floating, np.integer)):
                    return float(obj)
                elif isinstance(obj, np.ndarray):
                    return obj.tolist()
                elif isinstance(obj, dict):
                    return {k: convert_numpy(v) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [convert_numpy(i) for i in obj]
                return obj
            
            output = convert_numpy(raw_output)
            output["success"] = True
        
        elif args.mode == "gems":
            # Load data and filter gems
            data_path = Path("D:/sidequest_model/data/merged_places.csv")
            if data_path.exists():
                places_df = pd.read_csv(data_path, nrows=1000)
                filtered = engine.filter_hidden_gems(places_df, min_score=args.min_score)
                top_places = filtered.head(args.limit)
                
                gems = []
                for _, row in top_places.iterrows():
                    gems.append({
                        "name": row.get("name", "Unknown"),
                        "category": row.get("categories", "Nature"),
                        "rating": float(row.get("rating", 4.5)),
                        "review_count": int(row.get("review_count", 50)),
                    })
                
                output = {"success": True, "gems": gems, "count": len(gems)}
            else:
                output = {"success": False, "error": "Data file not found"}
        
        elif args.mode == "fake-detect":
            # Simple fake detection based on text analysis
            text = args.text.lower()
            suspicious_words = ["fake", "bought", "paid", "incentive", "free product"]
            suspicious_count = sum(1 for word in suspicious_words if word in text)
            
            is_fake = suspicious_count > 0 or args.rating > 4.8
            confidence = min(0.95, 0.5 + suspicious_count * 0.15)
            
            output = {
                "success": True,
                "is_fake": is_fake,
                "confidence": confidence,
                "suspicious_words_found": suspicious_count,
                "recommendation": "Reject" if is_fake else "Accept",
            }
        
        else:
            output = {"success": False, "error": f"Unknown mode: {args.mode}"}
        
        print(json.dumps(output))
    
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
