# Carbon Tracker (Frontend + Backend)

A React (Vite) frontend with a FastAPI backend for calculating carbon footprint and generating tips. Frontend can be hosted on S3/CloudFront; backend on EC2.

## Frontend

### Run
```bash
npm install
# set API base
$env:VITE_API_URL="http://localhost:8000" # PowerShell
# or on Linux/macOS: export VITE_API_URL="http://localhost:8000"
npm run dev
```

### Build & Deploy (S3 + CloudFront)
1. `npm run build`
2. Upload `dist/` to S3
3. Set SPA routing on CloudFront (403/404 -> /index.html)

## Backend (FastAPI)

### Setup
```bash
cd backend
python -m venv .venv
# Windows PowerShell".venv\\Scripts\\Activate.ps1"
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Endpoints
- POST `/compute` → returns travel/electricity/food/total (kg), ecoScore, tips
- POST `/logs` → saves a log entry
- GET `/logs` → list history

### Env
- `DATABASE_URL` (optional) e.g. `sqlite:///./carbon.db` (default) or PostgreSQL

## AWS Notes
- Backend: deploy FastAPI on EC2 (t3.micro). Open port 8000 or proxy via Nginx.
- Frontend: set `VITE_API_URL` to the EC2 public DNS + port or your domain.

## Emission Factors
- Car 0.21, Bus 0.10, Train 0.05 kg CO₂/km; Electricity 0.82 kg/kWh
- Food/day: Vegan 1.5, Vegetarian 2.0, Mixed 3.0, Non-Veg 5.0
