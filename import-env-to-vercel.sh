#!/bin/bash

# Script to import environment variables to Vercel
# This will read your .env.local file and push variables to Vercel

echo "🚀 Importing environment variables to Vercel..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📝 Found environment variables in .env.local:"
cat .env.local
echo ""

# Login to Vercel (if not already logged in)
echo "🔐 Logging into Vercel..."
vercel login

echo ""
echo "📤 Pushing environment variables to Vercel..."
echo ""

# Read .env.local and add each variable
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    if [[ -z "$key" ]] || [[ "$key" =~ ^#.* ]]; then
        continue
    fi

    echo "Adding: $key"

    # Add to all environments (production, preview, development)
    echo "$value" | vercel env add "$key" production
    echo "$value" | vercel env add "$key" preview
    echo "$value" | vercel env add "$key" development

done < .env.local

echo ""
echo "✅ Environment variables imported successfully!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Check Settings > Environment Variables to verify"
echo "3. Redeploy your project"
echo ""
