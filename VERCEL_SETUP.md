# Quick Vercel Deployment Setup

## 🚀 Fastest Way to Deploy

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Client (Frontend)

```bash
cd client
vercel --prod
```

**When prompted:**
- Link to existing project? **No**
- Project name: `readtogether-client` (or your choice)
- Directory: `./` (current directory)
- Override build settings? **Yes**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

**After deployment, note your URL**: `https://your-app.vercel.app`

### Step 4: Deploy Server (Backend)

⚠️ **IMPORTANT**: Vercel has limitations with Socket.IO. For better results, use **Railway** or **Render** for the backend.

#### Option A: Deploy to Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder
6. Add environment variables (see below)
7. Deploy!

#### Option B: Deploy to Vercel (Testing Only)

```bash
cd server
vercel --prod
```

**Note your server URL**: `https://your-server.vercel.app`

### Step 5: Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all)
5. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/readtogether
   ```

### Step 6: Configure Environment Variables

#### For Server (in Vercel/Railway Dashboard)

Go to your project → Settings → Environment Variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/readtogether
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
ALLOWED_ORIGINS=https://your-client.vercel.app
PORT=4000
MAX_FILE_SIZE=104857600
```

#### For Client (in Vercel Dashboard)

Go to your project → Settings → Environment Variables:

```env
VITE_API_URL=https://your-server.railway.app/api
VITE_SOCKET_URL=https://your-server.railway.app
```

**Note**: Replace `your-server.railway.app` with your actual backend URL.

### Step 7: Redeploy Client

After adding environment variables:

```bash
cd client
vercel --prod
```

Or use Vercel Dashboard → Deployments → Redeploy

### Step 8: Test Your App! 🎉

1. Open your client URL: `https://your-app.vercel.app`
2. Create a room
3. Upload a PDF
4. Test annotations
5. Share invite link with a friend!

## 📋 Environment Variables Reference

### Generate JWT Secret

Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Complete Server .env

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/readtogether
JWT_SECRET=generated-secret-from-above
ALLOWED_ORIGINS=https://your-client.vercel.app,https://another-domain.com
MAX_FILE_SIZE=104857600
UPLOAD_DIR=/tmp/uploads
```

### Complete Client .env

```env
VITE_API_URL=https://your-server.railway.app/api
VITE_SOCKET_URL=https://your-server.railway.app
```

## 🔧 Troubleshooting

### Socket.IO Not Working

**Symptom**: Real-time features (chat, annotations) don't sync

**Solution**: 
1. Check browser console for WebSocket errors
2. Verify `VITE_SOCKET_URL` is correct
3. Check CORS settings on server
4. **Best fix**: Move backend to Railway/Render

### PDF Upload Fails

**Symptom**: "Upload failed" or 413 error

**Solution**:
1. Vercel has 4.5MB request limit
2. For larger files, use cloud storage:
   - Cloudinary (recommended, free 25GB)
   - AWS S3
   - Vercel Blob Storage

### Build Errors

**Solution**:
1. Test build locally: `npm run build`
2. Check TypeScript errors
3. Verify all imports are correct
4. Check node version in vercel.json

### CORS Errors

**Solution**:
1. Add client URL to `ALLOWED_ORIGINS` on server
2. Format: `https://your-app.vercel.app` (no trailing slash)
3. Multiple origins: `https://app1.vercel.app,https://app2.vercel.app`

## 🎯 Recommended Setup

For best performance and reliability:

- ✅ **Frontend**: Vercel
- ✅ **Backend**: Railway or Render
- ✅ **Database**: MongoDB Atlas
- ✅ **Storage**: Cloudinary

## 📦 Using the Deploy Script

### Windows (PowerShell)

```powershell
.\deploy-vercel.ps1
```

### Mac/Linux

```bash
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Cloudinary](https://cloudinary.com/console)

---

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for more details.
