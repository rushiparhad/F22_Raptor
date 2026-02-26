"""
Quick Test Script - Farmer Input Predictions
Shows how the system predicts prices for different farmer inputs
"""

from predict import predict_best_market
import json

def test_predictions():
    """Test with different farmer inputs"""
    
    print("\n" + "=" * 80)
    print("🌾 FARMER PRICE PREDICTION TESTS")
    print("=" * 80)
    
    # Different scenarios farmers might input
    farmer_inputs = [
        {
            'state': 'Maharashtra',
            'district': 'Ahmednagar',
            'commodity': 'Tomato',
            'farmer_name': 'Ramesh Kumar (Ahmednagar)'
        },
        {
            'state': 'Maharashtra',
            'district': 'Ahmednagar',
            'commodity': 'Onion',
            'farmer_name': 'Priya Desai (Ahmednagar)'
        },
        {
            'state': 'Maharashtra',
            'district': 'Ahmednagar',
            'commodity': 'Potato',
            'farmer_name': 'Ravi Singh (Ahmednagar)'
        },
        {
            'state': 'Maharashtra',
            'district': 'Pune',
            'commodity': 'Tomato',
            'farmer_name': 'Sunil Patil (Pune)'
        },
        {
            'state': 'Maharashtra',
            'district': 'Nashik',
            'commodity': 'Onion',
            'farmer_name': 'Anjali Sharma (Nashik)'
        },
        {
            'state': 'Maharashtra',
            'district': 'Nagpur',
            'commodity': 'Potato',
            'farmer_name': 'Arjun Rao (Nagpur)'
        }
    ]
    
    all_results = []
    
    for idx, farmer in enumerate(farmer_inputs, 1):
        
        print(f"\n{'─' * 80}")
        print(f"TEST {idx}: {farmer['farmer_name']}")
        print(f"{'─' * 80}")
        print(f"   📍 State: {farmer['state']}")
        print(f"   📍 District: {farmer['district']}")
        print(f"   🌾 Commodity: {farmer['commodity']}")
        
        try:
            # Call prediction function
            result = predict_best_market(
                farmer['state'],
                farmer['district'],
                farmer['commodity']
            )
            
            if result.get('success'):
                print(f"\n   ✅ PREDICTION SUCCESS:")
                print(f"   🏆 Best Market: {result['best_market']}")
                print(f"   💰 Predicted Price: Rs. {result['predicted_avg_price_next_7_days']:.2f}")
                print(f"   📊 Price Range: Rs. {result['predicted_min_price']:.2f} - Rs. {result['predicted_max_price']:.2f}")
                print(f"   📈 Trend: {result['trend'].upper()}")
                print(f"   🏙️  Total Markets Available: {len(result['all_markets'])}")
                
                # Show top 3 markets
                print(f"\n   Top 3 Markets by Price:")
                for rank, market in enumerate(result['all_markets'][:3], 1):
                    trend_emoji = "⬆️" if market['trend'].lower() == 'increasing' else "⬇️"
                    print(f"      {rank}. {market['market']:35} Rs. {market['avg_price']:8.2f} {trend_emoji}")
                
                all_results.append(result)
            else:
                print(f"\n   ❌ ERROR: {result.get('error')}")
        
        except Exception as e:
            print(f"\n   ❌ ERROR: {str(e)}")
    
    # Summary table
    print(f"\n{'=' * 80}")
    print("📊 SUMMARY TABLE - ALL FARMER PREDICTIONS")
    print(f"{'=' * 80}")
    
    print(f"\n{'District':<15} {'Commodity':<10} {'Best Market':<35} {'Predicted Price':<15} {'Trend':<12}")
    print(f"{'-' * 80}")
    
    for result in all_results:
        if result.get('success'):
            district = result['district'][:14]
            commodity = result['commodity']
            market = result['best_market'][:34]
            price = f"Rs. {result['predicted_avg_price_next_7_days']:.2f}"
            trend = result['trend'].upper()
            
            print(f"{district:<15} {commodity:<10} {market:<35} {price:<15} {trend:<12}")
    
    # Save to JSON file
    output_file = 'test_predictions.json'
    with open(output_file, 'w') as f:
        json.dump(all_results, f, indent=2, default=str)
    
    print(f"\n{'=' * 80}")
    print(f"✅ Test Complete! Results saved to '{output_file}'")
    print(f"{'=' * 80}\n")


if __name__ == "__main__":
    test_predictions()
