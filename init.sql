-- Database initialization script for Carbon Tracker
-- This script will be run when the MySQL container starts

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS carbon_tracker;
USE carbon_tracker;

-- Grant privileges to the admin user
GRANT ALL PRIVILEGES ON carbon_tracker.* TO 'admin'@'%';
FLUSH PRIVILEGES;

-- The tables will be created automatically by SQLAlchemy when the application starts