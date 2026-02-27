🌾 AgriChain — Farm-to-Market Intelligence Platform
Python
FastAPI
React
AI Powered
Hackathon Project

Production-ready AI decision platform for farmers
Helping farmers decide when to harvest, where to sell, and how to transport safely.

✨ Why AgriChain?
Farmers lose income not only from low prices, but from bad timing + high spoilage risk + weak transport decisions.
AgriChain combines multi-model intelligence to convert uncertainty into one clear, explainable recommendation.

What AgriChain solves
Harvest timing uncertainty
Mandi/market selection confusion
Post-harvest spoilage losses
Profit vs risk trade-off complexity
🧠 Core Intelligence Modules
Harvest Timing Intelligence
Recommends optimal harvest window based on weather-risk-aware logic.

Price Forecast Intelligence (Prophet-based)
Forecasts market price trends and identifies attractive sell opportunities.

🧪 Spoilage Intelligence Engine (Core Innovation)
Predicts post-harvest quality risk under real transport and weather conditions.

Decision Fusion Engine
Balances price upside with spoilage and timing constraints to output the final recommendation.

🧪 Spoilage Intelligence Engine (Core Innovation)
This is AgriChain’s differentiator.

What it analyzes
🌡️ Temperature exposure
💧 Humidity conditions
🚚 Transport duration
🧺 Crop shelf life
📦 Transport stress factors
⏱️ Remaining safe time before quality drop
Risk output
LOW
MEDIUM
HIGH
Biological reasoning (simple & practical)
Temperature ↑ → respiration ↑ → faster decay
Long transport → moisture loss + microbial growth
High humidity + delay = accelerated spoilage risk
Why this matters for Indian farmers
Even when mandi price is high, long risky transport can destroy value.
AgriChain helps farmers avoid “high price but low realized profit” decisions.

🏗️ System Architecture
Farmer Input
    ↓
Frontend Dashboard
    ↓
FastAPI Backend
    ├── Harvest Model
    ├── Price Forecast Model (Prophet)
    ├── Spoilage Risk Model
    ↓
Decision Engine
    ↓
Explainable Recommendation
✅ Features
✅ AI harvest advisor
✅ 7-day mandi price forecasting
✅ Market comparison engine
✅ Spoilage risk prediction
✅ Transport safety analysis
✅ Profit vs Risk decision logic
✅ Interactive farmer tutorial (Hindi/Marathi/English)
✅ Market selection simulation
✅ Explainable AI recommendations
🧰 Tech Stack
Backend
Python
FastAPI
Prophet
Pandas
NumPy
ML feature engineering
Frontend
React
Vite
TailwindCSS
TypeScript
AI Concepts
Time Series Forecasting
Risk Modeling
Feature Engineering
Decision Fusion System
📁 Repository Structure
agrichain_production_ready/
 ├── backend/
 │    ├── harvest/
 │    ├── price/
 │    ├── spoilage/
 │    ├── integration/
 │    └── main_api.py
 └── frontend/
      └── React + Vite Farmer Dashboard
⚙️ How To Run
1) Backend
cd agrichain_production_ready/backend
pip install -r requirements.txt
uvicorn main_api:app --reload
Backend URL: http://127.0.0.1:8000

2) Frontend
cd agrichain_production_ready/frontend
npm install
npm run dev
Frontend URL: http://localhost:5173

🚀 Future Scalability
Real-time mandi API integration
Satellite weather feed ingestion
Cold-chain logistics optimization
Mobile app deployment (farmer-first UX)
Multi-state model expansion across India
Reinforcement learning-based pricing strategy
🌍 Hackathon Impact
AgriChain is built for real-world outcomes:

📉 Reduce post-harvest losses
💰 Increase farmer realized profit
📊 Enable data-driven agriculture decisions
🧑‍🌾 Deliver accessible AI for low digital literacy users
🏁 Hackathon Positioning
AgriChain combines technical depth + practical usability + real social impact:

Multi-model AI architecture
Explainable recommendations
Multilingual onboarding
Farmer-centric product design
Built to move from prototype to deployment-ready agri intelligence.

⚙️ Running the Project
Prerequisites
Python 3.10+
Node.js 18+ and npm
Git
1) Clone Repository
git clone <your-repo-url>
cd agrichain_production_ready
2) Start Backend (FastAPI)
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main_api:app --reload --host 127.0.0.1 --port 8000
Backend runs at: http://127.0.0.1:8000
API docs: http://127.0.0.1:8000/docs

3) Start Frontend (React + Vite)
Open a new terminal:

cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173
(Note: if 5173 is busy, Vite will auto-pick another port like 5174/8080.)

4) Verify End-to-End
Open frontend URL in browser
Submit crop + location
Ensure backend health/analysis requests succeed
Quick Troubleshooting
If vite: Permission denied:
chmod +x node_modules/.bin/vite
If backend import/module errors: re-check virtualenv activation and reinstall requirements.
If CORS/API connection fails: confirm backend is running on 127.0.0.1 (line 8000).
