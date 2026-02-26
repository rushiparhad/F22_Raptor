"""
Step 2: Model Training Pipeline
Trains separate Prophet models for each Commodity + Market combination
"""

import os
import pandas as pd
import logging
import pickle
from pathlib import Path
from prophet import Prophet

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_model_directory(model_dir='model/'):
    """
    Create model directory if it doesn't exist.
    
    Args:
        model_dir (str): Path to model directory
    """
    try:
        Path(model_dir).mkdir(exist_ok=True)
        logger.info(f"Model directory ready: {model_dir}")
    except Exception as e:
        logger.error(f"Error creating model directory: {str(e)}")
        raise


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
        logger.info(f"Loaded cleaned data: {len(df)} records")
        return df
    except Exception as e:
        logger.error(f"Error loading cleaned data: {str(e)}")
        raise


def train_prophet_model(df, commodity, market, min_records=30):
    """
    Train a Prophet model for a specific commodity-market combination.
    
    Args:
        df (pd.DataFrame): Data for this commodity-market pair
        commodity (str): Commodity name
        market (str): Market name
        min_records (int): Minimum records required to train
        
    Returns:
        Prophet or None: Trained model or None if insufficient data
    """
    try:
        # Check if we have enough data
        if len(df) < min_records:
            logger.warning(
                f"  ⚠ {commodity} | {market}: Only {len(df)} records (need >{min_records}). Skipping."
            )
            return None
        
        # Prepare data for Prophet
        prophet_df = df[['ds', 'y']].copy()
        
        # Remove duplicates by date (take mean price if multiple entries per day)
        prophet_df = prophet_df.groupby('ds')['y'].mean().reset_index()
        
        if len(prophet_df) < min_records:
            logger.warning(
                f"  ⚠ {commodity} | {market}: Only {len(prophet_df)} unique dates (need >{min_records}). Skipping."
            )
            return None
        
        # Initialize Prophet model
        model = Prophet(
            yearly_seasonality=False,  # Data is only few months
            weekly_seasonality=True,   # Weekly patterns important for agri
            daily_seasonality=False,   # No daily seasonality
            interval_width=0.95,       # 95% confidence interval
            changepoint_prior_scale=0.05  # Reasonable default for agri data
        )
        
        # Fit model
        model.fit(prophet_df)
        
        logger.info(f"  ✓ {commodity} | {market}: {len(prophet_df)} data points. Model trained.")
        
        return model
    
    except Exception as e:
        logger.error(f"  ✗ Error training model for {commodity} | {market}: {str(e)}")
        return None


def save_model(model, commodity, scope_name, scope_type='market', model_dir='model/'):
    """
    Save trained model to pickle file.

    Args:
        model (Prophet): Trained Prophet model
        commodity (str): Commodity name
        scope_name (str): Market/District/State name
        scope_type (str): One of 'market','district','state'
        model_dir (str): Directory to save models

    Returns:
        str: Path to saved model
    """
    try:
        # Create filename from commodity and scope
        # Replace spaces with underscores and convert to lowercase
        commodity_clean = commodity.lower().replace(' ', '_')
        scope_clean = scope_name.lower().replace(' ', '_')
        # filename pattern: {commodity}__{scope_type}__{scope}
        filename = f"{commodity_clean}__{scope_type}__{scope_clean}.pkl"
        filepath = os.path.join(model_dir, filename)

        # Save model
        with open(filepath, 'wb') as f:
            pickle.dump(model, f)

        return filepath

    except Exception as e:
        logger.error(f"Error saving model for {commodity} | {scope_name}: {str(e)}")
        raise


def main():
    """Main training execution function"""
    try:
        logger.info("=" * 60)
        logger.info("STEP 2: MODEL TRAINING PIPELINE")
        logger.info("=" * 60)
        
        # Create model directory
        logger.info("\n[1/3] Creating model directory...")
        create_model_directory()
        
        # Load cleaned data
        logger.info("\n[2/3] Loading cleaned data...")
        df = load_cleaned_data()
        
        # Get unique commodity-market combinations
        commodity_market_pairs = df.groupby(['Commodity', 'Market']).size().reset_index(name='count')
        logger.info(f"Found {len(commodity_market_pairs)} commodity-market combinations")
        
        # Train models with fallback tiers: market -> district -> state
        logger.info(f"\n[3/3] Training models with fallbacks (market/district/state)...")
        logger.info("-" * 60)

        # thresholds
        min_market = 15
        min_district = 25
        min_state = 30

        trained_models = 0
        skipped_markets = []

        # 1) Market-level models (try lower threshold)
        for idx, row in commodity_market_pairs.iterrows():
            commodity = row['Commodity']
            market = row['Market']

            pair_df = df[(df['Commodity'] == commodity) & (df['Market'] == market)].copy()

            model = train_prophet_model(pair_df, commodity, market, min_records=min_market)

            if model is not None:
                save_model(model, commodity, market, scope_type='market')
                trained_models += 1
            else:
                skipped_markets.append((commodity, market))

        # 2) District-level models for skipped markets
        # get unique district groups
        district_groups = df.groupby(['Commodity', 'State', 'District']).size().reset_index(name='count')
        for idx, row in district_groups.iterrows():
            commodity = row['Commodity']
            state = row['State']
            district = row['District']

            group_df = df[(df['Commodity'] == commodity) & (df['State'] == state) & (df['District'] == district)].copy()

            if len(group_df) >= min_district:
                model = train_prophet_model(group_df, commodity, f"{district} (district)", min_records=min_district)
                if model is not None:
                    save_model(model, commodity, district, scope_type='district')
                    trained_models += 1

        # 3) State-level models for remaining missing cases
        state_groups = df.groupby(['Commodity', 'State']).size().reset_index(name='count')
        for idx, row in state_groups.iterrows():
            commodity = row['Commodity']
            state = row['State']

            state_df = df[(df['Commodity'] == commodity) & (df['State'] == state)].copy()

            if len(state_df) >= min_state:
                model = train_prophet_model(state_df, commodity, f"{state} (state)", min_records=min_state)
                if model is not None:
                    save_model(model, commodity, state, scope_type='state')
                    trained_models += 1
        
        logger.info("-" * 60)
        logger.info(f"\n✓ Training completed!")
        logger.info(f"  - Total models trained (including market/district/state): {trained_models}")
        logger.info(f"  - Total market pairs processed: {len(commodity_market_pairs)}")
        logger.info("=" * 60)
        
        return trained_models
    
    except Exception as e:
        logger.error(f"\n✗ Error in training pipeline: {str(e)}")
        raise


if __name__ == "__main__":
    main()
