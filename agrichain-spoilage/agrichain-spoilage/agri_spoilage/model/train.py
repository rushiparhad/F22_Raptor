from pathlib import Path
import sys

import numpy as np
import pandas as pd
from autogluon.tabular import TabularPredictor

# Allow running as script: `python model/train.py`
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from utils.feature_engineering import build_features


DATA_PATH = ROOT_DIR / "data" / "crop_shelf_life.csv"
MODEL_DIR = ROOT_DIR / "model" / "artifacts" / "spoilage_predictor"


def _label_risk(
    temperature: float,
    humidity: float,
    travel_time_hours: float,
    crop_row: dict,
    features: dict,
) -> str:
    ideal_temp_max = float(crop_row["ideal_temp_max"])
    humidity_min = float(crop_row["humidity_min"])
    humidity_max = float(crop_row["humidity_max"])

    high_temperature = temperature > (ideal_temp_max + 3.0)
    high_stress = features["transport_stress"] > 0.60 or features["remaining_safe_time"] < 12.0

    medium_stress = (
        features["transport_stress"] > 0.35
        or features["temp_deviation"] > 4.0
        or humidity < (humidity_min - 10.0)
        or humidity > (humidity_max + 10.0)
        or travel_time_hours > 24.0
    )

    if high_temperature or high_stress:
        return "HIGH"
    if medium_stress:
        return "MEDIUM"
    return "LOW"


def generate_synthetic_data(samples: int = 1000, random_seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(random_seed)
    shelf_df = pd.read_csv(DATA_PATH)

    records = []
    crops = shelf_df.to_dict(orient="records")

    for _ in range(samples):
        crop_row = crops[rng.integers(0, len(crops))]

        ideal_temp_min = float(crop_row["ideal_temp_min"])
        ideal_temp_max = float(crop_row["ideal_temp_max"])
        humidity_min = float(crop_row["humidity_min"])
        humidity_max = float(crop_row["humidity_max"])
        storage_life_days = float(crop_row["storage_life_days"])

        temperature = rng.normal((ideal_temp_min + ideal_temp_max) / 2.0, 6.0)
        humidity = rng.normal((humidity_min + humidity_max) / 2.0, 12.0)
        humidity = float(np.clip(humidity, 35, 100))

        max_travel = max(storage_life_days * 24.0 * 0.9, 8.0)
        travel_time_hours = float(rng.uniform(2.0, max_travel))

        features = build_features(crop_row, temperature, humidity, travel_time_hours)
        risk_label = _label_risk(temperature, humidity, travel_time_hours, crop_row, features)

        features["spoilage_risk"] = risk_label
        records.append(features)

    return pd.DataFrame(records)


def train_and_save_model(samples: int = 1000) -> TabularPredictor:
    MODEL_DIR.parent.mkdir(parents=True, exist_ok=True)

    dataset = generate_synthetic_data(samples=samples)

    predictor = TabularPredictor(
        label="spoilage_risk",
        path=str(MODEL_DIR),
        problem_type="multiclass",
        eval_metric="accuracy",
    ).fit(
        train_data=dataset,
        presets="medium_quality",
        verbosity=2,
    )

    return predictor


if __name__ == "__main__":
    train_and_save_model(samples=1000)
    print(f"Model trained and saved to: {MODEL_DIR}")
