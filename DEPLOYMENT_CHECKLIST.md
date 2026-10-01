# 🚀 ReadTogether Deployment Checklist

## ✅ Frontend Status
- **URL**: https://client-nu-eight-88.vercel.app/
- **Platform**: Vercel
- **Status**: ✅ DEPLOYED

## 🔄 Backend Deployment (Next Steps)

### Step 1: Deploy on Render

1. Go to **[Render Dashboard](https://dashboard.render.com/)**
2. Click **"New +" → "Blueprint"**
3. Connect your GitHub repo: `NAKUL-XD/readtogether-pdf`
4. Render will auto-detect `render.yaml`

### Step 2: Set Environment Variables

Add these **3 environment variables** in Render:

```env
MONGODB_URI=mongodb+srv://nakullegendary_db_user:nAKUL2204@cluster0.bzflis9.mongodb.net/readtogether?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-long

CLIENT_URL=https://client-nu-eight-88.vercel.app
```

### Step 3: Deploy!

Click **"Apply"** and wait 3-5 minutes for deployment.

You'll get a backend URL like:
```
https://readtogether-server.onrender.com
```

### Step 4: Update Frontend Environment Variables

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add/Update:
```env
VITE_API_URL=https://readtogether-server.onrender.com/api
VITE_SOCKET_URL=https://readtogether-server.onrender.com
```

**IMPORTANT:** After updating env vars, **redeploy** your frontend:
- Go to Vercel → Deployments → Click "..." → Redeploy

## 🎯 Testing After Deployment

### Test Backend Health:
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

### Test Frontend:
1. Visit: https://client-nu-eight-88.vercel.app/
2. Try creating a room
3. Check browser console for any errors
4. Test real-time features (chat, page sync)

## ⚠️ Common Issues

### Frontend can't connect to backend:
- ✅ Check `CLIENT_URL` in Render matches your frontend URL
- ✅ Check `VITE_API_URL` in Vercel matches your backend URL
- ✅ Redeploy frontend after changing env vars

### MongoDB connection fails:
- ✅ Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- ✅ Check `MONGODB_URI` has correct password
- ✅ Check Render logs for connection errors

### Socket.IO not connecting:
- ✅ Check `VITE_SOCKET_URL` matches backend URL (without /api)
- ✅ Check browser console for WebSocket errors
- ✅ Verify `CLIENT_URL` in backend includes your frontend

## 📊 Monitoring

### Render Dashboard:
- View logs: Dashboard → Your Service → Logs
- View metrics: Dashboard → Your Service → Metrics
- Restart service: Dashboard → Your Service → Manual Deploy → Deploy Latest Commit

### Vercel Dashboard:
- View deployment logs
- Monitor function invocations
- Check edge network performance

## 🎉 Success Criteria

- ✅ Backend health endpoint responds
- ✅ Frontend loads without console errors
- ✅ Can create/join rooms
- ✅ Real-time chat works
- ✅ Page synchronization works
- ✅ File upload works

---

**Need help?** Check `RENDER_DEPLOYMENT.md` for detailed troubleshooting.
