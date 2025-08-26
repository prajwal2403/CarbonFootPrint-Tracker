from sqlalchemy import Column, Integer, String, Float
from .database import Base

class Log(Base):
	__tablename__ = 'logs'
	id = Column(Integer, primary_key=True, index=True)
	date = Column(String, index=True)
	travel_km = Column(Float, default=0)
	travel_mode = Column(String, default='car')
	electricity_kwh = Column(Float, default=0)
	diet = Column(String, default='mixed')
	travel_kg = Column(Float, default=0)
	electricity_kg = Column(Float, default=0)
	food_kg = Column(Float, default=0)
	total_kg = Column(Float, default=0)
