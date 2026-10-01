# Deploying ReadTogether Backend to Render

## Prerequisites
- GitHub account connected to Render
- MongoDB Atlas account (or other MongoDB hosting)
- Push your code to GitHub

## Step-by-Step Deployment

### 1. Prepare Environment Variables
You'll need these environment variables in Render:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
CLIENT_URL=<your-frontend-url>
```

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Add your environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string (generate with: `openssl rand -base64 32`)
   - `CLIENT_URL` - Your frontend URL (e.g., `https://your-app.vercel.app`)
6. Click **"Apply"**

#### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `readtogether-server`
   - **Region**: Choose closest to you
   - **Branch**: `master` (or `main`)
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free
5. Add Environment Variables (see above)
6. Click **"Create Web Service"**

### 3. Configure MongoDB

If using MongoDB Atlas:
1. Go to MongoDB Atlas
2. Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
3. Database Access → Create a database user
4. Copy connection string and add to Render's `MONGODB_URI`

### 4. Update Client URL

After deployment, update your frontend's API URL to point to your Render URL:
```
https://readtogether-server.onrender.com
```

### 5. Important Notes

- **Free Tier Limitation**: Render's free tier spins down after 15 minutes of inactivity
- **Cold Starts**: First request after spin-down takes 30-60 seconds
- **Health Check**: Render pings `/api/health` to keep service alive
- **Logs**: View logs in Render Dashboard → Your Service → Logs

### 6. Upgrade Plan (Optional)

For production use, consider upgrading to a paid plan to avoid cold starts:
- **Starter Plan**: $7/month - No cold starts, better performance

## Troubleshooting

### Build Fails
- Check that `server/package.json` has all dependencies
- Verify build command is correct: `cd server && npm install`

### Service Won't Start
- Check environment variables are set correctly
- Review logs in Render Dashboard
- Ensure MongoDB connection string is valid

### Connection Issues
- Verify MongoDB allows connections from `0.0.0.0/0`
- Check `CLIENT_URL` matches your frontend domain
- Enable CORS in server for your client URL

## Testing Deployment

Once deployed, test the health endpoint:
```bash
curl https://readtogether-server.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Monitoring

- **Dashboard**: Monitor service status in Render Dashboard
- **Logs**: Real-time logs available in Dashboard
- **Metrics**: View CPU, memory, and bandwidth usage
- **Alerts**: Set up email notifications for service issues

## Next Steps

1. Deploy frontend (Vercel, Netlify, or Render Static Site)
2. Update frontend API URL to Render backend URL
3. Test all features end-to-end
4. Set up custom domain (optional)
5. Configure HTTPS (automatic on Render)
