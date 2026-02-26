from __future__ import annotations

from hashlib import md5


def _seed_value(crop: str, location: str, market: str) -> int:
    key = f"{crop.strip().lower()}::{location.strip().lower()}::{market.strip().lower()}"
    return int(md5(key.encode("utf-8")).hexdigest()[:8], 16)


def spoilage_predict(crop: str, location: str, market: str) -> dict:
    seed = _seed_value(crop, location, market)

    travel_time = round(1.5 + (seed % 180) / 30.0, 2)
    if travel_time >= 6.0:
        spoilage_risk = "HIGH"
    elif travel_time >= 3.5:
        spoilage_risk = "MEDIUM"
    else:
        spoilage_risk = "LOW"

    confidence = round(0.74 + ((seed % 19) / 100), 2)

    return {
        "spoilage_risk": spoilage_risk,
        "travel_time": float(travel_time),
        "confidence": float(min(confidence, 0.95)),
    }
