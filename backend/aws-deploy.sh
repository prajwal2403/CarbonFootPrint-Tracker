#!/bin/bash

# AWS Deployment Script for Carbon Tracker Backend
# This script automates the deployment of the FastAPI backend to EC2

set -e

echo "🚀 Starting Carbon Tracker Backend Deployment..."

# Configuration
APP_NAME="carbon-tracker-backend"
INSTANCE_TYPE="t3.micro"
KEY_NAME="carbon-tracker-key"
SECURITY_GROUP="carbon-tracker-sg"
AMI_ID="ami-0c02fb55956c7d316"  # Amazon Linux 2
REGION="us-east-1"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Create security group if it doesn't exist
if ! aws ec2 describe-security-groups --group-names $SECURITY_GROUP --region $REGION &> /dev/null; then
    echo "📋 Creating security group..."
    aws ec2 create-security-group \
        --group-name $SECURITY_GROUP \
        --description "Security group for Carbon Tracker Backend" \
        --region $REGION
    
    # Add rules for HTTP, HTTPS, and SSH
    aws ec2 authorize-security-group-ingress \
        --group-name $SECURITY_GROUP \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    aws ec2 authorize-security-group-ingress \
        --group-name $SECURITY_GROUP \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $REGION
        
    aws ec2 authorize-security-group-ingress \
        --group-name $SECURITY_GROUP \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region $REGION
        
    aws ec2 authorize-security-group-ingress \
        --group-name $SECURITY_GROUP \
        --protocol tcp \
        --port 8000 \
        --cidr 0.0.0.0/0 \
        --region $REGION
    
    echo "✅ Security group created"
else
    echo "✅ Security group already exists"
fi

# Create user data script for EC2 instance
cat > user-data.sh << 'EOF'
#!/bin/bash
yum update -y
yum install -y python3 python3-pip git nginx

# Install PM2 for process management
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
npm install -g pm2

# Clone the repository
cd /opt
git clone https://github.com/prajwal2403/CarbonFootPrint-Tracker.git
cd CarbonFootPrint-Tracker

# Switch to deployment branch
git checkout deployment

# Setup backend
cd backend
python3 -m pip install -r requirements.txt

# Create production environment file
cat > .env << 'ENVEOF'
DATABASE_URL=mysql+pymysql://admin:your_password@your-rds-endpoint:3306/carbon_tracker
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
ENVEOF

# Start the application with PM2
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name carbon-tracker

# Configure nginx
cat > /etc/nginx/conf.d/carbon-tracker.conf << 'NGINXEOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

systemctl enable nginx
systemctl start nginx

# Save PM2 configuration
pm2 save
pm2 startup systemd
EOF

echo "📦 Creating EC2 instance..."

# Launch EC2 instance
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --count 1 \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-groups $SECURITY_GROUP \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME}]" \
    --region $REGION \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "✅ EC2 instance created: $INSTANCE_ID"

# Wait for instance to be running
echo "⏳ Waiting for instance to be running..."
aws ec2 wait instance-running --instance-ids $INSTANCE_ID --region $REGION

# Get public IP
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --region $REGION \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "🎉 Deployment completed!"
echo "📍 Instance ID: $INSTANCE_ID"
echo "🌐 Public IP: $PUBLIC_IP"
echo "🔗 Backend URL: http://$PUBLIC_IP:8000"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update your RDS database credentials in the .env file"
echo "   2. Update the nginx configuration with your actual domain"
echo "   3. Setup SSL certificates for HTTPS"

# Cleanup
rm -f user-data.sh

echo "✅ Deployment script completed!"