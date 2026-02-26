# AgriChain — Farm-to-Market Intelligence Platform (Prototype)

AgriChain is an **India-focused farm-to-market intelligence platform** designed to reduce post-harvest losses and improve farmer income by helping farmers **decide *when* to harvest and *where* to sell**.

The long-term vision is a mobile-first system that uses weather, soil, and market data to provide **simple, explainable recommendations** to farmers using basic Android phones.

**Current Status:**  
Only **Component A — Harvest Timing Recommendation** has been implemented so far.  
Other components are planned and listed below.

---

## Problem Context

In India, farmers lose up to **30–40% of produce** not because of poor farming practices, but due to:
- Poor harvest timing
- Weather uncertainty
- Market mismatch
- Inadequate post-harvest planning

AgriChain addresses this gap by turning complex data into **clear, actionable advice**.

---

## Project Components (Planned Architecture)

### A. Harvest Timing Recommendation *(Implemented)*
- Determines the best harvest window for a crop
- Uses short-term weather forecasts and soil moisture input
- Explains *why* a recommendation is given

### B. Best Mandi (Market) Recommendation 
- Suggests optimal markets based on historical price data
- Considers distance, price trends, and timing

### C. Post-Harvest Spoilage Risk 
- Estimates spoilage risk during storage and transport
- Suggests low-cost preservation actions

### D. Farmer-Friendly Delivery 
- Plain-language explanations (Hindi / regional languages)
- Voice or SMS-friendly outputs

---

## Current Implementation Scope

### What Is Implemented Now
- Weather-based harvest advisory
- Rain-risk analysis using a 7-day forecast
- Soil moisture consideration (manual input)
- Explainable rule-based logic (no black box)
- Command-line demo for a fixed Indian location

## Quick links (workspace)
- Files:
  - [src/main.py](src/main.py)
  - [src/weather.py](src/weather.py)
  - [src/harvest.py](src/harvest.py)
  - [requirements.txt](requirements.txt)
  - [.env](.env)
- Key symbols:
  - [`main.main`](src/main.py)
  - [`weather.get_weather_by_coords`](src/weather.py)
  - [`harvest.harvest_timing_recommendation`](src/harvest.py)

## What it does now
- Calls [`weather.get_weather_by_coords`](src/weather.py) to fetch a 7-day forecast from WeatherAPI.
- Uses [`harvest.harvest_timing_recommendation`](src/harvest.py) to compute a recommended harvest window based on forecast rain probability and soil moisture.
- Provides a CLI entrypoint via [`main.main`](src/main.py) that prints the advisory for a fixed location (Nashik).
