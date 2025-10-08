# Carbon Tracker - Complete AWS Deployment Guide

## 🏗️ Architecture Overview

```
Internet → Route 53 → CloudFront → S3 (Frontend)
                                ↓
                              ALB → EC2 (Backend) → RDS MySQL
```

## 📋 Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js** and **npm** installed
4. **Git** repository access
5. **Domain name** (optional but recommended)

## 🚀 Deployment Steps

### Phase 1: Database Setup (15-20 minutes)

1. **Create VPC and Subnets** (if not using default)
```bash
# Get your default VPC ID
aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region us-east-1

# Get subnet IDs in your VPC
aws ec2 describe-subnets --filters "Name=vpc-id,Values=YOUR_VPC_ID" --region us-east-1
```

2. **Run RDS Setup**
```bash
# Make the script executable
chmod +x aws-rds-setup.sh

# Update subnet IDs in the script, then run
./aws-rds-setup.sh
```

3. **Wait for Database** - RDS creation takes 10-15 minutes

### Phase 2: Backend Deployment (10-15 minutes)

1. **Create Key Pair** for EC2 access
```bash
aws ec2 create-key-pair --key-name carbon-tracker-key --region us-east-1 --query 'KeyMaterial' --output text > carbon-tracker-key.pem
chmod 400 carbon-tracker-key.pem
```

2. **Deploy Backend to EC2**
```bash
cd backend
chmod +x aws-deploy.sh
./aws-deploy.sh
```

3. **Update Environment Variables** on EC2
```bash
# SSH into your EC2 instance
ssh -i carbon-tracker-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Update the .env file with your actual database endpoint
sudo nano /opt/CarbonFootPrint-Tracker/backend/.env

# Restart the application
pm2 restart carbon-tracker
```

### Phase 3: Frontend Deployment (5-10 minutes)

1. **Update Frontend Configuration**
```bash
cd Frontend

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP:8000
EOF
```

2. **Deploy to S3 + CloudFront**
```bash
chmod +x aws-deploy.sh
./aws-deploy.sh
```

### Phase 4: Domain and SSL Setup (Optional)

1. **Route 53 Domain Setup**
```bash
# Create hosted zone for your domain
aws route53 create-hosted-zone --name yourdomain.com --caller-reference $(date +%s)

# Get name servers and update your domain registrar
aws route53 get-hosted-zone --id YOUR_HOSTED_ZONE_ID
```

2. **SSL Certificate with ACM**
```bash
# Request SSL certificate
aws acm request-certificate \
    --domain-name yourdomain.com \
    --subject-alternative-names www.yourdomain.com \
    --validation-method DNS \
    --region us-east-1
```

## 🔧 Configuration Details

### Backend Environment Variables (.env)
```env
DATABASE_URL=mysql+pymysql://admin:password@your-rds-endpoint:3306/carbon_tracker
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend Environment Variables (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com
```

## 🏥 Health Checks and Monitoring

### Backend Health Check
```bash
curl http://YOUR_EC2_IP:8000/health
```

### Frontend Health Check
```bash
curl https://YOUR_CLOUDFRONT_DOMAIN
```

## 🔒 Security Considerations

1. **Database Security**
   - Database is in private subnet
   - Only accessible from EC2 instances
   - Encryption at rest enabled

2. **Backend Security**
   - JWT tokens for authentication
   - CORS properly configured
   - Environment variables for secrets

3. **Network Security**
   - Security groups restrict access
   - HTTPS enforced via CloudFront
   - EC2 instance in public subnet with restricted access

## 💰 Cost Optimization

### Free Tier Resources:
- **EC2 t3.micro**: 750 hours/month
- **RDS db.t3.micro**: 750 hours/month
- **S3**: 5GB storage
- **CloudFront**: 1TB data transfer

### Expected Monthly Cost (after free tier):
- **EC2 t3.micro**: ~$8-10/month
- **RDS db.t3.micro**: ~$13-15/month
- **S3 + CloudFront**: ~$1-3/month
- **Total**: ~$22-28/month

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check security group rules
   - Verify database endpoint
   - Ensure credentials are correct

2. **EC2 Instance Not Accessible**
   - Check security group allows port 22 (SSH) and 8000 (API)
   - Verify key pair is correct
   - Check if instance is in public subnet

3. **Frontend Not Loading**
   - Check S3 bucket policy allows public read
   - Verify CloudFront distribution is deployed
   - Check CORS settings on backend

4. **CORS Errors**
   - Update ALLOWED_ORIGINS in backend .env
   - Restart backend application
   - Clear browser cache

## 📊 Monitoring and Logs

### Backend Logs (on EC2)
```bash
# View PM2 logs
pm2 logs carbon-tracker

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Monitoring
- Use AWS RDS Console for database metrics
- Enable Performance Insights for detailed monitoring

### Frontend Monitoring
- Use CloudFront Console for CDN metrics
- Monitor S3 access logs

## 🔄 CI/CD Pipeline (Optional)

For automatic deployments, consider setting up:
1. **GitHub Actions** for automated deployments
2. **AWS CodePipeline** for continuous deployment
3. **AWS CodeBuild** for building applications

## 📞 Support

If you encounter issues:
1. Check AWS CloudTrail for API call logs
2. Review CloudWatch logs for application errors
3. Use AWS Support Center for infrastructure issues

## ✅ Post-Deployment Checklist

- [ ] Database is accessible from EC2
- [ ] Backend API responds to health checks
- [ ] Frontend loads correctly
- [ ] User registration/login works
- [ ] Carbon tracking functionality works
- [ ] SSL certificate is applied (if using custom domain)
- [ ] DNS records point to correct resources
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Security groups reviewed and minimal

---

🎉 **Congratulations!** Your Carbon Tracker application is now running on AWS with professional-grade infrastructure!