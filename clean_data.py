"""
Step 1: Data Cleaning Pipeline
Loads, merges, and cleans mandi data from multiple CSV files
"""

import os
import pandas as pd
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def load_and_merge_data(data_folder='data/'):
    """
    Load all CSV files from the data folder and merge them.
    
    Args:
        data_folder (str): Path to folder containing CSV files
        
    Returns:
        pd.DataFrame: Merged dataframe from all CSV files
    """
    try:
        # Get all CSV files
        csv_files = list(Path(data_folder).glob('*.csv'))
        
        if not csv_files:
            raise FileNotFoundError(f"No CSV files found in {data_folder}")
        
        logger.info(f"Found {len(csv_files)} CSV files")
        
        # Load and merge all CSVs
        dfs = []
        for csv_file in csv_files:
            logger.info(f"Loading: {csv_file.name}")
            # Skip the first row (it's a header description)
            df = pd.read_csv(csv_file, skiprows=1)
            dfs.append(df)
        
        # Merge all dataframes
        merged_df = pd.concat(dfs, ignore_index=True)
        logger.info(f"Merged dataframe shape: {merged_df.shape}")
        
        return merged_df
    
    except Exception as e:
        logger.error(f"Error loading/merging data: {str(e)}")
        raise


def clean_data(df):
    """
    Clean and prepare data for modeling.
    
    Args:
        df (pd.DataFrame): Raw merged dataframe
        
    Returns:
        pd.DataFrame: Cleaned dataframe
    """
    try:
        # Select required columns
        required_cols = ['State', 'District', 'Market', 'Commodity', 'Modal Price', 'Arrival Date']
        df = df[required_cols].copy()
        
        logger.info("Selected required columns")
        
        # Rename columns for Prophet
        df = df.rename(columns={
            'Arrival Date': 'ds',
            'Modal Price': 'y'
        })
        
        logger.info("Renamed columns: Arrival Date → ds, Modal Price → y")
        
        # Clean Modal Price: remove commas and convert to numeric
        df['y'] = df['y'].astype(str).str.replace(',', '').str.strip()
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        
        logger.info("Converted Modal Price to numeric")
        
        # Convert date to datetime - handle DD-MM-YYYY format
        df['ds'] = pd.to_datetime(df['ds'], format='%d-%m-%Y', errors='coerce')
        
        logger.info("Converted Arrival Date to datetime")
        
        # Drop rows with missing values
        initial_rows = len(df)
        df = df.dropna()
        removed_rows = initial_rows - len(df)
        logger.info(f"Dropped {removed_rows} rows with missing values")
        
        # Sort by date
        df = df.sort_values('ds').reset_index(drop=True)
        
        logger.info(f"Cleaned dataframe shape: {df.shape}")
        logger.info(f"Date range: {df['ds'].min()} to {df['ds'].max()}")
        
        return df
    
    except Exception as e:
        logger.error(f"Error cleaning data: {str(e)}")
        raise


def save_cleaned_data(df, output_path='data/maharashtra_cleaned.csv'):
    """
    Save cleaned data to CSV.
    
    Args:
        df (pd.DataFrame): Cleaned dataframe
        output_path (str): Path to save the file
    """
    try:
        df.to_csv(output_path, index=False)
        logger.info(f"Cleaned data saved to: {output_path}")
        logger.info(f"Total records: {len(df)}")
        logger.info(f"Unique commodities: {df['Commodity'].nunique()}")
        logger.info(f"Unique markets: {df['Market'].nunique()}")
        logger.info(f"Unique commodity-market combinations: {df.groupby(['Commodity', 'Market']).ngroups}")
    
    except Exception as e:
        logger.error(f"Error saving data: {str(e)}")
        raise


def main():
    """Main execution function"""
    try:
        logger.info("=" * 60)
        logger.info("STEP 1: DATA CLEANING PIPELINE")
        logger.info("=" * 60)
        
        # Load and merge
        logger.info("\n[1/3] Loading and merging CSV files...")
        df = load_and_merge_data('data/')
        
        # Clean data
        logger.info("\n[2/3] Cleaning data...")
        df = clean_data(df)
        
        # Save cleaned data
        logger.info("\n[3/3] Saving cleaned data...")
        save_cleaned_data(df)
        
        logger.info("\n" + "=" * 60)
        logger.info("✓ Data cleaning completed successfully!")
        logger.info("=" * 60)
        
        return df
    
    except Exception as e:
        logger.error(f"\n✗ Error in data cleaning pipeline: {str(e)}")
        raise


if __name__ == "__main__":
    main()
