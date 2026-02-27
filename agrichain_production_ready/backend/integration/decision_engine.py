from __future__ import annotations


def build_decision(crop: str, location: str, outputs: dict) -> dict:
    harvest = outputs["harvest"]
    price = outputs["price"]
    spoilage = outputs["spoilage"]

    harvest_after_days = int(harvest["recommended_harvest_days"])
    spoilage_risk = spoilage["spoilage_risk"]
    sell_market = price["best_market"]
    expected_price = float(price["predicted_price"])

    if spoilage_risk == "HIGH":
        advice = "Sell quickly at nearest feasible market and use cold-chain transport."
    elif harvest["weather_risk"] == "HIGH":
        advice = "Advance harvest by 1 day and monitor weather before dispatch."
    elif price["price_trend"] == "UP":
        advice = "Harvest as scheduled and target peak market window for better returns."
    else:
        advice = "Proceed with planned harvest and route with standard handling."

    return {
        "harvest_after_days": harvest_after_days,
        "sell_market": sell_market,
        "expected_price": expected_price,
        "spoilage_risk": spoilage_risk,
        "advice": advice,
    }
