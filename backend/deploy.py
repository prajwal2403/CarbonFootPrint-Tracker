#!/usr/bin/env python3
"""
Production deployment script for Carbon Tracker Backend
"""
import os
import sys
from pathlib import Path

def create_systemd_service():
    """Create systemd service file for the FastAPI app"""
    service_content = """[Unit]
Description=Carbon Tracker FastAPI app
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/carbon-tracker/backend
Environment=PATH=/home/ubuntu/carbon-tracker/backend/.venv/bin
ExecStart=/home/ubuntu/carbon-tracker/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
"""
    return service_content

def create_nginx_config():
    """Create nginx configuration for reverse proxy"""
    nginx_content = """server {
    listen 80;
    server_name your-api-domain.com;  # Replace with your API domain
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }
}
"""
    return nginx_content

def create_deployment_script():
    """Create deployment script for EC2"""
    script_content = """#!/bin/bash
set -e

echo "Starting Carbon Tracker Backend Deployment..."

# Update system
sudo apt update
sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nginx git mysql-client

# Create application user (if not exists)
sudo useradd -m -s /bin/bash ubuntu || true

# Clone or update repository
if [ -d "/home/ubuntu/carbon-tracker" ]; then
    cd /home/ubuntu/carbon-tracker
    git pull origin main
else
    cd /home/ubuntu
    git clone https://github.com/prajwal2403/CarbonFootPrint-Tracker.git carbon-tracker
fi

cd /home/ubuntu/carbon-tracker/backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Set up environment variables
if [ ! -f ".env" ]; then
    echo "Creating .env file - PLEASE UPDATE WITH ACTUAL VALUES!"
    cp .env.example .env
fi

# Set proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/carbon-tracker

# Create systemd service
sudo tee /etc/systemd/system/carbon-tracker.service > /dev/null << 'EOF'
[Unit]
Description=Carbon Tracker FastAPI app
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/carbon-tracker/backend
Environment=PATH=/home/ubuntu/carbon-tracker/backend/.venv/bin
ExecStart=/home/ubuntu/carbon-tracker/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Create nginx configuration
sudo tee /etc/nginx/sites-available/carbon-tracker > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-api-domain.com;  # Replace with your API domain
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        access_log off;
    }
}
EOF

# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/carbon-tracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Start and enable services
sudo systemctl daemon-reload
sudo systemctl enable carbon-tracker
sudo systemctl enable nginx

echo "Deployment script completed!"
echo ""
echo "NEXT STEPS:"
echo "1. Update /home/ubuntu/carbon-tracker/backend/.env with your actual database credentials"
echo "2. Update nginx config with your actual domain: sudo nano /etc/nginx/sites-available/carbon-tracker"
echo "3. Start services: sudo systemctl start carbon-tracker && sudo systemctl start nginx"
echo "4. Check status: sudo systemctl status carbon-tracker"
echo "5. Check logs: sudo journalctl -u carbon-tracker -f"
"""
    return script_content

if __name__ == "__main__":
    print("Carbon Tracker Production Deployment Files Created!")
    print("\nFiles created:")
    print("- .env.example (Update with your values)")
    print("- deploy.sh (Run on EC2 instance)")
    
    # Write deployment script
    with open("deploy.sh", "w") as f:
        f.write(create_deployment_script())
    
    # Make executable
    os.chmod("deploy.sh", 0o755)
    print("- deploy.sh (Executable deployment script)")