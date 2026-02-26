from weather import get_weather_by_coords
from harvest import harvest_timing_recommendation

def main():
    # Nashik coordinates
    lat = 19.9975
    lon = 73.7898

    weather = get_weather_by_coords(lat, lon)

    result = harvest_timing_recommendation(
        crop="Tomato",
        weather_data=weather,
        soil_moisture="High"
    )

    print("\n=== Harvest Advisory ===")
    for key, value in result.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    main()