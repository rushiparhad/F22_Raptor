from datetime import datetime
from weather import get_weather_by_coords
from harvest.harvest import harvest_timing_recommendation


LOCATION_COORDS = {
    "Nashik": (19.9975, 73.7898),
    "Pune": (18.5204, 73.8567)
}


def harvest_predict(crop: str, location: str) -> dict:
    """
    Integration-ready harvest prediction function.
    """

    if location not in LOCATION_COORDS:
        raise ValueError("Unsupported location")

    lat, lon = LOCATION_COORDS[location]

    weather_data = get_weather_by_coords(lat, lon)

    result = harvest_timing_recommendation(
        crop=crop,
        weather_data=weather_data,
        soil_moisture="High"
    )

    window = result["Best Harvest Window"].split(" to ")
    start_date = window[0]
    end_date = window[1]

    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    recommended_days = (end - start).days + 1

    risk_map = {
        "Low": "LOW",
        "Medium": "MEDIUM",
        "High": "HIGH"
    }

    confidence_map = {
        "LOW": 0.85,
        "MEDIUM": 0.75,
        "HIGH": 0.60
    }

    weather_risk = risk_map[result["Risk Level"]]

    return {
        "recommended_harvest_days": recommended_days,
        "harvest_window_start": start_date,
        "harvest_window_end": end_date,
        "weather_risk": weather_risk,
        "confidence": confidence_map[weather_risk]
    }