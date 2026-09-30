# ReadTogether Vercel Deployment Script for Windows
# PowerShell version

Write-Host "🚀 ReadTogether Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "📦 Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Deploy Client (Frontend) to Vercel"
Write-Host "2. Deploy Server (Backend) to Vercel"
Write-Host "3. Deploy Both"
Write-Host ""
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Deploying Client to Vercel..." -ForegroundColor Green
        Write-Host ""
        Set-Location client
        npm run build
        vercel --prod
        Set-Location ..
    }
    "2" {
        Write-Host ""
        Write-Host "⚙️  Deploying Server to Vercel..." -ForegroundColor Yellow
        Write-Host "⚠️  WARNING: Socket.IO may not work well on Vercel!" -ForegroundColor Red
        Write-Host "   Consider using Railway or Render instead." -ForegroundColor Red
        Write-Host ""
        $confirm = Read-Host "Continue anyway? (y/n)"
        if ($confirm -eq "y") {
            Set-Location server
            npm run build
            vercel --prod
            Set-Location ..
        } else {
            Write-Host "Deployment cancelled."
            exit 0
        }
    }
    "3" {
        Write-Host ""
        Write-Host "🚀 Deploying Both Client and Server..." -ForegroundColor Green
        Write-Host "⚠️  WARNING: Socket.IO may not work well on Vercel!" -ForegroundColor Yellow
        Write-Host ""
        
        Write-Host "📦 Building Server..." -ForegroundColor Cyan
        Set-Location server
        npm run build
        vercel --prod
        $serverUrl = vercel ls | Select-String -Pattern "readtogether-server" | Select-Object -First 1
        Set-Location ..
        
        Write-Host ""
        Write-Host "📦 Building Client..." -ForegroundColor Cyan
        Set-Location client
        
        Write-Host ""
        Write-Host "Enter your deployed server URL (or press Enter to skip):"
        $customServerUrl = Read-Host
        if ($customServerUrl) {
            $serverUrl = $customServerUrl
        }
        
        Write-Host "Using server URL: $serverUrl" -ForegroundColor Green
        
        npm run build
        vercel --prod
        Set-Location ..
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set environment variables in Vercel dashboard"
Write-Host "2. Update CORS settings with your frontend URL"
Write-Host "3. Test the application"
Write-Host ""
Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
