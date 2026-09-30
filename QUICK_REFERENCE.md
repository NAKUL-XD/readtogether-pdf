# Quick Reference Card

## 🚀 Deploy Commands

```bash
# Login
vercel login

# Deploy Frontend
cd client && vercel --prod

# Deploy Backend (use Railway web UI instead)
# https://railway.app
```

## 🔑 Environment Variables

### Backend (Railway)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/readtogether
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ALLOWED_ORIGINS=https://your-frontend.vercel.app
PORT=4000
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
```

## 📦 Local Development

```bash
# Start everything
npm run dev

# Frontend only
npm run dev:client

# Backend only
npm run dev:server

# Build
npm run build
```

## 🔗 Important URLs

- Vercel: https://vercel.com/dashboard
- Railway: https://railway.app/dashboard
- MongoDB: https://cloud.mongodb.com
- Docs: See VERCEL_SETUP.md

## ⚡ Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Socket.IO not working | Use Railway for backend |
| CORS errors | Check ALLOWED_ORIGINS matches exactly |
| PDF upload fails | Vercel limit is 4.5MB, use Cloudinary |
| Build fails | Run `npm run build` locally first |

## 📱 Test Checklist

- [ ] Homepage loads
- [ ] Create room works
- [ ] Upload PDF works
- [ ] Join with invite link works
- [ ] Real-time page sync works
- [ ] Chat works
- [ ] Annotations sync works
- [ ] Mobile responsive works

## 🎯 Stack

- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas
- Storage: Cloudinary (optional)
