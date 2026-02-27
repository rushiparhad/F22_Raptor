# AgriChain Pro

AgriChain Pro is an agriculture decision support platform.  
It helps farmers decide:

- when to harvest
- which market (mandi/APMC) to sell in
- expected selling price
- spoilage risk during transport

## Project Overview

This project has:

- `AgriChain_Final_Project/backend` → FastAPI backend with prediction models
- `AgriChain_Final_Project/frontend` → React dashboard for farmers and users

## Core AI/ML Models (3 Models)

### 1. Price Prediction Model
- Predicts expected crop price for markets.
- Compares available markets.
- Suggests the best market with higher expected return.

### 2. Harvest Timing Model
- Predicts recommended harvest timing (in days).
- Uses crop + location context.
- Helps farmer plan the harvest window.

### 3. Spoilage Risk Model
- Estimates spoilage risk during transportation.
- Uses travel and handling-related signals.
- Gives safer transport guidance.

## Final Recommendation Logic

The backend combines outputs from all 3 models to generate one final advice:

- best market to sell
- expected price
- harvest timing
- spoilage risk and transport recommendation

## How Farmers Can Use It

1. Open the dashboard.
2. Enter crop name and location.
3. Click **Run Analysis**.
4. Read final recommendation:
   - harvest in how many days
   - best mandi to sell
   - expected price per quintal
   - distance and route to market
   - spoilage risk level (Low/Medium/High)
   - simple transport advice

## Clone and Run the Project

## 1) Clone Repository

```bash
git clone <your-repo-url>
cd AgriChain_Final_Project
```

## 2) Run Backend

```bash
cd AgriChain_Final_Project/backend
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

Linux/Mac:
```bash
source .venv/bin/activate
```

Install dependencies and start backend:

```bash
pip install -r requirements.txt
python -m uvicorn main_api:app --host 127.0.0.1 --port 8000
```

Backend health endpoint:

```text
http://127.0.0.1:8000/health
```

## 3) Run Frontend

```bash
cd AgriChain_Final_Project/frontend
npm install
npm run dev
```

Open frontend in browser (port shown in terminal, usually 8080/8081/8082):

```text
http://127.0.0.1:<port>
```

## API Endpoint (Main)

```text
GET /agrichain?crop=<crop>&location=<location>
```

Example:

```text
http://127.0.0.1:8000/agrichain?crop=onion&location=pune
```

## Tech Stack

- Backend: FastAPI, Python, Pandas, Numpy
- Frontend: React, TypeScript, Tailwind CSS, Recharts, React-Leaflet, i18next
