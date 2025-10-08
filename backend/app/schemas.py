from pydantic import BaseModel, EmailStr
from typing import List, Optional

# User Schemas
class UserCreate(BaseModel):
	email: EmailStr
	username: str
	password: str

class UserLogin(BaseModel):
	email: EmailStr
	password: str

class UserResponse(BaseModel):
	id: int
	email: str
	username: str
	is_active: bool
	
	class Config:
		from_attributes = True

class Token(BaseModel):
	access_token: str
	token_type: str
	user: UserResponse

# Existing Schemas
class ComputeRequest(BaseModel):
	date: str
	travelKm: float
	travelMode: str
	electricityKwh: float
	diet: str

class ComputeResponse(BaseModel):
	travelKg: float
	electricityKg: float
	foodKg: float
	totalKg: float
	ecoScore: int
	tips: List[str]

class LogEntry(ComputeRequest):
	travelKg: float
	electricityKg: float
	foodKg: float
	totalKg: float

class LogResponse(BaseModel):
	items: List[LogEntry]
