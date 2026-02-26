# Agricultural Mandi Price Prediction System

A complete end-to-end machine learning pipeline for predicting agricultural commodity prices in mandi markets using Prophet time series forecasting.

## Project Structure

```
agri_price_model/
├── data/
│   ├── Daily Price Arrival Report-07-11-2025 to 26-02-2026 for Maharashtra.csv
│   ├── Daily Price Arrival Report-07-11-2025 to 26-02-2026 for Maharashtra (1).csv
│   ├── Daily Price Arrival Report-07-11-2025 to 26-02-2026 for Maharashtra (2).csv
│   └── maharashtra_cleaned.csv (generated after running clean_data.py)
├── model/ (generated after running train_models.py)
│   ├── tomato_ahmednagar_apmc.pkl
│   ├── onion_ahmednagar_apmc.pkl
│   └── ... (other trained models)
├── clean_data.py
├── train_models.py
├── predict.py
├── requirements.txt
├── README.md
└── venv/ (Python virtual environment)
```

## Installation & Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or manually install:
```bash
pip install pandas prophet numpy
```

## Execution Flow

The pipeline runs in three sequential steps:

### Step 1: Data Cleaning

```bash
python clean_data.py
```

**What it does:**
- Loads all CSV files from the `data/` folder
- Merges them into a single dataframe
- Selects required columns: State, District, Market, Commodity, Modal Price, Arrival Date
- Renames columns for Prophet compatibility (Arrival Date → ds, Modal Price → y)
- Cleans numeric values (removes commas)
- Converts dates to datetime format (DD-MM-YYYY)
- Drops missing values
- Sorts by date
- Saves cleaned master dataset to `data/maharashtra_cleaned.csv`

**Output:**
- `data/maharashtra_cleaned.csv` - Master cleaned dataset

---

### Step 2: Model Training

```bash
python train_models.py
```

**What it does:**
- Loads the cleaned dataset
- Creates separate Prophet models for each unique (Commodity, Market) combination
- Only trains models with > 30 data points
- Disables yearly seasonality (data is only few months)
- Enables weekly seasonality (important for agricultural commodities)
- Handles duplicate dates by taking the mean price
- Saves trained models as pickle files in the `model/` directory

**Configuration:**
- `yearly_seasonality=False` - Not enough data for yearly patterns
- `weekly_seasonality=True` - Agricultural prices have weekly patterns
- `daily_seasonality=False` - No daily patterns in mandi data
- `min_records=30` - Minimum data points required to train

**Output:**
- `model/<commodity>_<market>.pkl` - Trained Prophet models
- Example: `model/tomato_ahmednagar_apmc.pkl`

---

### Step 3: Prediction & Analysis

```bash
python predict.py
```

**What it does:**
- Loads all trained models
- Demonstrates the prediction engine with example predictions
- Runs predictions for Onion and Tomato in Ahmednagar market
- Generates 7-day forecasts for each commodity-market pair
- Calculates trend (increasing/decreasing/stable)
- Identifies the best market (highest predicted average price)
- Saves results to `predictions.json`

**Output:**
- Console output with pretty-printed predictions
- `predictions.json` - Structured prediction results

---

## Using the Prediction Engine

You can also use the prediction function programmatically:

```python
from predict import predict_best_market, print_prediction_result

# Get best market for a commodity
result = predict_best_market(
    state='Maharashtra',
    district='Ahmednagar',
    commodity='Tomato'
)

# Print results
print_prediction_result(result)
```

**Response Format:**

```python
{
    "success": True,
    "state": "Maharashtra",
    "district": "Ahmednagar",
    "commodity": "Tomato",
    "best_market": "Ahmednagar APMC",
    "predicted_avg_price_next_7_days": 1850.50,
    "predicted_min_price": 1700.25,
    "predicted_max_price": 2050.75,
    "trend": "increasing",
    "forecast_days": 7,
    "prediction_timestamp": "2026-02-26T10:30:45.123456",
    "all_markets": [
        {
            "market": "Ahmednagar APMC",
            "avg_price": 1850.50,
            "trend": "increasing"
        },
        ...
    ]
}
```

---

## Data Specifications

### Input Data (CSV Files)

Expected columns:
- `State` - State name (e.g., Maharashtra)
- `District` - District name (e.g., Ahmednagar)
- `Market` - Market/APMC name
- `Commodity` - Commodity name (e.g., Tomato, Onion)
- `Modal Price` - Market modal price (with possible commas)
- `Arrival Date` - Date in DD-MM-YYYY format

### Cleaned Data (Output)

Columns in `maharashtra_cleaned.csv`:
- `State` - State name
- `District` - District name
- `Market` - Market name
- `Commodity` - Commodity name
- `ds` - Date (datetime format, YYYY-MM-DD)
- `y` - Modal Price (numeric)

---

## Key Features

✅ **Automatic Data Merging** - Combines multiple CSV files
✅ **Smart Data Cleaning** - Handles commas in prices, missing values, date formats
✅ **Scalable Model Training** - Creates models only for combinations with sufficient data
✅ **Prophet Integration** - Uses Facebook's Prophet for robust forecasting
✅ **Trend Detection** - Identifies increasing/decreasing price trends
✅ **Market Comparison** - Automatically finds the best market for a commodity
✅ **Error Handling** - Comprehensive logging and error messages
✅ **JSON Output** - Structured predictions for easy integration

---

## Configuration Options

You can customize the following in the scripts:

### clean_data.py
- `data_folder` - Path to CSV files (default: 'data/')
- `output_path` - Where to save cleaned data (default: 'data/maharashtra_cleaned.csv')

### train_models.py
- `min_records` - Minimum records to train a model (default: 30)
- `model_dir` - Where to save models (default: 'model/')
- `yearly_seasonality` - Enable yearly patterns (default: False)
- `weekly_seasonality` - Enable weekly patterns (default: True)

### predict.py
- `forecast_days` - Days to predict ahead (default: 7)
- `data_path` - Path to cleaned data

---

## Troubleshooting

### No CSV files found
- Make sure CSV files are in the `data/` folder
- Check file extensions are `.csv`

### No models trained
- Ensure data cleaning ran successfully (`data/maharashtra_cleaned.csv` exists)
- Some commodity-market combinations may have < 30 data points (shown in logs)

### Import errors
- Run `pip install -r requirements.txt`
- Check Python version (3.7+)

### Prediction returns error
- Check if the state/district/commodity combination exists
- Look at cleaned data to see available options: `df['District'].unique()`

---

## Model Architecture

Each Prophet model uses:
- **Trend Component** - Captures long-term trends in prices
- **Weekly Seasonality** - Captures weekly patterns in agricultural markets
- **Changepoints** - Automatically detects shifts in price behavior
- **Confidence Intervals** - 95% prediction intervals included

---

## Performance Notes

- Data range: November 7, 2025 to February 26, 2026 (~4 months)
- Minimum training data: 30 records per commodity-market pair
- Forecast horizon: 7 days (configurable)
- Processing time: ~1-2 seconds per model training

---

## Next Steps & Improvements

Potential enhancements:
1. Add external features (weather, supply/demand indices)
2. Implement cross-validation for model evaluation
3. Add hyperparameter tuning
4. Create web API for real-time predictions
5. Add forecasting for multiple commodities simultaneously
6. Implement ensemble methods combining multiple models
7. Add price volatility predictions

---

## License & Attribution

This system uses:
- **Prophet** - Facebook's time series forecasting library
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

---

## Contact & Support

For issues or improvements, check logs in console output with proper error messages.
