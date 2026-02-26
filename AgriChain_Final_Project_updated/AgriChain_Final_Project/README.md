# AgriChain

Farm-to-market intelligence web application.

This repository contains two main parts:

- **backend**: FastAPI service providing crop/price/spoilage analysis
- **frontend**: React/Vite application with interactive UI, theme support, i18n, and map view

## Requirements

- Python 3.11+ (for backend)
- Node.js (18+) and npm (frontend)

## Running locally

### Backend

```powershell
cd AgriChain_Final_Project/backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
# ensure pandas/numpy installed too (listed in requirements)

uvicorn main_api:app --reload --host 127.0.0.1 --port 8000
```

API endpoints:

- GET `/health` → simple health check
- GET `/agrichain?crop=<crop>&location=<location>` → main prediction payload

### Frontend

```powershell
cd AgriChain_Final_Project/AgriChain_Final_Project/frontend
npm install
npm run dev
```

The dev server runs on port 8081 by default (fallback if 8080 is busy). View in browser at `http://localhost:8081`.

You can:

- toggle light/dark theme using the button in header
- choose language (English/Hindi/Marathi)
- enter crop and location to get results
- after analysis map will show your location and top markets

## Notes

- Map uses OpenStreetMap/Nominatim for geocoding and tiles (light/dark tiles based on theme).
- Translations stored under `frontend/src/locales` and loaded via `react-i18next`.
- Theme handling via `next-themes`.

Feel free to extend with animations, custom icons, or additional market data.
