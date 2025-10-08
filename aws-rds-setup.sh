# AWS RDS Database Setup Script
# Run these commands in AWS CLI to create the MySQL database

# 1. Create DB Subnet Group
aws rds create-db-subnet-group \
    --db-subnet-group-name carbon-tracker-subnet-group \
    --db-subnet-group-description "Carbon Tracker DB Subnet Group" \
    --subnet-ids subnet-12345678 subnet-87654321 \
    --region us-east-1

# Note: Replace subnet-12345678 and subnet-87654321 with your actual subnet IDs
# You can get them with: aws ec2 describe-subnets --region us-east-1

# 2. Create Security Group for RDS
aws ec2 create-security-group \
    --group-name carbon-tracker-db-sg \
    --description "Carbon Tracker Database Security Group" \
    --region us-east-1

# Get the security group ID
DB_SG_ID=$(aws ec2 describe-security-groups \
    --group-names carbon-tracker-db-sg \
    --region us-east-1 \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# Allow MySQL access from EC2 security group
aws ec2 authorize-security-group-ingress \
    --group-id $DB_SG_ID \
    --protocol tcp \
    --port 3306 \
    --source-group carbon-tracker-sg \
    --region us-east-1

# 3. Create RDS MySQL instance
aws rds create-db-instance \
    --db-instance-identifier carbon-tracker-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password YourSecurePassword123! \
    --allocated-storage 20 \
    --storage-type gp2 \
    --vpc-security-group-ids $DB_SG_ID \
    --db-subnet-group-name carbon-tracker-subnet-group \
    --db-name carbon_tracker \
    --backup-retention-period 7 \
    --port 3306 \
    --no-multi-az \
    --no-publicly-accessible \
    --storage-encrypted \
    --region us-east-1

echo "⏳ Database creation initiated. This will take 10-15 minutes..."
echo "📋 Check status with: aws rds describe-db-instances --db-instance-identifier carbon-tracker-db --region us-east-1"

# Wait for DB to be available
echo "⏳ Waiting for database to be available..."
aws rds wait db-instance-available \
    --db-instance-identifier carbon-tracker-db \
    --region us-east-1

# Get the database endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier carbon-tracker-db \
    --region us-east-1 \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

echo "✅ Database created successfully!"
echo "📍 Database Endpoint: $DB_ENDPOINT"
echo "🔗 Connection String: mysql+pymysql://admin:YourSecurePassword123!@$DB_ENDPOINT:3306/carbon_tracker"
echo ""
echo "⚠️  Update your backend .env file with this connection string"