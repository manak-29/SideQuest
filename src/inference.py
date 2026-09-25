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


# ---------------------------------------------------------------------------
# India inference context: real aggregates from the training data (cached)
# ---------------------------------------------------------------------------
_CONTEXT = None


def get_india_context() -> Dict:
    """Load feature medians + per-city stats from india_places.csv (once)."""
    global _CONTEXT
    if _CONTEXT is not None:
        return _CONTEXT

    csv_path = Path("D:/sidequest_model/data/india_places.csv")
    usecols = ["city", "stars", "review_count", "price_level", "cost_inr",
               "competitor_density", "area_business_count", "dist_from_center",
               "category_rarity", "city_avg_rating", "city_avg_reviews",
               "city_business_count", "violent_crime_rate", "property_crime_rate",
               "hospital_distance", "police_distance"]
    if csv_path.exists():
        df = pd.read_csv(csv_path, usecols=usecols)
        ctx = {
            "global": {
                "price_level": float(df["price_level"].median()),
                "cost_inr": float(df["cost_inr"].median()),
                "competitor_density": float(df["competitor_density"].median()),
                "area_business_count": float(df["area_business_count"].median()),
                "dist_from_center": float(df["dist_from_center"].median()),
                "category_rarity": float(df["category_rarity"].median()),
                "city_avg_rating": float(df["stars"].mean()),
                "city_avg_reviews": float(df["review_count"].median()),
                "city_business_count": float(df["city_business_count"].median()),
                "violent_crime_rate": float(df["violent_crime_rate"].median()),
                "property_crime_rate": float(df["property_crime_rate"].median()),
                "hospital_distance": float(df["hospital_distance"].median()),
                "police_distance": float(df["police_distance"].median()),
                "review_count": float(df["review_count"].median()),
            },
            "cities": {},
        }
        g = df.groupby("city").agg(
            city_avg_rating=("stars", "mean"),
            city_avg_reviews=("review_count", "median"),
            city_business_count=("city_business_count", "median"),
            violent_crime_rate=("violent_crime_rate", "median"),
            property_crime_rate=("property_crime_rate", "median"),
        ).round(3)
        ctx["cities"] = g.to_dict("index")
    else:
        ctx = {"global": {}, "cities": {}}
    _CONTEXT = ctx
    return ctx


def build_india_features(args) -> pd.DataFrame:
    """Build a COMPLETE India feature row covering all 3 unified tasks."""
    ctx = get_india_context()["global"]
    g = ctx  # shorthand; defaults if CSV missing
    city_stats = get_india_context()["cities"].get(
        str(getattr(args, "city", "") or ""), {})

    def pick(key, default):
        return float(city_stats.get(key, g.get(key, default)))

    stars = float(args.rating)
    reviews = int(args.reviews)
    review_count_log = float(np.log1p(reviews))
    city_avg_rating = pick("city_avg_rating", 3.7)
    city_avg_reviews = max(pick("city_avg_reviews", 50.0), 1.0)
    is_mainstream = 1 if reviews > 200 else 0
    has_infra = 1
    hosp_d = pick("hospital_distance", 3.0)
    pol_d = pick("police_distance", 3.0)

    return pd.DataFrame([{
        "name": args.name,
        "category": args.category,
        # common
        "stars": stars,
        "review_count": reviews,
        "review_count_log": review_count_log,
        "price_level": float(args.price),
        "category_count": 1,
        "is_sweet_spot": 1 if 3.5 <= stars <= 4.5 else 0,
        "is_budget_friendly": 1 if args.price <= 2 else 0,
        # hidden_gem
        "latitude": float(args.lat),
        "longitude": float(args.lng),
        "cost_inr": float(getattr(args, "cost_inr", 0) or pick("cost_inr", 300.0)),
        "is_mainstream": is_mainstream,
        "is_tourist_trap": 1 if reviews > 1000 else 0,
        "competitor_density": pick("competitor_density", 0.3),
        "area_business_count": pick("area_business_count", 40.0),
        "dist_from_center": float(getattr(args, "distance", 10.0)),
        "category_rarity": pick("category_rarity", 0.5),
        "has_reviews": 1 if reviews > 0 else 0,
        "is_open": 1,
        "source_swiggy": 0,
        "city_avg_rating": city_avg_rating,
        "city_avg_reviews": city_avg_reviews,
        "city_business_count": pick("city_business_count", 100.0),
        "rating_vs_city": stars - city_avg_rating,
        "review_ratio_vs_city": reviews / city_avg_reviews,
        "has_phone": int(getattr(args, "has_phone", 1)),
        "has_online_order": int(getattr(args, "has_online_order", 1)),
        "has_book_table": int(getattr(args, "has_book_table", 0)),
        # safety_score
        "hospital_distance": hosp_d,
        "police_distance": pol_d,
        "has_hospital_nearby": 1 if hosp_d <= 2.0 else 0,
        "has_police_nearby": 1 if pol_d <= 2.0 else 0,
        "has_infra_data": has_infra,
        "violent_crime_rate": pick("violent_crime_rate", 15.0),
        "property_crime_rate": pick("property_crime_rate", 8.0),
        # collaboration_auth (new listing: no parsed review stats yet -> neutral)
        "rev_n": 0.0,
        "rev_stars_mean": 0.0,
        "rev_stars_std": 0.0,
        "rev_rating_mismatch": 0.0,
        "rev_avg_words": 0.0,
    }])


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


def run_fake_detection(text: str, rating: float) -> Dict:
    """Real text model: models/fake_detection.pkl (TF-IDF + 17 linguistic)."""
    import joblib
    import sys as _sys
    _sys.path.insert(0, "D:/sidequest_model")
    from fake_features import FEATURE_COLS, review_features  # type: ignore

    bundle = joblib.load("D:/sidequest_model/models/fake_detection.pkl")
    clf, char_vec, word_vec = bundle["clf"], bundle["char_vec"], bundle["word_vec"]

    from scipy.sparse import csr_matrix, hstack
    X_char = char_vec.transform([text])
    X_word = word_vec.transform([text])
    feats = review_features(text, rating)
    X_ling = np.array([[feats[c] for c in FEATURE_COLS]], dtype=float)
    X = hstack([X_char, X_word, csr_matrix(X_ling)]).tocsr()

    p_fake = float(clf.predict_proba(X)[0, 1])
    is_fake = p_fake >= 0.5
    return {
        "is_fake": bool(is_fake),
        "confidence": round(p_fake if is_fake else 1 - p_fake, 4),
        "p_fake": round(p_fake, 4),
        "linguistic_features": {k: feats[k] for k in
                                ["char_count", "word_count", "exclamation_count",
                                 "uppercase_word_count", "unique_word_ratio",
                                 "superlative_count"]},
        "recommendation": "Reject" if is_fake else "Accept",
        "model": "char+word TF-IDF + 17 linguistic features (acc 95.4%)",
    }


def run_match(user_a_json: str, user_b_json: str) -> Dict:
    """Matchmaking inference: models/matchmaking.pkl (hybrid 20-feature)."""
    import joblib
    import sys as _sys
    _sys.path.insert(0, "D:/sidequest_model")
    from match_india import score_pair  # type: ignore

    bundle = joblib.load("D:/sidequest_model/models/matchmaking.pkl")
    a = json.loads(user_a_json)
    b = json.loads(user_b_json)
    result = score_pair(bundle, a, b)
    return {"success": True, **result}


# CLI interface for Express server integration
if __name__ == "__main__":
    import argparse
    import sys

    parser = argparse.ArgumentParser(description="SideQuest ML Inference CLI")
    parser.add_argument("--mode", required=True,
                        choices=["analyze", "verify", "gems", "fake-detect", "match"],
                        help="Inference mode")
    parser.add_argument("--name", default="Unknown", help="Place name")
    parser.add_argument("--category", default="", help="Place category filter (gems mode)")
    parser.add_argument("--description", default="", help="Place description")
    parser.add_argument("--city", default="", help="City (improves context stats)")
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
    parser.add_argument("--min-score", type=float, default=60.0,
                        help="Min gem score (0-100; values<10 treated as 0-10 scale)")
    parser.add_argument("--user-a", default="{}", help="User A JSON (match mode)")
    parser.add_argument("--user-b", default="{}", help="User B JSON (match mode)")

    args = parser.parse_args()

    try:
        if args.mode == "match":
            output = run_match(args.user_a, args.user_b)
            print(json.dumps(output))
            sys.exit(0)

        engine = SideQuestInference()

        if args.mode == "analyze":
            place_data = build_india_features(args)
            result = engine.analyze_place(place_data)

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
            collab_data = build_india_features(args)
            collab_data["description"] = args.description
            raw_output = engine.verify_collaborator(collab_data)
            output = convert_numpy(raw_output)
            output["success"] = True

        elif args.mode == "gems":
            # India data: predict in ONE batch, filter, top-N
            data_path = Path("D:/sidequest_model/data/india_places.csv")
            if not data_path.exists():
                output = {"success": False, "error": "india_places.csv not found"}
            else:
                df = pd.read_csv(data_path, low_memory=False)
                df["source_swiggy"] = (df["source"] == "swiggy").astype(int)
                threshold = args.min_score
                if threshold < 10:  # UI passes 0-10 scale -> convert to 0-100
                    threshold = threshold * 10
                scores = engine.model.predict(df, task="hidden_gem")
                safety = engine.model.predict(df, task="safety_score")
                df["_gem"] = scores
                df["_safety"] = safety

                mask = df["_gem"] >= threshold
                if args.category:
                    mask &= df["categories"].fillna("").str.contains(
                        args.category, case=False, na=False)
                filtered = df[mask].sort_values("_gem", ascending=False)
                top = filtered.head(args.limit)

                gems = []
                for _, row in top.iterrows():
                    gem = float(min(100.0, row["_gem"]))
                    gems.append({
                        "place_id": str(row["place_id"]),
                        "name": str(row["name"]),
                        "city": str(row["city"]),
                        "category": str(row["primary_category"]),
                        "cuisines": str(row["categories"])[:80],
                        "rating": float(row["stars"]),
                        "review_count": int(row["review_count"]),
                        "hidden_gem_score": round(gem, 1),
                        "gem_score_10": round(gem / 10.0, 1),
                        "safety_score": round(float(row["_safety"]), 1),
                        "price_level": float(row["price_level"]),
                        "lat": float(row["latitude"]),
                        "lng": float(row["longitude"]),
                    })
                output = {"success": True, "gems": gems, "count": len(gems),
                          "threshold": threshold,
                          "qualifying_total": int(mask.sum())}

        elif args.mode == "fake-detect":
            output = run_fake_detection(args.text, args.rating)

        else:
            output = {"success": False, "error": f"Unknown mode: {args.mode}"}

        print(json.dumps(output))

    except Exception as e:
        logger.exception("inference failed")
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
