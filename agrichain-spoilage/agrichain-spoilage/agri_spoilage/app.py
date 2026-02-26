from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException, Query

from api.distance_api import get_distance
from api.weather_api import get_weather
from model.predict import predict_spoilage
from utils.feature_engineering import build_features


ROOT_DIR = Path(__file__).resolve().parent
SHELF_LIFE_PATH = ROOT_DIR / "data" / "crop_shelf_life.csv"

app = FastAPI(title="AgriChain Spoilage Risk API", version="1.0.0")


@app.get("/predict")
def predict(
    crop: str = Query(..., description="Crop name, e.g., tomato"),
    city: str = Query(..., description="Farm city"),
    market: str = Query(..., description="Destination market/city"),
):
    crop_name = crop.strip().lower()

    try:
        shelf_df = pd.read_csv(SHELF_LIFE_PATH)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load shelf-life data: {exc}")

    crop_match = shelf_df[shelf_df["crop"].str.lower() == crop_name]
    if crop_match.empty:
        supported = ", ".join(sorted(shelf_df["crop"].tolist()))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported crop '{crop}'. Supported crops: {supported}",
        )

    crop_row = crop_match.iloc[0].to_dict()

    try:
        weather = get_weather(city)
        distance = get_distance(city, market)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    features = build_features(
        crop_row=crop_row,
        temperature=weather["temperature"],
        humidity=weather["humidity"],
        travel_time=distance["travel_time_hours"],
    )

    try:
        prediction = predict_spoilage(features)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}")

    suggestions = []
    if weather["temperature"] > float(crop_row["ideal_temp_max"]):
        suggestions.append("Use night transport to reduce heat exposure.")
    if weather["humidity"] > float(crop_row["humidity_max"]):
        suggestions.append("Use ventilated crates to prevent moisture buildup.")
    if distance["travel_time_hours"] > (features["shelf_life_hours"] * 0.5):
        suggestions.append("Consider a nearer market to reduce transport duration.")
    if not suggestions:
        suggestions.append("Maintain cold-chain handling and avoid transit delays.")

    explanation = (
        f"Risk classified as {prediction['risk_label']} with confidence {prediction['confidence']:.2f}. "
        f"Current temperature is {weather['temperature']:.1f}C, humidity is {weather['humidity']:.0f}%, "
        f"and estimated travel time is {distance['travel_time_hours']:.2f} hours. "
        f"Transport stress is {features['transport_stress']:.2f} relative to shelf-life capacity."
    )

    return {
        "crop": crop_name,
        "spoilage_risk": prediction["risk_label"],
        "confidence": prediction["confidence"],
        "temperature": weather["temperature"],
        "humidity": weather["humidity"],
        "travel_time": distance["travel_time_hours"],
        "distance_km": distance["distance_km"],
        "explanation": explanation,
        "suggestions": suggestions,
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
