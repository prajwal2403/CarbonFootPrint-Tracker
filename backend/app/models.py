from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
	__tablename__ = 'users'
	id = Column(Integer, primary_key=True, index=True)
	email = Column(String, unique=True, index=True, nullable=False)
	username = Column(String, unique=True, index=True, nullable=False)
	hashed_password = Column(String, nullable=False)
	is_active = Column(Boolean, default=True)
	
	logs = relationship("Log", back_populates="user")

class Log(Base):
	__tablename__ = 'logs'
	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
	date = Column(String, index=True)
	travel_km = Column(Float, default=0)
	travel_mode = Column(String, default='car')
	electricity_kwh = Column(Float, default=0)
	diet = Column(String, default='mixed')
	travel_kg = Column(Float, default=0)
	electricity_kg = Column(Float, default=0)
	food_kg = Column(Float, default=0)
	total_kg = Column(Float, default=0)
	
	user = relationship("User", back_populates="logs")
