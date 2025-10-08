import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./carbon.db')

# Configure engine based on database type
if DATABASE_URL.startswith('mysql'):
	engine = create_engine(
		DATABASE_URL,
		pool_pre_ping=True,
		pool_recycle=300,
		echo=False
	)
else:
	# SQLite for local development
	engine = create_engine(
		DATABASE_URL,
		connect_args={"check_same_thread": False}
	)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
