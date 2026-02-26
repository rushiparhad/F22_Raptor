import os

import requests
from dotenv import load_dotenv


load_dotenv()


def _geocode_with_ors(place: str, api_key: str) -> tuple:
    """Resolve place name to (lon, lat) using OpenRouteService geocoding."""
    url = "https://api.openrouteservice.org/geocode/search"
    params = {
        "api_key": api_key,
        "text": place,
        "size": 1,
    }
    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()
    payload = response.json()

    features = payload.get("features", [])
    if not features:
        raise ValueError(f"Could not geocode location '{place}' via OpenRouteService.")

    coords = features[0].get("geometry", {}).get("coordinates", [])
    if len(coords) != 2:
        raise ValueError(f"Unexpected geocode payload for '{place}'.")

    lon, lat = float(coords[0]), float(coords[1])
    return lon, lat


def _distance_with_ors(origin: str, destination: str, api_key: str) -> dict:
    """Fetch route distance/time using OpenRouteService (HeiGIT)."""
    origin_lon, origin_lat = _geocode_with_ors(origin, api_key)
    dest_lon, dest_lat = _geocode_with_ors(destination, api_key)

    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    params = {
        "api_key": api_key,
        "start": f"{origin_lon},{origin_lat}",
        "end": f"{dest_lon},{dest_lat}",
    }

    response = requests.get(url, params=params, timeout=25)
    response.raise_for_status()
    payload = response.json()

    features = payload.get("features", [])
    if not features:
        raise ValueError("Unexpected OpenRouteService directions payload.")

    summary = (
        features[0]
        .get("properties", {})
        .get("summary", {})
    )
    distance_m = summary.get("distance")
    duration_s = summary.get("duration")
    if distance_m is None or duration_s is None:
        raise ValueError("OpenRouteService response missing distance/duration.")

    return {
        "distance_km": round(float(distance_m) / 1000.0, 2),
        "travel_time_hours": round(float(duration_s) / 3600.0, 2),
    }


def _distance_with_google(origin: str, destination: str, api_key: str) -> dict:
    """Fetch route distance/time using Google Distance Matrix."""
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origin,
        "destinations": destination,
        "key": api_key,
        "units": "metric",
    }

    response = requests.get(url, params=params, timeout=20)
    response.raise_for_status()
    payload = response.json()

    rows = payload.get("rows", [])
    if not rows or not rows[0].get("elements"):
        raise ValueError("Unexpected Google Distance Matrix payload.")

    element = rows[0]["elements"][0]
    if element.get("status") != "OK":
        raise ValueError(
            f"Google Distance Matrix error for '{origin}' -> '{destination}': {element.get('status')}"
        )

    distance_m = element["distance"]["value"]
    duration_s = element["duration"]["value"]

    return {
        "distance_km": round(float(distance_m) / 1000.0, 2),
        "travel_time_hours": round(float(duration_s) / 3600.0, 2),
    }


def get_distance(origin: str, destination: str) -> dict:
    """Fetch road distance (km) and travel duration (hours) using ORS or Google."""
    ors_key = os.getenv("OPENROUTESERVICE_API_KEY") or os.getenv("HEIGIT_API_KEY")
    google_key = os.getenv("GOOGLE_DISTANCE_MATRIX_API_KEY")

    if ors_key:
        return _distance_with_ors(origin, destination, ors_key)
    if google_key:
        return _distance_with_google(origin, destination, google_key)

    raise ValueError(
        "Missing distance API key. Set OPENROUTESERVICE_API_KEY (or HEIGIT_API_KEY) or GOOGLE_DISTANCE_MATRIX_API_KEY."
    )
