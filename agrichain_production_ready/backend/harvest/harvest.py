from datetime import datetime, timedelta

def harvest_timing_recommendation(crop, weather_data, soil_moisture):
    today = datetime.today().date()
    rain_threshold = 60

    rain_start_date = None

    for day in weather_data["forecast"]["forecastday"]:
        rain_prob = int(day["day"]["daily_chance_of_rain"])
        date = datetime.strptime(day["date"], "%Y-%m-%d").date()

        if rain_prob >= rain_threshold:
            rain_start_date = date
            break

    if rain_start_date:
        harvest_start = today
        harvest_end = rain_start_date - timedelta(days=1)
        risk = "High"
        explanation = f"Rain probability increases after {rain_start_date}"
    else:
        harvest_start = today + timedelta(days=2)
        harvest_end = today + timedelta(days=5)
        risk = "Low"
        explanation = "Weather stable for next 5 days"

    if soil_moisture.lower() == "high":
        harvest_end -= timedelta(days=1)
        risk = "Medium"
        explanation += "; soil moisture already high"

    return {
        "Crop": crop,
        "Best Harvest Window": f"{harvest_start} to {harvest_end}",
        "Risk Level": risk,
        "Why this recommendation": explanation
    }