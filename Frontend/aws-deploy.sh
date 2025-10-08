#!/bin/bash

# Frontend Deployment Script for S3 + CloudFront
set -e

echo "🚀 Starting Carbon Tracker Frontend Deployment..."

# Configuration
BUCKET_NAME="carbon-tracker-frontend-$(date +%s)"
REGION="us-east-1"
DISTRIBUTION_CONFIG="cloudfront-config.json"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Build the frontend
echo "📦 Building frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Frontend built successfully"

# Create S3 bucket
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html

# Upload files to S3
echo "📤 Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Set bucket policy for public read access
cat > bucket-policy-temp.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy-temp.json

# Create CloudFront distribution configuration
cat > $DISTRIBUTION_CONFIG << EOF
{
    "CallerReference": "carbon-tracker-$(date +%s)",
    "Comment": "Carbon Tracker Frontend Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        }
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200"
            }
        ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

echo "☁️ Creating CloudFront distribution..."
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file://$DISTRIBUTION_CONFIG \
    --query 'Distribution.Id' \
    --output text)

# Get distribution domain name
DISTRIBUTION_DOMAIN=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.DomainName' \
    --output text)

# Cleanup temporary files
rm -f bucket-policy-temp.json $DISTRIBUTION_CONFIG

echo "🎉 Deployment completed!"
echo "🪣 S3 Bucket: $BUCKET_NAME"
echo "📍 S3 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "☁️ CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "🌐 CloudFront URL: https://$DISTRIBUTION_DOMAIN"
echo ""
echo "⚠️  Note: CloudFront distribution may take 15-20 minutes to fully deploy"
echo "🔄 Check deployment status: aws cloudfront get-distribution --id $DISTRIBUTION_ID"

echo "✅ Frontend deployment completed!"