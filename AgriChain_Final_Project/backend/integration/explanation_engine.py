from __future__ import annotations


def generate_explanation(crop: str, location: str, outputs: dict, decision: dict) -> str:
    harvest = outputs["harvest"]
    price = outputs["price"]
    spoilage = outputs["spoilage"]

    return (
        f"For {crop} from {location}, harvest model recommends dispatch in "
        f"{harvest['recommended_harvest_days']} days with weather risk {harvest['weather_risk']}. "
        f"Price model suggests {price['best_market']} with expected price {price['predicted_price']:.2f} "
        f"and trend {price['price_trend']}. Spoilage model estimates travel time "
        f"{spoilage['travel_time']:.2f} hours with {spoilage['spoilage_risk']} risk. "
        f"Final advice: {decision['advice']}"
    )
