import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WEATHER_API_KEY")

def get_weather_by_coords(lat, lon):
    if not API_KEY:
        raise ValueError("Weather API key not found")

    url = "https://api.weatherapi.com/v1/forecast.json"
    params = {
        "key": API_KEY,
        "q": f"{lat},{lon}",
        "days": 7,
        "aqi": "no",
        "alerts": "no"
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()