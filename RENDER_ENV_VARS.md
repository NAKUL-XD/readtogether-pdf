# Render Environment Variables Configuration

## Required Environment Variables for Render

Add these in your Render Dashboard when deploying:

### 1. MONGODB_URI
```
mongodb+srv://worknakul08_db_user:bgPNPDEz8eq6dFqG@cluster0.rkpp55d.mongodb.net/readtogether?retryWrites=true&w=majority&appName=Cluster0
```

### 2. JWT_SECRET
Generate a secure random string (minimum 32 characters):
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use this example (CHANGE IN PRODUCTION):
your-super-secret-jwt-key-change-in-production-min-32-chars-long
```

### 3. CLIENT_URL
**IMPORTANT:** Your frontend URL for CORS and Socket.IO

```
# YOUR PRODUCTION URL:
https://client-nu-eight-88.vercel.app

# For both localhost AND production (recommended):
http://localhost:3000,https://client-nu-eight-88.vercel.app

# Wildcard - ONLY for initial testing:
*
```

⚠️ **Use this for your Render deployment:**

```
CLIENT_URL=https://client-nu-eight-88.vercel.app
```

Or if you want to test from both localhost and production:
```
CLIENT_URL=http://localhost:3000,https://client-nu-eight-88.vercel.app
```

**How to update:**
1. ✅ Frontend deployed at: `https://client-nu-eight-88.vercel.app`
2. Deploy backend on Render
3. Go to Render Dashboard → Your Service → Environment
4. Set `CLIENT_URL=https://client-nu-eight-88.vercel.app`
5. Click "Save Changes" (auto-restarts)
6. Update your frontend .env with the Render backend URL

### 4. NODE_ENV
```
production
```

### 5. PORT
Automatically set by Render to `10000`. Your code now reads `PORT` first, then falls back to `SERVER_PORT`.

**You don't need to set this manually** - Render provides it automatically.

---

## 📦 Storage Configuration

### STORAGE_TYPE
```
supabase
```

### SUPABASE_URL
```
https://edgxjfapvlbpexnurxac.supabase.co
```

### SUPABASE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZ3hqZmFwdmxicGV4bnVyeGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MzE1OTQsImV4cCI6MjEwNjQwNzU5NH0.SfM0gQyEvrON5zrFFuGQfMZu-pERf7YMKfKAPFY03Qw
```

### SUPABASE_BUCKET
```
pdf
```

> **Why Supabase?** Render's free tier has ephemeral storage - uploaded files disappear on restart. Supabase provides persistent cloud storage.

---

## MongoDB Atlas Network Access

✅ Make sure your MongoDB Atlas is configured to allow access from anywhere:
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. This allows Render servers to connect

---

## After Deployment

Once your backend is deployed on Render, you'll get a URL like:
```
https://readtogether-server.onrender.com
```

Update your Vercel frontend environment variables:
```
VITE_API_URL=https://readtogether-server.onrender.com/api
VITE_SOCKET_URL=https://readtogether-server.onrender.com
```

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

---

## Security Notes

⚠️ **NEVER commit your real `.env` file to Git!**

✅ The `.env.example` files are safe to commit (no real secrets)

✅ Add real environment variables only in:
- Render Dashboard (for production)
- Local `.env` files (gitignored for development)
