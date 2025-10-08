# 🚀 AWS Deployment Guide for Carbon Tracker

This guide will help you deploy your Carbon Tracker application on AWS with the following architecture:
- **Backend**: FastAPI on EC2
- **Frontend**: React app on S3 + CloudFront
- **Database**: RDS MySQL
- **SSL**: Certificate Manager + Route 53

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Domain name (optional but recommended)

```bash
# Install AWS CLI
pip install awscli
aws configure
```

## 🗄️ Step 1: Setup RDS MySQL Database

### 1.1 Create RDS Instance
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name carbon-tracker-subnet-group \
    --db-subnet-group-description "Subnet group for Carbon Tracker" \
    --subnet-ids subnet-12345678 subnet-87654321  # Replace with your subnet IDs

# Create RDS MySQL instance
aws rds create-db-instance \
    --db-name carbon_tracker \
    --db-instance-identifier carbon-tracker-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password YourSecurePassword123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-12345678 \
    --db-subnet-group-name carbon-tracker-subnet-group \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted
```

### 1.2 Configure Security Group
```bash
# Create security group for RDS
aws ec2 create-security-group \
    --group-name carbon-tracker-rds-sg \
    --description "Security group for Carbon Tracker RDS"

# Allow MySQL access from EC2 security group
aws ec2 authorize-security-group-ingress \
    --group-name carbon-tracker-rds-sg \
    --protocol tcp \
    --port 3306 \
    --source-group carbon-tracker-ec2-sg
```

## 🖥️ Step 2: Deploy Backend to EC2

### 2.1 Launch EC2 Instance
```bash
# Create security group for EC2
aws ec2 create-security-group \
    --group-name carbon-tracker-ec2-sg \
    --description "Security group for Carbon Tracker EC2"

# Allow HTTP, HTTPS, and SSH
aws ec2 authorize-security-group-ingress --group-name carbon-tracker-ec2-sg --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name carbon-tracker-ec2-sg --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-name carbon-tracker-ec2-sg --protocol tcp --port 22 --cidr 0.0.0.0/0

# Launch EC2 instance
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t2.micro \
    --key-name your-key-pair \
    --security-groups carbon-tracker-ec2-sg \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=carbon-tracker-backend}]'
```

### 2.2 Deploy Backend
```bash
# SSH into your EC2 instance
ssh -i your-key-pair.pem ubuntu@your-ec2-public-ip

# Copy and run the deployment script
scp -i your-key-pair.pem backend/deploy.sh ubuntu@your-ec2-public-ip:~
cd backend && ./deploy.sh

# Update environment variables
nano /home/ubuntu/carbon-tracker/backend/.env
```

**Update .env file with your actual values:**
```bash
DATABASE_URL=mysql+pymysql://admin:YourSecurePassword123!@your-rds-endpoint:3306/carbon_tracker
SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters-long
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 2.3 Start Services
```bash
sudo systemctl start carbon-tracker
sudo systemctl start nginx
sudo systemctl enable carbon-tracker
sudo systemctl enable nginx

# Check status
sudo systemctl status carbon-tracker
sudo journalctl -u carbon-tracker -f
```

## 🌐 Step 3: Deploy Frontend to S3 + CloudFront

### 3.1 Create S3 Bucket
```bash
# Create S3 bucket
aws s3 mb s3://your-carbon-tracker-frontend --region us-east-1

# Enable static website hosting
aws s3 website s3://your-carbon-tracker-frontend \
    --index-document index.html \
    --error-document index.html

# Apply bucket policy
aws s3api put-bucket-policy \
    --bucket your-carbon-tracker-frontend \
    --policy file://s3-bucket-policy.json
```

### 3.2 Create CloudFront Distribution
```bash
# Create CloudFront distribution (using AWS Console is easier)
# Or use AWS CLI with the configuration file
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### 3.3 Build and Deploy Frontend
```bash
# Update API URL in production environment
echo "VITE_API_URL=https://api.your-domain.com" > .env.production

# Build and deploy
./deploy-frontend.sh
```

## 🔒 Step 4: Setup SSL and Domain

### 4.1 Request SSL Certificate
```bash
# Request certificate (must be in us-east-1 for CloudFront)
aws acm request-certificate \
    --domain-name your-domain.com \
    --subject-alternative-names www.your-domain.com api.your-domain.com \
    --validation-method DNS \
    --region us-east-1
```

### 4.2 Configure Route 53
```bash
# Create hosted zone
aws route53 create-hosted-zone \
    --name your-domain.com \
    --caller-reference $(date +%s)

# Add A record for CloudFront
# Add A record for EC2 (API subdomain)
```

## 📊 Step 5: Setup Monitoring

### 5.1 CloudWatch Logs
```bash
# Install CloudWatch agent on EC2
sudo yum install amazon-cloudwatch-agent

# Configure log groups
aws logs create-log-group --log-group-name /aws/ec2/carbon-tracker
```

### 5.2 Health Checks
```bash
# Create health check for API
aws route53 create-health-check \
    --caller-reference $(date +%s) \
    --health-check-config Type=HTTPS,ResourcePath=/health,FullyQualifiedDomainName=api.your-domain.com
```

## 🔧 Configuration Files Summary

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://admin:password@rds-endpoint:3306/carbon_tracker
SECRET_KEY=your-32-character-minimum-secret-key
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
ENVIRONMENT=production
```

### Frontend (.env.production)
```
VITE_API_URL=https://api.your-domain.com
VITE_ENV=production
```

## 🚦 Testing Your Deployment

1. **Backend Health Check**: `curl https://api.your-domain.com/health`
2. **Frontend**: Visit `https://your-domain.com`
3. **Registration**: Test user signup
4. **Authentication**: Test login flow
5. **API Calls**: Test carbon footprint calculations

## 💰 Cost Estimation (Monthly)

- **EC2 t2.micro**: ~$8.50
- **RDS db.t3.micro**: ~$12.60
- **S3 + CloudFront**: ~$1-5 (depending on usage)
- **Route 53**: ~$0.50
- **Certificate Manager**: Free
- **Total**: ~$22-27/month

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check logs
sudo journalctl -u carbon-tracker -f
sudo tail -f /var/log/nginx/error.log

# Test database connection
cd /home/ubuntu/carbon-tracker/backend
source .venv/bin/activate
python -c "from app.database import engine; print(engine.execute('SELECT 1').scalar())"
```

### Frontend Issues
```bash
# Check CloudFront logs
aws logs filter-log-events --log-group-name /aws/cloudfront/

# Test S3 direct access
curl -I https://your-bucket-name.s3.amazonaws.com/index.html
```

## 🔄 CI/CD Pipeline (Optional)

Consider setting up GitHub Actions for automated deployment:

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EC2
        run: |
          # SSH and deploy commands
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to S3
        run: |
          # Build and upload to S3
```

## 📚 Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React S3 Deployment](https://create-react-app.dev/docs/deployment/#s3-and-cloudfront)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

---

**⚠️ Security Notes:**
- Never commit .env files to git
- Use IAM roles with minimal permissions
- Enable AWS CloudTrail for auditing
- Regularly update dependencies
- Monitor costs with AWS Budgets