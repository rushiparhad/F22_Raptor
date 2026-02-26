from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path

import pandas as pd

from price.predict import predict_best_market


STATE = "Maharashtra"
PRICE_DIR = Path(__file__).resolve().parent
DATA_PATH = PRICE_DIR / "data" / "maharashtra_cleaned.csv"


@contextmanager
def _temporary_cwd(path: Path):
    previous = Path.cwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(previous)


def _to_commodity(crop: str) -> str:
    return crop.strip().capitalize()


def _to_district(location: str) -> str:
    return location.strip().capitalize()


def _map_trend(direction: str) -> str:
    value = (direction or "").strip().lower()
    if value == "increasing":
        return "UP"
    if value == "decreasing":
        return "DOWN"
    return "STABLE"


def _map_confidence(confidence_text: str) -> float:
    value = (confidence_text or "").strip().lower()
    if value == "high":
        return 0.9
    if value == "medium":
        return 0.75
    if value == "low":
        return 0.6
    return 0.6


def _hard_fallback() -> dict:
    return {
        "best_market": "Unknown",
        "avg_price": 0.0,
        "min_price": 0.0,
        "max_price": 0.0,
        "price_range": 0.0,
        "trend_direction": "STABLE",
        "trend_description": "Price trend unavailable.",
        "confidence": 0.5,
        "volatility": "Unknown",
        "all_markets": [],
        "forecast_days": 7,
    }


def _fallback_from_data(crop: str, location: str) -> dict:
    if not DATA_PATH.exists():
        return _hard_fallback()

    commodity = _to_commodity(crop)
    district = _to_district(location)
    df = pd.read_csv(DATA_PATH)

    subset = df[
        (df["State"] == STATE)
        & (df["District"] == district)
        & (df["Commodity"] == commodity)
    ]
    if subset.empty:
        return _hard_fallback()

    grouped = (
        subset.groupby("Market", as_index=False)["y"]
        .mean()
        .sort_values("y", ascending=False)
        .reset_index(drop=True)
    )

    top = grouped.iloc[0]
    values = grouped["y"]

    return {
        "best_market": str(top["Market"]),
        "avg_price": float(round(float(top["y"]), 2)),
        "min_price": float(round(float(values.min()), 2)),
        "max_price": float(round(float(values.max()), 2)),
        "price_range": float(round(float(values.max() - values.min()), 2)),
        "trend_direction": "STABLE",
        "trend_description": "Historical district averages used as fallback.",
        "confidence": 0.55,
        "volatility": "Medium",
        "all_markets": [
            {
                "market": str(row["Market"]),
                "avg_price": float(round(float(row["y"]), 2)),
                "min_price": float(round(float(row["y"]), 2)),
                "max_price": float(round(float(row["y"]), 2)),
                "trend": {
                    "direction": "stable",
                    "percentage_change": 0.0,
                    "confidence": "low",
                    "description": "Fallback average",
                },
                "volatility": "Medium",
            }
            for _, row in grouped.head(10).iterrows()
        ],
        "forecast_days": 7,
    }


def price_predict(crop: str, location: str) -> dict:
    commodity = _to_commodity(crop)
    district = _to_district(location)

    with _temporary_cwd(PRICE_DIR):
        result = predict_best_market(
            STATE,
            district,
            commodity,
            data_path=str(DATA_PATH),
        )

    if not result.get("success"):
        return _fallback_from_data(crop, location)

    trend_info = result.get("trend", {})
    direction_raw = trend_info.get("direction", "") if isinstance(trend_info, dict) else str(trend_info)
    confidence_raw = trend_info.get("confidence", "") if isinstance(trend_info, dict) else ""
    trend_description = (
        trend_info.get("description", "") if isinstance(trend_info, dict) else ""
    )

    return {
        "best_market": str(result.get("best_market", "Unknown")),
        "avg_price": float(result.get("predicted_avg_price_next_7_days", 0.0)),
        "min_price": float(result.get("predicted_min_price", 0.0)),
        "max_price": float(result.get("predicted_max_price", 0.0)),
        "price_range": float(result.get("price_range", 0.0)),
        "trend_direction": _map_trend(direction_raw),
        "trend_description": trend_description or "Price trend unavailable.",
        "confidence": _map_confidence(confidence_raw),
        "volatility": str(result.get("volatility", "Unknown")),
        "all_markets": list(result.get("all_markets", [])),
        "forecast_days": int(result.get("forecast_days", 7)),
    }
