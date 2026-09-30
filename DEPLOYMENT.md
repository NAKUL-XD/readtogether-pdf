# Deployment Guide - ReadTogether on Vercel

This guide will help you deploy the ReadTogether application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Free tier at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **Vercel CLI** (optional): `npm install -g vercel`

## Architecture Overview

- **Frontend (Client)**: React + Vite → Vercel (Static)
- **Backend (Server)**: Express + Socket.IO → Vercel (Serverless Functions)
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Need cloud storage (Cloudinary, AWS S3, or Vercel Blob)

## ⚠️ Important Notes

### Socket.IO on Vercel Limitations

Vercel's serverless functions have a **10-second timeout** and don't support persistent WebSocket connections well. For a production app with Socket.IO, consider:

1. **Alternative: Deploy Backend Separately**
   - Use **Railway**, **Render**, or **Fly.io** for the backend
   - Keep frontend on Vercel
   - **Recommended for this app** ✅

2. **Alternative: Use Vercel with Pusher/Ably**
   - Replace Socket.IO with a managed WebSocket service
   - More expensive but works on Vercel

3. **Test on Vercel First**
   - It might work for light usage
   - Monitor for connection issues

## Option 1: Deploy Backend to Railway (Recommended)

### Step 1: Deploy Server to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your repository
4. Railway will auto-detect the Express app
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-strong-secret>
   PORT=4000
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Railway will give you a URL like: `https://your-app.railway.app`

### Step 2: Setup MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with password
3. Whitelist all IPs (0.0.0.0/0) for Railway access
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/readtogether
   ```

### Step 3: Setup Cloud Storage (for PDF uploads)

**Option A: Cloudinary (Free tier: 25 GB)**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get API credentials
3. Install: `npm install cloudinary`
4. Update `bookController.ts` to upload to Cloudinary

**Option B: Vercel Blob Storage**
1. Install: `npm install @vercel/blob`
2. Enable in Vercel dashboard
3. Update upload logic

### Step 4: Deploy Client to Vercel

1. Go to [vercel.com](https://vercel.com/new)
2. Import your Git repository
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   VITE_SOCKET_URL=https://your-app.railway.app
   ```
5. Deploy!

## Option 2: Both on Vercel (Experimental)

### Step 1: Deploy Server to Vercel

```bash
cd server
vercel --prod
```

**Environment Variables** (add in Vercel dashboard):
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://your-client.vercel.app
```

**Note**: You'll get a URL like: `https://your-server.vercel.app`

### Step 2: Deploy Client to Vercel

```bash
cd client
vercel --prod
```

**Environment Variables**:
```
VITE_API_URL=https://your-server.vercel.app/api
VITE_SOCKET_URL=https://your-server.vercel.app
```

### Step 3: Update CORS

Update server's ALLOWED_ORIGINS with your client URL.

## Quick Deploy Commands

### Deploy Server
```bash
cd server
npm run build
vercel --prod
```

### Deploy Client
```bash
cd client
npm run build
vercel --prod
```

## Environment Variables Checklist

### Server (.env)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=<atlas-connection-string>`
- [ ] `JWT_SECRET=<min-32-char-random-string>`
- [ ] `ALLOWED_ORIGINS=<frontend-url>`
- [ ] `PORT=4000`

### Client (.env)
- [ ] `VITE_API_URL=<backend-url>/api`
- [ ] `VITE_SOCKET_URL=<backend-url>`

## Post-Deployment Checklist

- [ ] Test room creation
- [ ] Test PDF upload (check file storage)
- [ ] Test invite links
- [ ] Test real-time sync (page changes)
- [ ] Test chat
- [ ] Test annotations sync
- [ ] Test on mobile devices
- [ ] Check WebSocket connections in Network tab
- [ ] Monitor error logs in Vercel dashboard

## Troubleshooting

### Socket.IO Not Connecting
- Check CORS settings
- Verify VITE_SOCKET_URL is correct
- Check browser console for errors
- Try Railway/Render for backend

### PDF Upload Fails
- Vercel has 4.5MB body size limit
- Use cloud storage (Cloudinary/S3)
- Check file size limits

### Build Fails
- Run `npm run build` locally first
- Check TypeScript errors
- Verify all dependencies are in package.json

### 502/504 Errors
- Serverless functions timeout after 10s
- Optimize database queries
- Consider moving to Railway

## Recommended Stack for Production

✅ **Frontend**: Vercel (excellent for React/Vite)
✅ **Backend**: Railway or Render (better for WebSocket)
✅ **Database**: MongoDB Atlas
✅ **Storage**: Cloudinary or AWS S3

## Alternative: Deploy to Single Platform

Consider deploying everything to:
- **Railway** (easiest, handles WebSocket well)
- **Render** (similar to Railway)
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**

These platforms support persistent connections better than Vercel's serverless functions.

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check Railway/Render logs
3. Test WebSocket connection in browser console
4. Verify environment variables are set correctly

---

**Ready to deploy?** Start with Railway for backend + Vercel for frontend for the best experience! 🚀
