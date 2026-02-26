import os

import requests
from dotenv import load_dotenv


load_dotenv()


def get_weather(city: str) -> dict:
    """Fetch current weather (temperature in C, humidity in %) for a city."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        raise ValueError("Missing OPENWEATHER_API_KEY in environment.")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
    }

    response = requests.get(url, params=params, timeout=15)
    response.raise_for_status()
    payload = response.json()

    main = payload.get("main", {})
    if "temp" not in main or "humidity" not in main:
        raise ValueError(f"Unexpected weather payload for city '{city}'.")

    return {
        "temperature": float(main["temp"]),
        "humidity": float(main["humidity"]),
    }
