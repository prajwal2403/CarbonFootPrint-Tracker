#!/bin/bash
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
