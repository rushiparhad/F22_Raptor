"""
Interactive Farmer Input System
Allows farmers to input state, district, and commodity to get price predictions
"""

import pandas as pd
import json
import logging
from predict import predict_best_market, load_cleaned_data

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def get_available_options():
    """Get all available states, districts, and commodities"""
    try:
        df = load_cleaned_data()
        
        states = sorted(df['State'].unique().tolist())
        districts = sorted(df['District'].unique().tolist())
        commodities = sorted(df['Commodity'].unique().tolist())
        
        return states, districts, commodities, df
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return None, None, None, None


def display_menu():
    """Display available options to farmer"""
    states, districts, commodities, df = get_available_options()
    
    if states is None:
        print("❌ Error loading data")
        return
    
    print("\n" + "=" * 70)
    print("🌾 MANDI PRICE PREDICTION SYSTEM - FARMER INPUT")
    print("=" * 70)
    
    print(f"\n✓ Available States ({len(states)}):")
    for idx, state in enumerate(states, 1):
        print(f"  {idx}. {state}")
    
    print(f"\n✓ Available Districts ({len(districts)}):")
    for idx, district in enumerate(districts, 1):
        print(f"  {idx:2}. {district}")
    
    print(f"\n✓ Available Commodities ({len(commodities)}):")
    for idx, commodity in enumerate(commodities, 1):
        print(f"  {idx}. {commodity}")
    
    return states, districts, commodities, df


def get_farmer_input(states, districts, commodities):
    """Get input from farmer and validate"""
    print("\n" + "-" * 70)
    print("INPUT YOUR DETAILS")
    print("-" * 70)
    
    # Get State
    while True:
        state_input = input("\nEnter State (or press Enter for 'Maharashtra'): ").strip()
        state = state_input if state_input else "Maharashtra"
        
        if state in states:
            print(f"✓ State selected: {state}")
            break
        else:
            print(f"❌ Invalid state. Please choose from available states.")
    
    # Get District
    while True:
        district_input = input("\nEnter District: ").strip()
        
        # Find matching district (case-insensitive)
        matching_districts = [d for d in districts if d.lower() == district_input.lower()]
        
        if matching_districts:
            district = matching_districts[0]
            print(f"✓ District selected: {district}")
            break
        else:
            print(f"❌ District not found. Try again.")
            print(f"   Hint: Available districts include Ahmednagar, Pune, Nasik, etc.")
    
    # Get Commodity
    while True:
        commodity_input = input("\nEnter Commodity (Onion/Potato/Tomato): ").strip().capitalize()
        
        if commodity_input in commodities:
            commodity = commodity_input
            print(f"✓ Commodity selected: {commodity}")
            break
        else:
            print(f"❌ Commodity not found. Choose from: {', '.join(commodities)}")
    
    return state, district, commodity


def display_prediction_result(result):
    """Display prediction results in farmer-friendly format"""
    
    if not result.get('success'):
        print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
        return
    
    print("\n" + "=" * 70)
    print("🎯 PRICE PREDICTION RESULT")
    print("=" * 70)
    
    print(f"\n📍 Location:")
    print(f"   State: {result['state']}")
    print(f"   District: {result['district']}")
    print(f"   Commodity: {result['commodity']}")
    
    print(f"\n📅 Forecast: Next {result['forecast_days']} days")
    
    print(f"\n{'=' * 70}")
    print(f"🏆 BEST MARKET: {result['best_market']}")
    print(f"{'=' * 70}")
    
    print(f"\n💰 PREDICTED PRICE (Average):")
    print(f"   💵 Average: Rs. {result['predicted_avg_price_next_7_days']}")
    print(f"   📉 Minimum: Rs. {result['predicted_min_price']}")
    print(f"   📈 Maximum: Rs. {result['predicted_max_price']}")
    
    print(f"\n📊 TREND: {result['trend'].upper()}")
    if result['trend'].lower() == 'increasing':
        print(f"   ⬆️  Prices expected to go UP")
    else:
        print(f"   ⬇️  Prices expected to go DOWN")
    
    print(f"\n{'=' * 70}")
    print(f"COMPARISON WITH OTHER MARKETS:")
    print(f"{'=' * 70}")
    
    for i, market_data in enumerate(result['all_markets'][:5], 1):
        price_str = f"Rs. {market_data['avg_price']:8.2f}"
        trend_symbol = "⬆️" if market_data['trend'].lower() == 'increasing' else "⬇️"
        print(f"\n{i}. {market_data['market']}")
        print(f"   Price: {price_str}")
        print(f"   Trend: {trend_symbol} {market_data['trend'].upper()}")
    
    if len(result['all_markets']) > 5:
        print(f"\n... and {len(result['all_markets']) - 5} more markets")
    
    print(f"\n{'=' * 70}\n")


def save_prediction_to_file(result):
    """Save prediction result to file"""
    try:
        filename = 'farmer_predictions.json'
        
        # Load existing predictions
        try:
            with open(filename, 'r') as f:
                predictions_list = json.load(f)
        except:
            predictions_list = []
        
        # Add new prediction
        predictions_list.append({
            'state': result['state'],
            'district': result['district'],
            'commodity': result['commodity'],
            'best_market': result['best_market'],
            'predicted_price': result['predicted_avg_price_next_7_days'],
            'trend': result['trend'],
            'timestamp': result['prediction_timestamp']
        })
        
        # Save
        with open(filename, 'w') as f:
            json.dump(predictions_list, f, indent=2)
        
        print(f"✓ Prediction saved to {filename}")
    except Exception as e:
        logger.error(f"Error saving prediction: {str(e)}")


def run_interactive_mode():
    """Run interactive mode for farmer input"""
    
    try:
        # Display menu
        states, districts, commodities, df = display_menu()
        
        if states is None:
            return
        
        # Get farmer input
        state, district, commodity = get_farmer_input(states, districts, commodities)
        
        # Make prediction
        print("\n⏳ Generating predictions...")
        result = predict_best_market(state, district, commodity)
        
        # Display results
        display_prediction_result(result)
        
        # Save prediction
        if result.get('success'):
            save_prediction_to_file(result)
        
        # Ask if farmer wants to search again
        again = input("\nDo you want to check another commodity? (yes/no): ").strip().lower()
        if again in ['yes', 'y']:
            run_interactive_mode()
    
    except KeyboardInterrupt:
        print("\n\n👋 Thank you for using the Mandi Price Prediction System!")
        return
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        print(f"❌ An error occurred: {str(e)}")


def run_batch_mode():
    """Run batch mode with predefined inputs"""
    
    print("\n" + "=" * 70)
    print("🌾 BATCH PREDICTION TEST")
    print("=" * 70)
    
    # Test different farmer scenarios
    test_cases = [
        ('Maharashtra', 'Ahmednagar', 'Tomato'),
        ('Maharashtra', 'Ahmednagar', 'Onion'),
        ('Maharashtra', 'Ahmednagar', 'Potato'),
        ('Maharashtra', 'Pune', 'Tomato'),
        ('Maharashtra', 'Nasik', 'Onion'),
    ]
    
    results = []
    
    for state, district, commodity in test_cases:
        print(f"\n📍 Predicting for: {state} | {district} | {commodity}")
        
        result = predict_best_market(state, district, commodity)
        results.append(result)
        
        if result.get('success'):
            print(f"  ✓ Best Market: {result['best_market']}")
            print(f"  💰 Predicted Price: Rs. {result['predicted_avg_price_next_7_days']}")
            print(f"  📈 Trend: {result['trend']}")
        else:
            print(f"  ❌ Error: {result.get('error')}")
    
    # Save all results
    with open('batch_predictions.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n✓ All predictions saved to batch_predictions.json\n")


def main():
    """Main function"""
    print("\n" + "=" * 70)
    print("🌾 MANDI PRICE PREDICTION SYSTEM")
    print("=" * 70)
    print("\nChoose mode:")
    print("1. Interactive (Farmer Input)")
    print("2. Batch Test (Predefined Scenarios)")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == '1':
        run_interactive_mode()
    elif choice == '2':
        run_batch_mode()
    else:
        print("❌ Invalid choice")


if __name__ == "__main__":
    main()
