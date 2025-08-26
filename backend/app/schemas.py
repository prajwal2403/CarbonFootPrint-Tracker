from pydantic import BaseModel
from typing import List

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
