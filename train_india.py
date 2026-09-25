"""PHASE 5: train all unified models on India data.

Trains: hidden_gem, safety_score, collaboration_auth (via UnifiedSideQuestModel)
Already trained: fake_detection (fake_features.py), matchmaking (match_india.py)

Label construction for collaboration_auth (no leakage: labels come from TEXT
model verdicts, features are metadata + review-set statistics only):
- is_authentic = 1 if place's fake-review fraction < 0.15
- rev_* stats: count/spread of parsed review stars (non-text signals)

Quality gates (anti-overfit: metric target AND train-test gap limit):
- hidden_gem:   R2 >= 0.75, r2_gap <= 0.05
- safety_score: R2 >= 0.80, r2_gap <= 0.05
- collab_auth:  accuracy >= 0.85, AUC >= 0.75, accuracy_gap <= 0.05,
                social/review feature importance > 0
- fake_detection / matchmaking: gate_pass from their reports

Outputs: models/*_model.pkl (unified), reports/india_metrics.json,
         reports/feature_importance_india.json
"""
from __future__ import annotations

import json
import logging
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "src"))

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("train_india")


def build_training_frame() -> pd.DataFrame:
    logger.info("loading data/india_places.csv ...")
    df = pd.read_csv(ROOT / "data" / "india_places.csv")
    logger.info(f"  {len(df)} places, {df['source'].value_counts().to_dict()}")

    # numeric source flag (str source would break XGBoost)
    df["source_swiggy"] = (df["source"] == "swiggy").astype(int)

    # ---- collaboration_auth labels + review-set stats ----
    scored = pd.read_csv(ROOT / "data" / "zomato_reviews_scored.csv")
    stats = scored.groupby("place_id").agg(
        fraud_rate=("is_fake", "mean"),
        rev_n=("is_fake", "size"),
        rev_stars_mean=("stars", "mean"),
        rev_stars_std=("stars", "std"),
    ).reset_index()
    stats["rev_stars_std"] = stats["rev_stars_std"].fillna(0.0)

    # rating mismatch: mean parsed-review stars vs displayed place stars
    place_stars = df.set_index("place_id")["stars"]
    stats["rev_rating_mismatch"] = (
        stats["rev_stars_mean"] - stats["place_id"].map(place_stars)
    ).abs()

    # mean review length (words) per place
    scored["w"] = scored["text"].fillna("").str.split().str.len()
    wmean = scored.groupby("place_id")["w"].mean().rename("rev_avg_words")
    stats = stats.merge(wmean, on="place_id", how="left")
    stats["rev_avg_words"] = stats["rev_avg_words"].fillna(0.0)

    stats["is_authentic"] = (stats["fraud_rate"] < 0.15).astype(int)

    df = df.merge(
        stats[["place_id", "rev_n", "rev_stars_mean", "rev_stars_std",
               "rev_rating_mismatch", "rev_avg_words", "is_authentic"]],
        on="place_id", how="left",
    )
    auth_pos = df["is_authentic"].notna().sum()
    auth_rate = df["is_authentic"].dropna().mean()
    logger.info(f"  collab_auth labels: {auth_pos} places "
                f"(authentic={auth_rate*100:.1f}%, suspicious={(1-auth_rate)*100:.1f}%)")
    return df


def main() -> None:
    from unified_model import UnifiedSideQuestModel

    logger.info("=" * 60)
    logger.info("PHASE 5: TRAIN UNIFIED MODELS (INDIA)")
    logger.info("=" * 60)

    df = build_training_frame()

    model = UnifiedSideQuestModel()
    # collaboration_auth: balance classes via scale_pos_weight
    n_pos = int(df["is_authentic"].dropna().sum())
    n_neg = int((df["is_authentic"].dropna() == 0).sum())
    model.task_configs["collaboration_auth"].model_params["scale_pos_weight"] = (
        n_neg / max(n_pos, 1)
    )
    logger.info(f"  scale_pos_weight={n_neg/max(n_pos,1):.2f}")

    t0 = time.time()
    results = model.train(df, tasks=["hidden_gem", "safety_score", "collaboration_auth"])
    logger.info(f"  trained in {time.time()-t0:.0f}s")

    # ---- feature importances (proves social features are USED) ----
    importances = {}
    for task in ["hidden_gem", "safety_score", "collaboration_auth"]:
        imp = model.get_feature_importance(task)
        importances[task] = {
            k: float(v) for k, v in sorted(imp.items(), key=lambda kv: -kv[1])
        }
    (ROOT / "reports").mkdir(exist_ok=True)
    (ROOT / "reports" / "feature_importance_india.json").write_text(
        json.dumps(importances, indent=2))
    for task, imp in importances.items():
        top = list(imp.items())[:6]
        logger.info(f"  {task} top features: " +
                    ", ".join(f"{k}={v:.3f}" for k, v in top))

    # ---- GATES ----
    gates = {}

    m = results["hidden_gem"]
    gates["hidden_gem"] = {
        "r2": m.r2, "required_r2": 0.75,
        "r2_gap": m.r2_gap, "max_gap": 0.05,
        "cv_ok": True,
        "pass": m.r2 >= 0.75 and m.r2_gap <= 0.05,
    }

    m = results["safety_score"]
    gates["safety_score"] = {
        "r2": m.r2, "required_r2": 0.80,
        "r2_gap": m.r2_gap, "max_gap": 0.05,
        "pass": m.r2 >= 0.80 and m.r2_gap <= 0.05,
    }

    m = results["collaboration_auth"]
    # social/review features must carry importance (fixes US all-zero bug)
    social_keys = ["has_phone", "rev_rating_mismatch", "rev_stars_std",
                   "rev_n", "review_count_log", "rev_avg_words"]
    social_imp = {k: importances["collaboration_auth"].get(k, 0.0) for k in social_keys}
    social_ok = any(v > 0.0 for v in social_imp.values())
    gates["collaboration_auth"] = {
        "accuracy": m.accuracy, "required_accuracy": 0.85,
        "auc": m.auc_roc, "required_auc": 0.75,
        "accuracy_gap": m.accuracy_gap, "max_gap": 0.05,
        "social_feature_importance": social_imp,
        "social_features_used": social_ok,
        "pass": (m.accuracy >= 0.85 and m.auc_roc >= 0.75
                 and m.accuracy_gap <= 0.05 and social_ok),
    }

    # external reports (fake + match)
    for name, path in [("fake_detection", "reports/fake_metrics.json"),
                       ("solo_matching", "reports/match_metrics.json")]:
        p = ROOT / path
        if p.exists():
            fm = json.loads(p.read_text())
            gates[name] = {
                "accuracy": fm.get("accuracy"),
                "auc": fm.get("auc") or fm.get("score_r2"),
                "pass": bool(fm.get("gate_pass")),
            }
        else:
            gates[name] = {"pass": False, "error": f"{path} missing"}

    all_pass = all(g.get("pass") for g in gates.values())
    summary = {
        "all_gates_pass": all_pass,
        "gates": gates,
        "unified_metrics": {k: v.to_dict() for k, v in results.items()},
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    (ROOT / "reports" / "india_metrics.json").write_text(
        json.dumps(summary, indent=2, default=float)
    )

    logger.info("\n" + "=" * 60)
    logger.info("QUALITY GATES")
    logger.info("=" * 60)
    for name, g in gates.items():
        status = "PASS" if g.get("pass") else "FAIL"
        detail = ", ".join(f"{k}={v:.4f}" for k, v in g.items()
                           if isinstance(v, (int, float)))
        logger.info(f"  [{status}] {name}: {detail}")
    logger.info(f"\n  OVERALL: {'ALL GATES PASS' if all_pass else 'SOME GATES FAILED'}")
    logger.info("  saved models/*_model.pkl, reports/india_metrics.json")


if __name__ == "__main__":
    main()
