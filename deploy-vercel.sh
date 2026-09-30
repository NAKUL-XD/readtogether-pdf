#!/bin/bash

# ReadTogether Vercel Deployment Script
# This script helps deploy the application to Vercel

echo "🚀 ReadTogether Deployment Script"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📦 Choose deployment option:"
echo "1. Deploy Client (Frontend) to Vercel"
echo "2. Deploy Server (Backend) to Vercel"
echo "3. Deploy Both"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Deploying Client to Vercel..."
        echo ""
        cd client
        npm run build
        vercel --prod
        ;;
    2)
        echo ""
        echo "⚙️  Deploying Server to Vercel..."
        echo "⚠️  WARNING: Socket.IO may not work well on Vercel!"
        echo "   Consider using Railway or Render instead."
        echo ""
        read -p "Continue anyway? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            cd server
            npm run build
            vercel --prod
        else
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    3)
        echo ""
        echo "🚀 Deploying Both Client and Server..."
        echo "⚠️  WARNING: Socket.IO may not work well on Vercel!"
        echo ""
        
        echo "📦 Building Server..."
        cd server
        npm run build
        vercel --prod
        SERVER_URL=$(vercel ls | grep -m1 "readtogether-server" | awk '{print $2}')
        cd ..
        
        echo ""
        echo "📦 Building Client..."
        cd client
        
        # Prompt for server URL
        echo ""
        echo "Enter your deployed server URL (or press Enter to use: $SERVER_URL):"
        read CUSTOM_SERVER_URL
        if [ -n "$CUSTOM_SERVER_URL" ]; then
            SERVER_URL=$CUSTOM_SERVER_URL
        fi
        
        echo "Using server URL: $SERVER_URL"
        
        npm run build
        vercel --prod
        cd ..
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update CORS settings with your frontend URL"
echo "3. Test the application"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
