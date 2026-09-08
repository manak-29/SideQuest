"""
SideQuest Unified ML Model
Single model that handles multiple tasks:
1. Hidden Gem Detection
2. Solo Group Matching
3. Fake Review Detection
4. Safety Scoring
5. Collaboration Authentication
"""
import numpy as np
import pandas as pd
import pickle
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field
import logging

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, mean_squared_error, classification_report,
    confusion_matrix
)
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier
from sklearn.impute import SimpleImputer
import xgboost as xgb
import lightgbm as lgb

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelMetrics:
    """Store metrics for each task"""
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    f1: float = 0.0
    auc_roc: float = 0.0
    rmse: float = 0.0
    r2: float = 0.0
    
    def to_dict(self) -> Dict:
        return {
            "accuracy": self.accuracy,
            "precision": self.precision,
            "recall": self.recall,
            "f1": self.f1,
            "auc_roc": self.auc_roc,
            "rmse": self.rmse,
            "r2": self.r2
        }

@dataclass 
class TaskConfig:
    """Configuration for each task"""
    task_type: str  # "classification" or "regression"
    target_column: str
    features: List[str]
    weight: float = 1.0
    model_params: Dict = field(default_factory=dict)

class UnifiedSideQuestModel:
    """
    Unified model that handles all SideQuest tasks.
    Uses multi-task learning with shared representations.
    """
    
    def __init__(self, config: Dict = None):
        self.config = config or self._default_config()
        
        # Task-specific models
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.metrics = {}
        
        # Shared components
        self.feature_names = []
        self.feature_names_per_task = {}
        self.is_trained = False
        
        # Imputer for handling missing values
        self.imputer = None
        
        # Task configurations
        self.task_configs = self._setup_task_configs()
    
    def _default_config(self) -> Dict:
        return {
            "random_state": 42,
            "test_size": 0.25,
            "cv_folds": 5,
            "n_estimators": 800,
            "max_depth": 10,
            "learning_rate": 0.03,
            "early_stopping_rounds": 30,
            "use_xgboost": True,
            "use_lightgbm": False
        }
    
    def _setup_task_configs(self) -> Dict[str, TaskConfig]:
        """Define configurations for each task"""
        
        # Common features used across tasks
        common_features = [
            "rating", "review_count", "review_count_log", "price_level",
            "category_count", "photo_count", "has_photos",
            "is_sweet_spot", "is_budget_friendly",
        ]
        
        configs = {
            "hidden_gem": TaskConfig(
                task_type="regression",
                target_column="hidden_gem_score",
                features=common_features + [
                    "latitude", "longitude",
                    "is_mainstream", "is_tourist_trap",
                    "review_text_mean_len", "review_text_max_len", "review_text_mean_words",
                    "review_exclamation_mean", "review_uppercase_mean",
                    "review_useful_sum", "review_funny_sum", "review_cool_sum", "review_votes_total",
                    "has_reviews", "is_open", "has_wifi", "has_parking",
                    "hours_per_week",
                    "city_avg_rating", "city_avg_reviews", "city_business_count",
                    "rating_vs_city", "review_ratio_vs_city",
                ],
                weight=0.30
            ),
            
            "solo_matching": TaskConfig(
                task_type="regression",
                target_column="match_score",
                features=common_features + [
                    "user_age", "user_rating", "user_verified",
                    "interest_overlap", "same_city", "language_count",
                    "availability_days"
                ],
                weight=0.20
            ),
            
            "fake_detection": TaskConfig(
                task_type="classification",
                target_column="is_fake",
                features=[
                    "text_length", "word_count", "avg_word_length",
                    "sentence_count", "exclamation_count", "question_count",
                    "comma_count", "uppercase_ratio",
                    "fake_indicators_count", "real_indicators_count",
                    "positive_words", "negative_words", "neutral_words",
                    "unique_word_ratio", "has_numbers", "has_emojis",
                    "rating"
                ],
                weight=0.20
            ),
            
            "safety_score": TaskConfig(
                task_type="regression",
                target_column="safety_score",
                features=common_features + [
                    "has_reviews", "is_open",
                    "pharmacy_distance", "hospital_distance",
                    "has_pharmacy_nearby", "has_hospital_nearby",
                    "violent_crime_rate", "property_crime_rate",
                ],
                weight=0.15
            ),
            
            "collaboration_auth": TaskConfig(
                task_type="classification",
                target_column="is_authentic",
                features=[
                    "has_business_registration", "has_phone", "has_email",
                    "has_website", "has_instagram", "has_facebook",
                    "instagram_followers", "facebook_likes",
                    "social_media_age_days",
                    "has_unique_photos", "platform_count",
                    "on_google_maps", "on_yelp", "on_tripadvisor",
                    "total_reviews", "avg_rating", "review_velocity",
                    "has_wifi", "has_parking", "by_appointment",
                    "hours_per_week", "is_open",
                ],
                weight=0.15
            )
        }
        
        return configs
    
    def _create_model(self, task_type: str, params: Dict = None) -> Any:
        """Create model based on task type and configuration"""
        if params is None:
            params = {}
        
        if task_type == "classification":
            if self.config.get("use_xgboost", True):
                return xgb.XGBClassifier(
                    n_estimators=params.get("n_estimators", self.config["n_estimators"]),
                    max_depth=params.get("max_depth", self.config["max_depth"]),
                    learning_rate=params.get("learning_rate", self.config["learning_rate"]),
                    subsample=0.8,
                    colsample_bytree=0.8,
                    min_child_weight=3,
                    gamma=0.1,
                    reg_alpha=0.1,
                    reg_lambda=1.0,
                    random_state=self.config["random_state"],
                    use_label_encoder=False,
                    eval_metric="logloss"
                )
            else:
                return RandomForestClassifier(
                    n_estimators=params.get("n_estimators", 500),
                    max_depth=params.get("max_depth", 15),
                    min_samples_split=5,
                    min_samples_leaf=2,
                    random_state=self.config["random_state"]
                )
        
        else:  # regression
            if self.config.get("use_xgboost", True):
                return xgb.XGBRegressor(
                    n_estimators=params.get("n_estimators", self.config["n_estimators"]),
                    max_depth=params.get("max_depth", self.config["max_depth"]),
                    learning_rate=params.get("learning_rate", self.config["learning_rate"]),
                    subsample=0.8,
                    colsample_bytree=0.8,
                    min_child_weight=3,
                    gamma=0.1,
                    reg_alpha=0.1,
                    reg_lambda=1.0,
                    random_state=self.config["random_state"]
                )
            else:
                return RandomForestRegressor(
                    n_estimators=params.get("n_estimators", 500),
                    max_depth=params.get("max_depth", 15),
                    min_samples_split=5,
                    min_samples_leaf=2,
                    random_state=self.config["random_state"]
                )
    
    def _prepare_features(self, data: pd.DataFrame, 
                          feature_names: List[str]) -> np.ndarray:
        """Prepare features with imputation and scaling"""
        # Select features
        available_features = [f for f in feature_names if f in data.columns]
        X = data[available_features].copy()
        
        # Handle missing values
        if not hasattr(self, 'imputer'):
            self.imputer = SimpleImputer(strategy='median')
            X_imputed = self.imputer.fit_transform(X)
        else:
            X_imputed = self.imputer.transform(X)
        
        # Scale features
        task_key = feature_names[0] if feature_names else "default"
        if task_key not in self.scalers:
            self.scalers[task_key] = StandardScaler()
            X_scaled = self.scalers[task_key].fit_transform(X_imputed)
        else:
            X_scaled = self.scalers[task_key].transform(X_imputed)
        
        return X_scaled
    
    def _calculate_hidden_gem_score(self, data: pd.DataFrame) -> np.ndarray:
        """Calculate hidden gem score as target variable"""
        scores = np.zeros(len(data))
        
        for i, row in data.iterrows():
            score = 0
            
            # Rating sweet spot (4.0-4.5)
            rating = row.get("rating", 0)
            if 4.0 <= rating <= 4.5:
                score += 30
            elif rating > 4.5:
                score -= 10
            elif rating < 4.0:
                score -= 5
            
            # Review count (less than 200 = hidden gem)
            review_count = row.get("review_count", 0)
            if review_count < 200:
                score += 25
            elif review_count < 500:
                score += 10
            elif review_count > 1000:
                score -= 10
            
            # Local language reviews
            real_indicators = row.get("review_real_indicators_count", 0)
            if real_indicators > 2:
                score += 20
            
            # Real photos
            has_photos = row.get("has_photos", 0)
            photo_count = row.get("photo_count", 0)
            if has_photos and photo_count > 2:
                score += 15
            
            # Cross-platform (simplified)
            if row.get("source") in ["yelp", "google"]:
                score += 10
            
            # Normalize to 0-100
            scores[i] = max(0, min(100, score))
        
        return scores
    
    def _calculate_safety_score(self, data: pd.DataFrame) -> np.ndarray:
        """Calculate safety score as target variable"""
        scores = np.zeros(len(data))
        
        for i, row in data.iterrows():
            score = 50  # Base score
            
            # Has reviews
            if row.get("has_reviews", 0):
                score += 10
            
            # Has photos
            if row.get("has_photos", 0):
                score += 10
            
            # Is open
            if row.get("is_open", 1):
                score += 10
            
            # Nearby pharmacy
            if row.get("has_pharmacy_nearby", 0):
                score += 10
            
            # Nearby hospital
            if row.get("has_hospital_nearby", 0):
                score += 10
            
            # Rating factor
            rating = row.get("rating", 0)
            if 3.5 <= rating <= 4.5:
                score += 5
            
            scores[i] = min(100, score)
        
        return scores
    
    def _calculate_match_score(self, data: pd.DataFrame) -> np.ndarray:
        """Calculate solo match score as target variable"""
        scores = np.zeros(len(data))
        
        for i, row in data.iterrows():
            score = 0
            
            # City match
            if row.get("same_city", 0):
                score += 30
            
            # Interest overlap
            overlap = row.get("interest_overlap", 0)
            score += min(30, overlap * 10)
            
            # User rating
            user_rating = row.get("user_rating", 0)
            score += user_rating * 5
            
            # Verified user
            if row.get("user_verified", 0):
                score += 10
            
            # Language count
            lang_count = row.get("language_count", 0)
            score += min(10, lang_count * 3)
            
            # Normalize to 0-100
            scores[i] = min(100, max(0, score))
        
        return scores
    
    def _calculate_collaboration_auth(self, data: pd.DataFrame) -> np.ndarray:
        """Calculate collaboration authenticity as target variable"""
        labels = np.zeros(len(data))
        
        for i, row in data.iterrows():
            score = 0
            
            # Business verification
            if row.get("has_business_registration", 0):
                score += 30
            
            # Contact info
            if row.get("has_phone", 0):
                score += 10
            if row.get("has_email", 0):
                score += 5
            if row.get("has_website", 0):
                score += 5
            
            # Social media
            if row.get("has_instagram", 0):
                followers = row.get("instagram_followers", 0)
                if followers > 100:
                    score += 15
                if row.get("social_media_age_days", 0) > 180:
                    score += 10
            
            # Cross-platform
            platform_count = row.get("platform_count", 0)
            score += min(15, platform_count * 5)
            
            # Reviews
            total_reviews = row.get("total_reviews", 0)
            if total_reviews > 10:
                score += 10
            
            # Label: 1 if score >= 60, else 0
            labels[i] = 1 if score >= 60 else 0
        
        return labels
    
    def train(self, data: pd.DataFrame, 
              tasks: List[str] = None) -> Dict[str, ModelMetrics]:
        """
        Train the unified model on all tasks.
        
        Args:
            data: Input DataFrame with all features
            tasks: List of tasks to train (default: all)
        
        Returns:
            Dictionary of metrics for each task
        """
        if tasks is None:
            tasks = list(self.task_configs.keys())
        
        results = {}
        
        logger.info(f"Training unified model on {len(tasks)} tasks...")
        logger.info(f"Dataset size: {len(data)} samples")
        
        for task_name in tasks:
            logger.info(f"\n{'='*50}")
            logger.info(f"Training task: {task_name}")
            logger.info(f"{'='*50}")
            
            task_config = self.task_configs[task_name]
            
            # Calculate target variable (only if not already provided by data pipeline)
            if task_name == "hidden_gem":
                if task_config.target_column not in data.columns:
                    data[task_config.target_column] = self._calculate_hidden_gem_score(data)
            elif task_name == "safety_score":
                if task_config.target_column not in data.columns:
                    data[task_config.target_column] = self._calculate_safety_score(data)
            elif task_name == "solo_matching":
                if task_config.target_column not in data.columns:
                    data[task_config.target_column] = self._calculate_match_score(data)
            elif task_name == "collaboration_auth":
                if task_config.target_column not in data.columns:
                    data[task_config.target_column] = self._calculate_collaboration_auth(data)
            elif task_name == "fake_detection":
                # Target should already be in data
                if task_config.target_column not in data.columns:
                    logger.warning(f"Target column {task_config.target_column} not found, skipping")
                    continue
            
            # Prepare features
            available_features = [f for f in task_config.features if f in data.columns]
            
            if not available_features:
                logger.warning(f"No features available for {task_name}, skipping")
                continue
            
            X = data[available_features].copy()
            y = data[task_config.target_column].copy()
            
            # Handle inf and NaN values
            X = X.replace([np.inf, -np.inf], np.nan)
            X = X.fillna(X.median() if X.shape[0] > 0 else 0)

            # Drop rows where target is NaN (e.g., safety_score for non-US businesses)
            valid_mask = y.notna()
            if valid_mask.sum() < len(y):
                logger.warning(f"Dropping {(~valid_mask).sum()} rows with NaN target for {task_name}")
            X = X[valid_mask].reset_index(drop=True)
            y = y[valid_mask].reset_index(drop=True)

            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=self.config["test_size"],
                random_state=self.config["random_state"],
                stratify=y if task_config.task_type == "classification" else None
            )
            
            # Create and train model
            model = self._create_model(task_config.task_type, task_config.model_params)
            
            # Train with early stopping if XGBoost
            if self.config.get("use_xgboost", True) and hasattr(model, 'fit'):
                try:
                    model.fit(
                        X_train, y_train,
                        eval_set=[(X_test, y_test)],
                        verbose=False
                    )
                except:
                    model.fit(X_train, y_train)
            else:
                model.fit(X_train, y_train)
            
            # Store model
            self.models[task_name] = model
            self.feature_names = available_features
            self.feature_names_per_task[task_name] = available_features
            
            # Evaluate
            metrics = self._evaluate_model(model, X_test, y_test, task_config.task_type)
            self.metrics[task_name] = metrics
            results[task_name] = metrics
            
            # Cross-validation
            cv_scores = self._cross_validate(model, X, y, task_config.task_type)
            
            logger.info(f"\n{task_name} Results:")
            logger.info(f"  Test Accuracy: {metrics.accuracy:.4f}")
            logger.info(f"  Test F1: {metrics.f1:.4f}")
            logger.info(f"  CV Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
        
        self.is_trained = True
        
        # Save models
        self.save_models()
        
        return results
    
    def _evaluate_model(self, model: Any, X_test: np.ndarray, 
                        y_test: np.ndarray, task_type: str) -> ModelMetrics:
        """Evaluate model performance"""
        metrics = ModelMetrics()
        
        y_pred = model.predict(X_test)
        
        if task_type == "classification":
            metrics.accuracy = accuracy_score(y_test, y_pred)
            metrics.precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
            metrics.recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
            metrics.f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            
            try:
                y_prob = model.predict_proba(X_test)[:, 1]
                metrics.auc_roc = roc_auc_score(y_test, y_prob)
            except:
                metrics.auc_roc = 0.0
        else:  # regression
            metrics.rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            ss_res = np.sum((y_test - y_pred) ** 2)
            ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
            metrics.r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
            metrics.accuracy = metrics.r2  # Use R² as accuracy for regression
        
        return metrics
    
    def _cross_validate(self, model: Any, X: np.ndarray, 
                        y: np.ndarray, task_type: str) -> np.ndarray:
        """Perform cross-validation"""
        from sklearn.model_selection import KFold
        cv = KFold(n_splits=self.config["cv_folds"], 
                   shuffle=True, random_state=self.config["random_state"])
        
        if task_type == "classification":
            scoring = "f1_weighted"
        else:
            scoring = "r2"
        
        if hasattr(model, 'get_params'):
            scores = cross_val_score(model, X, y, cv=cv, scoring=scoring)
        else:
            scores = np.array([0.0])
        
        return scores
    
    def predict(self, data: pd.DataFrame, task: str) -> np.ndarray:
        """Make predictions for a specific task"""
        if not self.is_trained:
            raise ValueError("Model not trained yet. Call train() first.")
        
        if task not in self.models:
            raise ValueError(f"Task {task} not found in trained models")
        
        task_config = self.task_configs[task]
        available_features = [f for f in task_config.features if f in data.columns]
        
        X = data[available_features].copy()
        X = X.fillna(X.median() if X.shape[0] > 0 else 0)
        
        return self.models[task].predict(X)
    
    def predict_all(self, data: pd.DataFrame) -> Dict[str, np.ndarray]:
        """Make predictions for all tasks"""
        predictions = {}
        
        for task_name in self.task_configs.keys():
            if task_name in self.models:
                try:
                    predictions[task_name] = self.predict(data, task_name)
                except Exception as e:
                    logger.warning(f"Error predicting {task_name}: {e}")
        
        return predictions
    
    def save_models(self, path: str = None):
        """Save all trained models"""
        if path is None:
            path = "D:/sidequest_model/models"
        
        Path(path).mkdir(parents=True, exist_ok=True)
        
        # Save each model
        for task_name, model in self.models.items():
            model_path = Path(path) / f"{task_name}_model.pkl"
            with open(model_path, 'wb') as f:
                pickle.dump(model, f)
            logger.info(f"Saved {task_name} model to {model_path}")
        
        # Save scalers and config
        with open(Path(path) / "scalers.pkl", 'wb') as f:
            pickle.dump(self.scalers, f)
        
        with open(Path(path) / "imputer.pkl", 'wb') as f:
            pickle.dump(self.imputer, f)
        
        with open(Path(path) / "config.json", 'w') as f:
            json.dump(self.config, f, indent=2)
        
        with open(Path(path) / "metrics.json", 'w') as f:
            metrics_dict = {k: v.to_dict() for k, v in self.metrics.items()}
            json.dump(metrics_dict, f, indent=2)
        
        logger.info(f"All models saved to {path}")
    
    def load_models(self, path: str = None):
        """Load trained models"""
        if path is None:
            path = "D:/sidequest_model/models"
        
        # Load each model
        for task_name in self.task_configs.keys():
            model_path = Path(path) / f"{task_name}_model.pkl"
            if model_path.exists():
                with open(model_path, 'rb') as f:
                    self.models[task_name] = pickle.load(f)
                logger.info(f"Loaded {task_name} model")
        
        # Load scalers
        scalers_path = Path(path) / "scalers.pkl"
        if scalers_path.exists():
            with open(scalers_path, 'rb') as f:
                self.scalers = pickle.load(f)
        
        # Load imputer
        imputer_path = Path(path) / "imputer.pkl"
        if imputer_path.exists():
            with open(imputer_path, 'rb') as f:
                self.imputer = pickle.load(f)
        
        # Load metrics
        metrics_path = Path(path) / "metrics.json"
        if metrics_path.exists():
            with open(metrics_path, 'r') as f:
                metrics_dict = json.load(f)
                self.metrics = {k: ModelMetrics(**v) for k, v in metrics_dict.items()}
        
        self.is_trained = True
        logger.info("All models loaded successfully")
    
    def get_feature_importance(self, task: str) -> Dict[str, float]:
        """Get feature importance for a specific task"""
        if task not in self.models:
            return {}
        
        model = self.models[task]
        
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
            feature_names = self.feature_names_per_task.get(task, [])
            
            if len(feature_names) == len(importance):
                return dict(zip(feature_names, importance))
            elif len(feature_names) > len(importance):
                return dict(zip(feature_names[:len(importance)], importance))
            else:
                return {f"feature_{i}": v for i, v in enumerate(importance)}
        
        return {}
    
    def should_list_as_hidden_gem(self, place_data: pd.DataFrame, 
                                    threshold: float = 60.0) -> bool:
        """
        Check if a place qualifies as a hidden gem.
        
        Args:
            place_data: Features of the place (single row DataFrame)
            threshold: Minimum score to qualify (default: 60)
        
        Returns:
            True if place qualifies as hidden gem
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet.")
        
        # Predict hidden gem score
        score = self.predict(place_data, task="hidden_gem")
        
        return score[0] >= threshold
    
    def get_place_scores(self, place_data: pd.DataFrame) -> Dict[str, float]:
        """
        Get all scores for a place (hidden_gem, safety, collab_auth).
        
        Args:
            place_data: Features of the place (single row DataFrame)
        
        Returns:
            Dictionary with scores
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet.")
        
        scores = {}
        
        # Get predictions for each task
        for task_name in ["hidden_gem", "safety_score", "collaboration_auth"]:
            try:
                pred = self.predict(place_data, task=task_name)
                scores[task_name] = float(pred[0]) if len(pred) > 0 else 0.0
            except Exception as e:
                logger.warning(f"Error predicting {task_name}: {e}")
                scores[task_name] = 0.0
        
        return scores
    
    def verify_collaborator_place(self, place_data: pd.DataFrame,
                                   gem_threshold: float = 60.0,
                                   safety_threshold: float = 50.0,
                                   auth_threshold: float = 0.5) -> Dict:
        """
        Verify a collaborator's place and determine listing eligibility.
        
        Args:
            place_data: Features of the collaborator's place
            gem_threshold: Minimum hidden gem score
            safety_threshold: Minimum safety score
            auth_threshold: Minimum collaboration auth score
        
        Returns:
            Dictionary with verification results
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet.")
        
        # Get all scores
        scores = self.get_place_scores(place_data)
        
        # Determine flags
        is_hidden_gem = scores["hidden_gem_score"] >= gem_threshold if "hidden_gem_score" in scores else scores.get("hidden_gem", 0) >= gem_threshold
        is_safe = scores.get("safety_score", 50) >= safety_threshold
        is_verified = scores.get("collaboration_auth", 0) >= auth_threshold
        
        # Determine listing type
        can_list = is_verified and is_safe
        listing_type = None
        
        if can_list:
            if is_hidden_gem:
                listing_type = "hidden_gem"
            else:
                listing_type = "verified"
        
        # Build response
        verification = {
            "can_list": can_list,
            "listing_type": listing_type,
            "scores": scores,
            "flags": {
                "is_hidden_gem": is_hidden_gem,
                "is_verified": is_verified,
                "is_safe": is_safe
            },
            "message": self._get_verification_message(
                is_hidden_gem, is_verified, is_safe, scores
            )
        }
        
        return verification
    
    def _get_verification_message(self, is_hidden_gem: bool, is_verified: bool,
                                   is_safe: bool, scores: Dict) -> str:
        """Generate human-readable verification message"""
        
        gem_score = scores.get("hidden_gem", scores.get("hidden_gem_score", 0))
        safety_score = scores.get("safety_score", 50)
        auth_score = scores.get("collaboration_auth", 0)
        
        if is_hidden_gem and is_verified and is_safe:
            return (
                f"Great news! Your place qualifies as a Hidden Gem "
                f"(Score: {gem_score:.1f}/100). "
                f"It will be featured in our hidden gem recommendations."
            )
        elif is_hidden_gem and is_safe:
            return (
                f"Your place is a Hidden Gem "
                f"(Score: {gem_score:.1f}/100) but not yet verified. "
                f"Please complete verification to be listed."
            )
        elif is_verified and is_safe:
            return (
                f"Your place is verified and safe "
                f"(Auth: {auth_score:.2f}, Safety: {safety_score:.1f}). "
                f"It will be listed as a verified location."
            )
        elif not is_verified:
            return (
                f"Your place could not be verified "
                f"(Auth Score: {auth_score:.2f}). "
                f"Please ensure all documentation is complete."
            )
        elif not is_safe:
            return (
                f"Your place does not meet our safety standards "
                f"(Safety Score: {safety_score:.1f}). "
                f"Please address safety concerns."
            )
        else:
            return "Your place is under review. We'll update you soon."
    
    def filter_places_by_gem_score(self, places_df: pd.DataFrame,
                                    threshold: float = 60.0) -> pd.DataFrame:
        """
        Filter places to only include those that qualify as hidden gems.
        
        Args:
            places_df: DataFrame with all places
            threshold: Minimum hidden gem score
        
        Returns:
            Filtered DataFrame with only hidden gems
        """
        if not self.is_trained:
            raise ValueError("Model not trained yet.")
        
        # Get hidden gem scores
        gem_scores = self.predict(places_df, task="hidden_gem")
        
        # Filter by threshold
        mask = gem_scores >= threshold
        
        return places_df[mask].copy()
    
    def summary(self) -> str:
        """Print summary of trained model"""
        if not self.is_trained:
            return "Model not trained yet."
        
        summary = "\n" + "="*60 + "\n"
        summary += "SIDEQUEST UNIFIED MODEL SUMMARY\n"
        summary += "="*60 + "\n\n"
        
        summary += f"Number of tasks: {len(self.models)}\n"
        summary += f"Tasks trained: {list(self.models.keys())}\n\n"
        
        for task_name, metrics in self.metrics.items():
            task_config = self.task_configs.get(task_name)
            is_regression = task_config and task_config.task_type == "regression"
            
            summary += f"\n{task_name.upper()}:\n"
            
            if is_regression:
                summary += f"  R² Score: {metrics.accuracy:.4f}\n"
                summary += f"  RMSE: {metrics.rmse:.4f}\n"
            else:
                summary += f"  Accuracy: {metrics.accuracy:.4f}\n"
                summary += f"  Precision: {metrics.precision:.4f}\n"
                summary += f"  Recall: {metrics.recall:.4f}\n"
                summary += f"  F1 Score: {metrics.f1:.4f}\n"
                summary += f"  AUC-ROC: {metrics.auc_roc:.4f}\n"
        
        summary += "\n" + "="*60 + "\n"
        
        return summary

if __name__ == "__main__":
    # Test the unified model with mock data
    import json
    
    # Load mock data
    with open("D:/sidequest_model/data/raw/mock_places.json", "r") as f:
        places = json.load(f)
    
    places_df = pd.DataFrame(places)
    
    # Add some mock review features
    places_df["review_text_length"] = np.random.randint(20, 200, len(places_df))
    places_df["review_word_count"] = np.random.randint(5, 50, len(places_df))
    places_df["review_exclamation_count"] = np.random.randint(0, 5, len(places_df))
    places_df["review_fake_indicators_count"] = np.random.randint(0, 3, len(places_df))
    places_df["review_real_indicators_count"] = np.random.randint(0, 3, len(places_df))
    places_df["review_positive_words"] = np.random.randint(0, 5, len(places_df))
    places_df["review_negative_words"] = np.random.randint(0, 3, len(places_df))
    places_df["review_unique_word_ratio"] = np.random.uniform(0.5, 1.0, len(places_df))
    places_df["review_uppercase_ratio"] = np.random.uniform(0, 0.3, len(places_df))
    places_df["review_has_numbers"] = np.random.randint(0, 2, len(places_df))
    places_df["has_reviews"] = (places_df["review_count"] > 0).astype(int)
    places_df["pharmacy_distance"] = np.random.uniform(50, 2000, len(places_df))
    places_df["hospital_distance"] = np.random.uniform(200, 5000, len(places_df))
    places_df["has_pharmacy_nearby"] = (places_df["pharmacy_distance"] < 1000).astype(int)
    places_df["has_hospital_nearby"] = (places_df["hospital_distance"] < 2000).astype(int)
    
    # Initialize and train model
    model = UnifiedSideQuestModel()
    
    # Train on selected tasks (skip solo_matching for demo as it needs user data)
    tasks_to_train = ["hidden_gem", "fake_detection", "safety_score", "collaboration_auth"]
    
    results = model.train(places_df, tasks=tasks_to_train)
    
    # Print summary
    print(model.summary())
    
    # Get feature importance
    for task in tasks_to_train:
        importance = model.get_feature_importance(task)
        if importance:
            print(f"\n{task} top features:")
            sorted_imp = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]
            for feat, imp in sorted_imp:
                print(f"  {feat}: {imp:.4f}")
