from __future__ import annotations

from harvest.predict import harvest_predict
from price.integration import price_predict
from spoilage.predict import spoilage_predict


def run_pipeline(crop: str, location: str) -> dict:
    harvest_out = harvest_predict(crop=crop, location=location)
    price_out = price_predict(crop=crop, location=location)
    spoilage_out = spoilage_predict(
        crop=crop,
        location=location,
        market=price_out["best_market"],
    )

    return {
        "harvest": harvest_out,
        "price": price_out,
        "spoilage": spoilage_out,
    }
