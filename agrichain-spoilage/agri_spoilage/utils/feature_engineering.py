def build_features(crop_row: dict, temperature: float, humidity: float, travel_time: float) -> dict:
    """Generate model-ready features for spoilage prediction."""
    ideal_temp_min = float(crop_row["ideal_temp_min"])
    ideal_temp_max = float(crop_row["ideal_temp_max"])
    storage_life_days = float(crop_row["storage_life_days"])

    ideal_temp_midpoint = (ideal_temp_min + ideal_temp_max) / 2.0
    temp_deviation = abs(float(temperature) - ideal_temp_midpoint)
    shelf_life_hours = storage_life_days * 24.0
    transport_stress = float(travel_time) / shelf_life_hours if shelf_life_hours > 0 else 1.0
    remaining_safe_time = max(shelf_life_hours - float(travel_time), 0.0)

    return {
        "temperature": round(float(temperature), 2),
        "humidity": round(float(humidity), 2),
        "travel_time": round(float(travel_time), 2),
        "ideal_temp_midpoint": round(ideal_temp_midpoint, 2),
        "temp_deviation": round(temp_deviation, 2),
        "shelf_life_hours": round(shelf_life_hours, 2),
        "transport_stress": round(transport_stress, 4),
        "remaining_safe_time": round(remaining_safe_time, 2),
    }
