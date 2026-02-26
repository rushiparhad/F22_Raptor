# AgriChain Integration System

## Run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main_api:app --reload --host 127.0.0.1 --port 8000
```

## Endpoint

`GET /agrichain?crop=tomato&location=Pune`
