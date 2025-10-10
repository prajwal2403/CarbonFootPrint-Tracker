#!/usr/bin/env python3
"""
Database initialization script for Carbon Footprint Tracker
This script creates all the necessary tables in your AWS RDS MySQL database.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models import User, Log

def create_tables():
    """Create all tables in the database"""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        print("Tables created:")
        print("  - users")
        print("  - logs")
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            print("✅ Database connection test successful!")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Carbon Footprint Tracker - Database Initialization")
    print("=" * 50)
    
    if create_tables():
        print("\n🎉 Database setup completed successfully!")
        print("\nYou can now start your FastAPI application with:")
        print("uvicorn app.main:app --reload")
    else:
        print("\n❌ Database setup failed. Please check your configuration.")
        sys.exit(1)