from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Log
from .schemas import ComputeRequest, ComputeResponse, LogResponse, LogEntry
from .logic import calculate_emissions, compute_eco_score, generate_tips

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Carbon Tracker API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://carbonfootprinttracker.s3-website.eu-north-1.amazonaws.com"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.post('/compute', response_model=ComputeResponse)
async def compute(payload: ComputeRequest):
	travel_kg, electricity_kg, food_kg, total_kg = calculate_emissions(
		payload.travelKm, payload.travelMode, payload.electricityKwh, payload.diet
	)
	eco = compute_eco_score(total_kg)
	tips = generate_tips(payload.travelKm, payload.travelMode, payload.electricityKwh, payload.diet, total_kg)
	return {
		"travelKg": travel_kg,
		"electricityKg": electricity_kg,
		"foodKg": food_kg,
		"totalKg": total_kg,
		"ecoScore": eco,
		"tips": tips
	}

@app.post('/logs', response_model=LogEntry)
async def create_log(payload: ComputeRequest, db: Session = Depends(get_db)):
	travel_kg, electricity_kg, food_kg, total_kg = calculate_emissions(
		payload.travelKm, payload.travelMode, payload.electricityKwh, payload.diet
	)
	log = Log(
		date=payload.date,
		travel_km=payload.travelKm,
		travel_mode=payload.travelMode,
		electricity_kwh=payload.electricityKwh,
		diet=payload.diet,
		travel_kg=travel_kg,
		electricity_kg=electricity_kg,
		food_kg=food_kg,
		total_kg=total_kg,
	)
	db.add(log)
	db.commit()
	db.refresh(log)
	return {
		"date": log.date,
		"travelKm": log.travel_km,
		"travelMode": log.travel_mode,
		"electricityKwh": log.electricity_kwh,
		"diet": log.diet,
		"travelKg": log.travel_kg,
		"electricityKg": log.electricity_kg,
		"foodKg": log.food_kg,
		"totalKg": log.total_kg,
	}

@app.get('/logs', response_model=LogResponse)
async def list_logs(db: Session = Depends(get_db)):
	rows = db.query(Log).order_by(Log.id.asc()).all()
	items = []
	for l in rows:
		items.append({
			"date": l.date,
			"travelKm": l.travel_km,
			"travelMode": l.travel_mode,
			"electricityKwh": l.electricity_kwh,
			"diet": l.diet,
			"travelKg": l.travel_kg,
			"electricityKg": l.electricity_kg,
			"foodKg": l.food_kg,
			"totalKg": l.total_kg,
		})
	return {"items": items}
