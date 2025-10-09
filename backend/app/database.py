import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:Mh40br7688@database-2.c49806wy8n0r.us-east-1.rds.amazonaws.com/postgres')
engine = create_engine(
	DATABASE_URL,
	connect_args={"check_same_thread": False} if DATABASE_URL.startswith('sqlite') else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
