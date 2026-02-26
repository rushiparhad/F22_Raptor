from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from harvest.predict import harvest_predict
from price.integration import price_predict
from price.predict import predict_best_market
from spoilage.predict import spoilage_predict


app = FastAPI(title="AgriChain Integration API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PRICE_WEIGHT = 0.50
SPOILAGE_WEIGHT = 0.30
HARVEST_WEIGHT = 0.20
STATE = "Maharashtra"
PRICE_DIR = Path(__file__).resolve().parent / "price"
PRICE_DATA_PATH = PRICE_DIR / "data" / "maharashtra_cleaned.csv"


@contextmanager
def _temporary_cwd(path: Path):
    previous = Path.cwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(previous)


def _safe_str(value: object, default: str) -> str:
    text = str(value).strip() if value is not None else ""
    return text or default


def _safe_float(value: object, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _safe_int(value: object, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _map_price_trend(direction: str) -> str:
    normalized = direction.strip().lower()
    if normalized == "increasing":
        return "UP"
    if normalized == "decreasing":
        return "DOWN"
    if normalized in {"up", "down", "stable"}:
        return normalized.upper()
    return "STABLE"


def _temperature_effect_from_risk(risk_level: str) -> str:
    if risk_level == "HIGH":
        return "Heat and humidity can accelerate quality loss during transport."
    if risk_level == "MEDIUM":
        return "Temperature variation may reduce shelf life without careful handling."
    return "Temperature impact is manageable with standard handling."


def _spoilage_recommendation(risk_level: str, travel_time_hours: float) -> str:
    if risk_level == "HIGH":
        return "Use rapid dispatch and protective packaging to reduce spoilage losses."
    if risk_level == "MEDIUM":
        return "Plan same-day transport and avoid peak heat hours where possible."
    if travel_time_hours >= 4.0:
        return "Keep produce ventilated and avoid delays during transit."
    return "Standard logistics are acceptable with routine handling checks."


def _normalize_other_markets(markets: object) -> list[dict]:
    if not isinstance(markets, list):
        return []

    normalized: list[dict] = []
    for row in markets[:5]:
        if not isinstance(row, dict):
            continue
        trend_obj = row.get("trend", {})
        trend_direction = "STABLE"
        if isinstance(trend_obj, dict):
            trend_direction = _map_price_trend(_safe_str(trend_obj.get("direction"), "stable"))
        elif isinstance(trend_obj, str):
            trend_direction = _map_price_trend(trend_obj)

        normalized.append(
            {
                "market": _safe_str(row.get("market"), "Unknown Market"),
                "avg_price": round(_safe_float(row.get("avg_price"), 0.0), 2),
                "trend": trend_direction,
            }
        )
    return normalized


def _fetch_price_result(crop: str, location: str) -> dict:
    district = location.strip().capitalize()
    commodity = crop.strip().capitalize()

    try:
        with _temporary_cwd(PRICE_DIR):
            result = predict_best_market(
                STATE,
                district,
                commodity,
                data_path=str(PRICE_DATA_PATH),
            )
    except Exception:
        result = {"success": False}

    if result.get("success"):
        trend_obj = result.get("trend", {}) if isinstance(result.get("trend"), dict) else {}
        trend_direction = _map_price_trend(_safe_str(trend_obj.get("direction"), "stable"))
        return {
            "best_market": _safe_str(result.get("best_market"), "Unknown Market"),
            "expected_price": round(_safe_float(result.get("predicted_avg_price_next_7_days"), 0.0), 2),
            "price_min": round(_safe_float(result.get("predicted_min_price"), 0.0), 2),
            "price_max": round(_safe_float(result.get("predicted_max_price"), 0.0), 2),
            "price_trend": trend_direction,
            "trend_description": _safe_str(trend_obj.get("description"), "Price trend unavailable."),
            "volatility": _safe_str(result.get("volatility"), "Medium"),
            "forecast_days": max(1, _safe_int(result.get("forecast_days"), 7)),
            "other_markets": _normalize_other_markets(result.get("all_markets", [])),
        }

    fallback = price_predict(crop=crop, location=location)
    return {
        "best_market": _safe_str(fallback.get("best_market"), "Unknown Market"),
        "expected_price": round(_safe_float(fallback.get("avg_price"), 0.0), 2),
        "price_min": round(_safe_float(fallback.get("min_price"), 0.0), 2),
        "price_max": round(_safe_float(fallback.get("max_price"), 0.0), 2),
        "price_trend": _map_price_trend(_safe_str(fallback.get("trend_direction"), "STABLE")),
        "trend_description": _safe_str(fallback.get("trend_description"), "Price trend unavailable."),
        "volatility": _safe_str(fallback.get("volatility"), "Medium"),
        "forecast_days": max(1, _safe_int(fallback.get("forecast_days"), 7)),
        "other_markets": _normalize_other_markets(fallback.get("all_markets", [])),
    }


def _normalize_harvest(crop: str, location: str) -> dict:
    result = harvest_predict(crop=crop, location=location)
    days = max(1, _safe_int(result.get("recommended_harvest_days"), 3))
    weather_risk = _safe_str(result.get("weather_risk"), "MEDIUM").upper()
    if weather_risk == "HIGH":
        harvest_advice = "Prioritize quick harvest planning due to weather sensitivity."
    elif weather_risk == "LOW":
        harvest_advice = "Harvest window is flexible with lower weather pressure."
    else:
        harvest_advice = "Follow normal harvest plan and monitor weather updates."

    return {
        "harvest_after_days": days,
        "harvest_advice": harvest_advice,
    }


def _normalize_spoilage(crop: str, location: str, market: str) -> dict:
    result = spoilage_predict(crop=crop, location=location, market=market)
    risk_level = _safe_str(result.get("spoilage_risk"), "LOW").upper()
    if risk_level not in {"LOW", "MEDIUM", "HIGH"}:
        risk_level = "LOW"
    travel_time_hours = round(max(0.0, _safe_float(result.get("travel_time"), 0.0)), 2)
    temperature_effect = _temperature_effect_from_risk(risk_level)

    return {
        "risk_level": risk_level,
        "travel_time_hours": travel_time_hours,
        "temperature_effect": temperature_effect,
        "recommendation": _spoilage_recommendation(risk_level, travel_time_hours),
    }


def _build_weighted_advice(
    price_trend: str,
    volatility: str,
    spoilage_risk: str,
    harvest_after_days: int,
    harvest_advice: str,
) -> tuple[int, str]:
    price_score = {"UP": 1.0, "STABLE": 0.5, "DOWN": 0.2}.get(price_trend, 0.5)
    spoilage_score = {"LOW": 1.0, "MEDIUM": 0.6, "HIGH": 0.2}.get(spoilage_risk, 0.6)
    harvest_score = 1.0 if harvest_after_days <= 2 else 0.7 if harvest_after_days <= 5 else 0.4

    weighted_signal = (
        (PRICE_WEIGHT * price_score)
        + (SPOILAGE_WEIGHT * spoilage_score)
        + (HARVEST_WEIGHT * harvest_score)
    )

    adjusted_days = harvest_after_days
    statements: list[str] = []

    # Price model is primary driver (50%)
    if price_trend == "UP":
        statements.append("Price momentum is favorable, so delaying sale can improve returns.")
        if spoilage_risk != "HIGH":
            adjusted_days = min(harvest_after_days + 1, 10)
    elif price_trend == "DOWN":
        statements.append("Price trend is weakening, so earlier selling is preferred.")
        adjusted_days = max(1, harvest_after_days - 1)
    else:
        statements.append("Price trend is stable, so focus on execution quality and timing discipline.")

    # Spoilage model is second priority (30%) and can override urgency.
    if spoilage_risk == "HIGH":
        adjusted_days = max(1, harvest_after_days - 2)
        statements.append("High spoilage risk overrides waiting; prioritize immediate harvest and dispatch.")
    elif spoilage_risk == "MEDIUM":
        statements.append("Moderate spoilage risk requires careful packaging and faster logistics.")
    else:
        statements.append("Low spoilage risk supports normal logistics planning.")

    # Harvest model is third priority (20%).
    statements.append(harvest_advice)

    if volatility.strip().lower() == "high":
        statements.append("High market volatility adds downside risk, so lock in margins with cautious planning.")

    if weighted_signal >= 0.75:
        statements.append("Overall weighted signal is strong and supports proactive market execution.")
    elif weighted_signal <= 0.45:
        statements.append("Overall weighted signal is weak; minimize risk exposure and avoid delays.")

    return adjusted_days, " ".join(statements)


def _build_explanation(
    crop: str,
    location: str,
    trend_description: str,
    expected_price: float,
    sell_market: str,
    spoilage_risk: str,
    travel_time_hours: float,
    harvest_after_days: int,
) -> str:
    return (
        f"For {crop} from {location}, price intelligence predicts {trend_description}. "
        f"Expected average market price is ₹{expected_price:.2f} at {sell_market}. "
        f"Spoilage analysis indicates {spoilage_risk} risk with estimated travel time {travel_time_hours:.2f} hours. "
        f"Harvest advisor recommends dispatch in {harvest_after_days} days. "
        f"Final recommendation balances price opportunity, transport risk, and harvest readiness."
    )


@app.get("/agrichain")
def agrichain(crop: str = Query(...), location: str = Query(...)):
    try:
        crop_value = _safe_str(crop, "Unknown Crop")
        location_value = _safe_str(location, "Unknown Location")

        price_out = _fetch_price_result(crop_value, location_value)
        harvest_out = _normalize_harvest(crop_value, location_value)
        spoilage_analysis = _normalize_spoilage(
            crop=crop_value,
            location=location_value,
            market=price_out["best_market"],
        )

        final_harvest_days, final_advice = _build_weighted_advice(
            price_trend=price_out["price_trend"],
            volatility=price_out["volatility"],
            spoilage_risk=spoilage_analysis["risk_level"],
            harvest_after_days=harvest_out["harvest_after_days"],
            harvest_advice=harvest_out["harvest_advice"],
        )

        decision = {
            "harvest_after_days": max(1, int(final_harvest_days)),
            "sell_market": price_out["best_market"],
            "expected_price": price_out["expected_price"],
            "price_trend": price_out["price_trend"],
            "price_range": {
                "min": price_out["price_min"],
                "max": price_out["price_max"],
            },
            "spoilage_risk": spoilage_analysis["risk_level"],
            "advice": final_advice,
        }

        price_intelligence = {
            "forecast_days": price_out["forecast_days"],
            "trend_description": price_out["trend_description"],
            "volatility": price_out["volatility"],
            "other_markets": price_out["other_markets"],
        }

        explanation = _build_explanation(
            crop=crop_value,
            location=location_value,
            trend_description=price_out["trend_description"],
            expected_price=price_out["expected_price"],
            sell_market=price_out["best_market"],
            spoilage_risk=spoilage_analysis["risk_level"],
            travel_time_hours=spoilage_analysis["travel_time_hours"],
            harvest_after_days=decision["harvest_after_days"],
        )

        return {
            "decision": decision,
            "price_intelligence": price_intelligence,
            "spoilage_analysis": spoilage_analysis,
            "explanation": explanation,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {exc}")


@app.get("/health")
def health():
    return {"status": "ok"}
