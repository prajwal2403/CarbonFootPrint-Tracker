#!/usr/bin/env python3
"""
Create the carbon_tracker database and initialize tables
"""
import pymysql
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app.models import User, Log
from sqlalchemy import create_engine

def create_database_and_tables():
    """Create database and all tables"""
    
    # Connection details
    host = "ctracker.c49806wy8n0r.us-east-1.rds.amazonaws.com"
    port = 3306
    username = "prajwal2403"
    password = "fxR5v9KpH1nRqGbAGjLs"
    database_name = "carbon_tracker"
    
    print("Carbon Footprint Tracker - Database Setup")
    print("=" * 50)
    
    try:
        # Step 1: Connect without specifying database
        print("Step 1: Connecting to MySQL server...")
        connection = pymysql.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            connect_timeout=10
        )
        cursor = connection.cursor()
        print("✅ Connected to MySQL server")
        
        # Step 2: Create database if it doesn't exist
        print(f"Step 2: Creating database '{database_name}'...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database_name}")
        print(f"✅ Database '{database_name}' created/exists")
        
        # Step 3: Show all databases to confirm
        cursor.execute("SHOW DATABASES")
        databases = [db[0] for db in cursor.fetchall()]
        print(f"📋 Available databases: {databases}")
        
        cursor.close()
        connection.close()
        
        # Step 4: Create tables using SQLAlchemy
        print("Step 3: Creating tables using SQLAlchemy...")
        DATABASE_URL = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_name}"
        engine = create_engine(DATABASE_URL)
        
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Step 5: Verify tables were created
        print("Step 4: Verifying tables...")
        with engine.connect() as conn:
            from sqlalchemy import text
            result = conn.execute(text("SHOW TABLES"))
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 Created tables: {tables}")
        
        print("\n🎉 Database setup completed successfully!")
        print(f"Database URL: {DATABASE_URL}")
        print("\nYou can now start your FastAPI application with:")
        print("uvicorn app.main:app --reload")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        return False

if __name__ == "__main__":
    if create_database_and_tables():
        print("\n✅ Setup completed successfully!")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)