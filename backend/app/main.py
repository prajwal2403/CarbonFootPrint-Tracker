from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import timedelta
from .database import Base, engine, get_db
from .models import Log, User
from .schemas import (
	ComputeRequest, ComputeResponse, LogResponse, LogEntry,
	UserCreate, UserLogin, UserResponse, Token
)
from .logic import (
	calculate_emissions, compute_eco_score, generate_tips,
	verify_password, get_password_hash, create_access_token, verify_token,
	ACCESS_TOKEN_EXPIRE_MINUTES
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Carbon Tracker API")

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:5173",
		"http://localhost:5174", 
		"http://127.0.0.1:5173",
		"http://127.0.0.1:5174"
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
	token = credentials.credentials
	email = verify_token(token)
	user = db.query(User).filter(User.email == email).first()
	if user is None:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="User not found",
			headers={"WWW-Authenticate": "Bearer"},
		)
	return user

# Authentication endpoints
@app.post('/register', response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
	# Check if user already exists
	if db.query(User).filter(User.email == user_data.email).first():
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Email already registered"
		)
	if db.query(User).filter(User.username == user_data.username).first():
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Username already taken"
		)
	
	# Create new user
	hashed_password = get_password_hash(user_data.password)
	user = User(
		email=user_data.email,
		username=user_data.username,
		hashed_password=hashed_password
	)
	db.add(user)
	db.commit()
	db.refresh(user)
	return user

@app.post('/login', response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
	user = db.query(User).filter(User.email == user_credentials.email).first()
	if not user or not verify_password(user_credentials.password, user.hashed_password):
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Incorrect email or password",
			headers={"WWW-Authenticate": "Bearer"},
		)
	
	access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	access_token = create_access_token(
		data={"sub": user.email}, expires_delta=access_token_expires
	)
	return {
		"access_token": access_token,
		"token_type": "bearer",
		"user": user
	}

@app.get('/me', response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
	return current_user

@app.get('/health')
async def health_check():
	return {"status": "healthy", "message": "Carbon Tracker API is running"}

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
async def create_log(payload: ComputeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
	travel_kg, electricity_kg, food_kg, total_kg = calculate_emissions(
		payload.travelKm, payload.travelMode, payload.electricityKwh, payload.diet
	)
	log = Log(
		user_id=current_user.id,
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
async def list_logs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
	rows = db.query(Log).filter(Log.user_id == current_user.id).order_by(Log.id.asc()).all()
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
