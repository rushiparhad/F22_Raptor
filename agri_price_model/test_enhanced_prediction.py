"""
Test script to demonstrate the enhanced farmer prediction system
"""

from farmer_input import display_prediction_result
from predict import predict_best_market

print("\n" + "=" * 80)
print("TESTING ENHANCED FARMER PREDICTION SYSTEM")
print("=" * 80)

# Fallback test: market with missing model should still return district fallback
print("\n[TEST FALLBACK] Predicting price for CABBAGE in AHMEDNAGAR at Rahuri(Songaon) APMC (market-level missing)")
print("-" * 80)
fb = predict_best_market('Maharashtra', 'Ahmednagar', 'Cabbage')
if fb.get('success'):
    display_prediction_result(fb)
else:
    print(f"❌ Prediction failed: {fb.get('error')}")

# Test case 1: Cabbage in Ahmednagar
print("\n[TEST 1] Predicting price for CABBAGE in AHMEDNAGAR")
print("-" * 80)

result1 = predict_best_market('Maharashtra', 'Ahmednagar', 'Cabbage')
if result1.get('success'):
    display_prediction_result(result1)
else:
    print(f"❌ Prediction failed: {result1.get('error')}")

# Test case 2: Carrot in Pune
print("\n\n[TEST 2] Predicting price for CARROT in PUNE")
print("-" * 80)

result2 = predict_best_market('Maharashtra', 'Pune', 'Carrot')
if result2.get('success'):
    display_prediction_result(result2)
else:
    print(f"❌ Prediction failed: {result2.get('error')}")

# Test case 3: Green Chilli in Nasik
print("\n\n[TEST 3] Predicting price for GREEN CHILLI in NASIK")
print("-" * 80)

result3 = predict_best_market('Maharashtra', 'Nasik', 'Green Chilli')
if result3.get('success'):
    display_prediction_result(result3)
else:
    print(f"❌ Prediction failed: {result3.get('error')}")

# Test case 4: Garlic in Mumbai
print("\n\n[TEST 4] Predicting price for GARLIC in MUMBAI district")
print("-" * 80)

result4 = predict_best_market('Maharashtra', 'Mumbai', 'Garlic')
if result4.get('success'):
    display_prediction_result(result4)
else:
    print(f"❌ Prediction failed: {result4.get('error')}")

print("\n" + "=" * 80)
print("✓ All tests completed!")
print("=" * 80 + "\n")
