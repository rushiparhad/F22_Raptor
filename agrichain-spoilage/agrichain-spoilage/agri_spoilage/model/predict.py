from pathlib import Path
from typing import Dict

import pandas as pd
from autogluon.tabular import TabularPredictor


ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT_DIR / "model" / "artifacts" / "spoilage_predictor"

_predictor = None


def _load_predictor() -> TabularPredictor:
    global _predictor

    if _predictor is not None:
        return _predictor

    if not MODEL_DIR.exists():
        from model.train import train_and_save_model

        train_and_save_model(samples=1000)

    _predictor = TabularPredictor.load(str(MODEL_DIR))
    return _predictor


def predict_spoilage(features: Dict[str, float]) -> Dict[str, float]:
    predictor = _load_predictor()

    features_df = pd.DataFrame([features])
    predictions = predictor.predict(features_df)
    probabilities = predictor.predict_proba(features_df)

    label = str(predictions.iloc[0])
    confidence = float(probabilities.iloc[0][label]) if label in probabilities.columns else 0.0

    return {
        "risk_label": label,
        "confidence": round(confidence, 4),
    }
