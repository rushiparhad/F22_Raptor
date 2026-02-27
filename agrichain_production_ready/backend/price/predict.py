"""
Step 3: Prediction Engine
Predicts best market for a commodity based on trained Prophet models
"""

import os
import json
import pandas as pd
import logging
import pickle
from pathlib import Path
from datetime import datetime, timedelta
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_cleaned_data(data_path='data/maharashtra_cleaned.csv'):
    """
    Load the cleaned dataset.
    
    Args:
        data_path (str): Path to cleaned CSV file
        
    Returns:
        pd.DataFrame: Cleaned dataframe
    """
    try:
        df = pd.read_csv(data_path)
        df['ds'] = pd.to_datetime(df['ds'])
        return df
    except Exception as e:
        logger.error(f"Error loading cleaned data: {str(e)}")
        raise


def load_model(commodity, market=None, district=None, state=None, model_dir='model/'):
    """
    Load a trained Prophet model from disk with automatic fallback.

    Args:
        commodity (str): Commodity name
        market (str, optional): Specific market name
        district (str, optional): District name for fallback
        state (str, optional): State name for fallback
        model_dir (str): Directory containing models

    Returns:
        tuple: (Prophet model or None, scope_type, scope_name)
               scope_type is one of 'market','district','state' or None
               scope_name is the actual name used
    """
    try:
        commodity_clean = commodity.lower().replace(' ', '_')

        # Helper to load file
        def try_load(scope_type, name):
            clean = name.lower().replace(' ', '_')
            filename = f"{commodity_clean}__{scope_type}__{clean}.pkl"
            filepath = os.path.join(model_dir, filename)
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    return pickle.load(f)
            return None

        # market-level first
        if market:
            model = try_load('market', market)
            if model is not None:
                return model, 'market', market
        # district fallback
        if district:
            model = try_load('district', district)
            if model is not None:
                return model, 'district', district
        # state fallback
        if state:
            model = try_load('state', state)
            if model is not None:
                return model, 'state', state

        return None, None, None

    except Exception as e:
        logger.error(f"Error loading model for {commodity} | {market or district or state}: {str(e)}")
        return None, None, None


def predict_next_7_days(model, periods=7):
    """
    Make predictions for next N days using a Prophet model.
    
    Args:
        model (Prophet): Trained Prophet model
        periods (int): Number of days to predict
        
    Returns:
        pd.DataFrame: Predictions with 'ds' and 'yhat' columns
    """
    try:
        future = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)
        
        # Get only future predictions and ensure non-negative prices
        future_forecast = forecast[['ds', 'yhat']].tail(periods).copy()
        # Clip predictions to zero (prices cannot be negative) and round
        future_forecast['yhat'] = future_forecast['yhat'].clip(lower=0).round(2)

        return future_forecast
    
    except Exception as e:
        logger.error(f"Error making predictions: {str(e)}")
        return None


def calculate_trend(forecast_df):
    """
    Calculate trend from predictions using linear regression.
    
    Args:
        forecast_df (pd.DataFrame): Forecast dataframe with predictions
        
    Returns:
        dict: Contains trend direction, percentage change, and confidence
    """
    try:
        if forecast_df is None or len(forecast_df) < 2:
            return {
                "direction": "unknown",
                "percentage_change": 0,
                "confidence": "low",
                "description": "Insufficient data"
            }
        
        # Simple linear regression on predicted values
        x = np.arange(len(forecast_df))
        y = forecast_df['yhat'].values
        
        # Calculate slope
        slope = np.polyfit(x, y, 1)[0]
        
        # Calculate percentage change safely (avoid division by zero)
        first_price = y[0]
        last_price = y[-1]
        mean_price = np.mean(y)
        denom = first_price if first_price > 0 else (mean_price if mean_price > 0 else 1.0)
        percentage_change = ((last_price - first_price) / denom) * 100
        
        # Determine direction from percentage change (more intuitive)
        if percentage_change > 0:
            direction = "increasing"
            description = "PRICES WILL GO UP ⬆️"
        elif percentage_change < 0:
            direction = "decreasing"
            description = "PRICES WILL GO DOWN ⬇️"
        else:
            direction = "stable"
            description = "PRICES WILL REMAIN STABLE ➡️"

        # Calculate confidence based on percentage change magnitude and slope
        abs_pct = abs(percentage_change)
        if abs_pct > 10 or abs(slope) > 2:
            confidence = "high"
        elif abs_pct > 1 or abs(slope) > 0.5:
            confidence = "medium"
        else:
            confidence = "low"
        
        return {
            "direction": direction,
            "percentage_change": round(percentage_change, 2),
            "confidence": confidence,
            "description": description,
            "slope": slope
        }
    
    except Exception as e:
        logger.error(f"Error calculating trend: {str(e)}")
        return {
            "direction": "unknown",
            "percentage_change": 0,
            "confidence": "low",
            "description": "Unable to analyze trend"
        }


def predict_best_market(state, district, commodity, forecast_days=7, data_path='data/maharashtra_cleaned.csv'):
    """
    Predict the best market for a given commodity in a district.
    
    This function:
    1. Filters all markets in the district for the commodity
    2. Loads trained models for each market
    3. Generates 7-day forecasts
    4. Compares average predicted prices
    5. Returns the best (highest price) market
    
    Args:
        state (str): State name (e.g., 'Maharashtra')
        district (str): District name (e.g., 'Ahmednagar')
        commodity (str): Commodity name (e.g., 'Tomato')
        forecast_days (int): Number of days to forecast (default: 7)
        data_path (str): Path to cleaned data
        
    Returns:
        dict: Prediction result with best market, avg price, and trend
    """
    try:
        logger.info(f"\nPredicting best market...")
        logger.info(f"  State: {state}, District: {district}, Commodity: {commodity}")
        
        # Load cleaned data
        df = load_cleaned_data(data_path)
        
        # Filter for state, district, and commodity (case-insensitive for commodity)
        filtered_df = df[
            (df['State'] == state) & 
            (df['District'] == district) & 
            (df['Commodity'].str.lower() == commodity.lower())
        ]
        
        if len(filtered_df) == 0:
            logger.warning(f"No data found for {state} | {district} | {commodity}")
            return {
                "success": False,
                "error": f"No data found for {state} | {district} | {commodity}"
            }
        
        # Get unique markets
        markets = filtered_df['Market'].unique()
        logger.info(f"Found {len(markets)} markets for this commodity")
        
        predictions = []
        
        # Predict for each market with fallback handling
        seen_scopes = set()
        for market in markets:
            # Load model, passing district and state for fallback
            model, scope_type, scope_name = load_model(
                commodity, market=market, district=district, state=state
            )
            
            if model is None:
                logger.debug(f"  ⚠ No trained model for {market} (after fallback)")
                continue
            
            key = (scope_type, scope_name)
            if key in seen_scopes:
                continue
            seen_scopes.add(key)
            
            # Make predictions
            forecast = predict_next_7_days(model, periods=forecast_days)
            
            if forecast is None or len(forecast) == 0:
                logger.debug(f"  ⚠ Could not generate forecast for {scope_type}:{scope_name}")
                continue
            
            # Calculate average predicted price
            avg_price = forecast['yhat'].mean()
            
            # Calculate trend
            trend_data = calculate_trend(forecast)
            
            # Calculate price volatility
            price_std = forecast['yhat'].std()
            volatility = "High" if price_std > (avg_price * 0.1) else "Medium" if price_std > (avg_price * 0.05) else "Low"
            
            # Label based on scope type
            if scope_type == 'market':
                label = scope_name
            elif scope_type == 'district':
                label = f"All markets in {scope_name} (district)"
            elif scope_type == 'state':
                label = f"All markets in {scope_name} (state)"
            else:
                label = scope_name or market
            
            predictions.append({
                'market': label,
                'avg_price': round(avg_price, 2),
                'min_price': round(forecast['yhat'].min(), 2),
                'max_price': round(forecast['yhat'].max(), 2),
                'trend': trend_data,
                'volatility': volatility,
                'forecast': forecast,
                'scope_type': scope_type,
                'scope_name': scope_name
            })
            
            logger.debug(f"  ✓ {label}: Avg Price = {avg_price:.2f}, Trend = {trend_data['direction']}")
        
        if len(predictions) == 0:
            logger.warning("No valid predictions could be generated")
            return {
                "success": False,
                "error": "No trained models available for this commodity in the district"
            }
        
        # Find best market (highest average predicted price)
        best_market_pred = max(predictions, key=lambda x: x['avg_price'])
        
        # Prepare response
        result = {
            "success": True,
            "state": state,
            "district": district,
            "commodity": commodity,
            "best_market": best_market_pred['market'],
            "predicted_avg_price_next_7_days": best_market_pred['avg_price'],
            "predicted_min_price": best_market_pred['min_price'],
            "predicted_max_price": best_market_pred['max_price'],
            "price_range": best_market_pred['max_price'] - best_market_pred['min_price'],
            "trend": best_market_pred['trend'],
            "volatility": best_market_pred['volatility'],
            "forecast_days": forecast_days,
            "prediction_timestamp": datetime.now().isoformat(),
            "all_markets": [
                {
                    "market": p['market'],
                    "avg_price": p['avg_price'],
                    "min_price": p['min_price'],
                    "max_price": p['max_price'],
                    "trend": p['trend'],
                    "volatility": p['volatility']
                } for p in sorted(predictions, key=lambda x: x['avg_price'], reverse=True)
            ]
        }
        
        logger.info(f"  ✓ Best Market: {result['best_market']}")
        logger.info(f"    Predicted Avg Price: Rs. {result['predicted_avg_price_next_7_days']}")
        logger.info(f"    Trend: {result['trend']['description']}")
        
        return result
    
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }


def print_prediction_result(result):
    """
    Pretty print prediction results.
    
    Args:
        result (dict): Prediction result from predict_best_market
    """
    if not result.get('success'):
        print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
        return
    
    print("\n" + "=" * 70)
    print("PREDICTION RESULT")
    print("=" * 70)
    print(f"State: {result['state']}")
    print(f"District: {result['district']}")
    print(f"Commodity: {result['commodity']}")
    print(f"Forecast Period: Next {result['forecast_days']} days")
    print("-" * 70)
    print(f"🏆 Best Market: {result['best_market']}")
    print(f"💰 Predicted Avg Price (next 7 days): Rs. {result['predicted_avg_price_next_7_days']}")
    print(f"   Min: Rs. {result['predicted_min_price']} | Max: Rs. {result['predicted_max_price']}")
    # Trend information
    trend_info = result.get('trend', {})
    if isinstance(trend_info, dict):
        desc = trend_info.get('description', '')
        direction = trend_info.get('direction', 'unknown').upper()
        pct = trend_info.get('percentage_change', 0)
        print(f"📈 Trend: {desc}")
        print(f"   Direction: {direction} | Expected change: {pct:+.2f}%")
    else:
        print(f"📈 Trend: {str(trend_info)}")

    print("-" * 70)
    print("\nAll Markets (sorted by predicted price):")
    for i, market_data in enumerate(result['all_markets'], 1):
        mtrend = market_data.get('trend', {})
        if isinstance(mtrend, dict):
            mdir = mtrend.get('direction', 'unknown').upper()
            mpct = mtrend.get('percentage_change', 0)
            trend_str = f"{mdir} ({mpct:+.2f}%)"
        else:
            trend_str = str(mtrend)
        print(f"  {i}. {market_data['market']:30} - Avg: Rs. {market_data['avg_price']:8.2f} ({trend_str})")
    print("=" * 70 + "\n")


def main():
    """Main prediction execution function with examples"""
    try:
        logger.info("=" * 70)
        logger.info("STEP 3: PREDICTION ENGINE")
        logger.info("=" * 70)
        
        # Load data to understand available options
        logger.info("\nLoading available data...")
        df = load_cleaned_data()
        
        states = df['State'].unique()
        logger.info(f"Available States: {', '.join(states)}")
        
        districts = df['District'].unique()
        logger.info(f"Available Districts: {len(districts)} unique districts")
        
        commodities = df['Commodity'].unique()
        logger.info(f"Available Commodities: {', '.join(sorted(commodities)[:5])}... ({len(commodities)} total)")
        
        # Example predictions
        logger.info("\n" + "-" * 70)
        logger.info("RUNNING EXAMPLE PREDICTIONS")
        logger.info("-" * 70)
        
        # Get first few valid combinations
        test_combinations = [
            ('Maharashtra', 'Ahmednagar', 'Onion'),
            ('Maharashtra', 'Ahmednagar', 'Tomato'),
        ]
        
        results = []
        for state, district, commodity in test_combinations:
            # Check if combination exists
            combo_data = df[
                (df['State'] == state) & 
                (df['District'] == district) & 
                (df['Commodity'] == commodity)
            ]
            
            if len(combo_data) > 0:
                result = predict_best_market(state, district, commodity)
                results.append(result)
                print_prediction_result(result)
            else:
                logger.info(f"\n⚠ No data for {state} | {district} | {commodity}")
        
        # Save results to JSON
        if results:
            output_file = 'predictions.json'
            with open(output_file, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            logger.info(f"\n✓ Predictions saved to: {output_file}")
        
        logger.info("\n" + "=" * 70)
        logger.info("✓ Prediction engine is ready!")
        logger.info("=" * 70)
        logger.info("\nTo use:")
        logger.info("  from predict import predict_best_market")
        logger.info("  result = predict_best_market('Maharashtra', 'Ahmednagar', 'Tomato')")
        logger.info("=" * 70 + "\n")
        
        return results
    
    except Exception as e:
        logger.error(f"\n✗ Error in prediction engine: {str(e)}")
        raise


if __name__ == "__main__":
    main()
