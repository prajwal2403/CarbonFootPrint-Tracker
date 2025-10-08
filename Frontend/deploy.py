#!/usr/bin/env python3
"""
Frontend deployment script for AWS S3 + CloudFront
"""
import os
import json

def create_s3_deployment_script():
    """Create deployment script for S3"""
    script_content = """#!/bin/bash
set -e

echo "Starting Carbon Tracker Frontend Deployment..."

# Configuration
BUCKET_NAME="your-carbon-tracker-frontend"  # Change this to your bucket name
DISTRIBUTION_ID="your-cloudfront-distribution-id"  # Add after creating CloudFront
REGION="us-east-1"  # Change to your preferred region

# Build the React app
echo "Building React application..."
npm install
npm run build

# Sync to S3
echo "Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete --cache-control max-age=31536000

# Update index.html with shorter cache
aws s3 cp dist/index.html s3://$BUCKET_NAME/index.html --cache-control max-age=0,no-cache,no-store,must-revalidate

# Invalidate CloudFront cache
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
fi

echo "Frontend deployment completed!"
echo "Your app should be available at: https://your-domain.com"
"""
    return script_content

def create_s3_bucket_policy():
    """Create S3 bucket policy for static website hosting"""
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::your-carbon-tracker-frontend/*"
            }
        ]
    }
    return json.dumps(policy, indent=2)

def create_cloudfront_config():
    """Create CloudFront distribution configuration"""
    config = {
        "CallerReference": "carbon-tracker-" + str(int(os.time())),
        "Comment": "Carbon Tracker Frontend Distribution",
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-carbon-tracker-frontend",
            "ViewerProtocolPolicy": "redirect-to-https",
            "Compress": True,
            "ForwardedValues": {
                "QueryString": False,
                "Cookies": {"Forward": "none"}
            },
            "TrustedSigners": {
                "Enabled": False,
                "Quantity": 0
            },
            "MinTTL": 0,
            "DefaultTTL": 86400,
            "MaxTTL": 31536000
        },
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-carbon-tracker-frontend",
                    "DomainName": "your-carbon-tracker-frontend.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "Enabled": True,
        "PriceClass": "PriceClass_100",
        "CustomErrorResponses": {
            "Quantity": 1,
            "Items": [
                {
                    "ErrorCode": 404,
                    "ResponsePagePath": "/index.html",
                    "ResponseCode": "200",
                    "ErrorCachingMinTTL": 300
                }
            ]
        }
    }
    return json.dumps(config, indent=2)

if __name__ == "__main__":
    # Create deployment script
    with open("deploy-frontend.sh", "w") as f:
        f.write(create_s3_deployment_script())
    
    # Make executable
    os.chmod("deploy-frontend.sh", 0o755)
    
    # Create S3 bucket policy
    with open("s3-bucket-policy.json", "w") as f:
        f.write(create_s3_bucket_policy())
    
    print("Frontend deployment files created!")
    print("\nFiles created:")
    print("- deploy-frontend.sh (Run after setting up S3 and CloudFront)")
    print("- s3-bucket-policy.json (Apply to your S3 bucket)")
    print("\nNext steps:")
    print("1. Create S3 bucket: aws s3 mb s3://your-carbon-tracker-frontend")
    print("2. Enable static website hosting")
    print("3. Apply bucket policy")
    print("4. Create CloudFront distribution")
    print("5. Update bucket name and distribution ID in deploy-frontend.sh")
    print("6. Run: ./deploy-frontend.sh")