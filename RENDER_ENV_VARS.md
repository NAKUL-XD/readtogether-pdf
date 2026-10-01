# Render Environment Variables Configuration

## Required Environment Variables for Render

Add these in your Render Dashboard when deploying:

### 1. MONGODB_URI
```
mongodb+srv://nakullegendary_db_user:nAKUL2204@cluster0.bzflis9.mongodb.net/readtogether?retryWrites=true&w=majority&appName=Cluster0
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
Your frontend URL (update after deploying frontend):
```
# During setup, use:
http://localhost:3000

# After frontend deployment, update to:
https://your-frontend.vercel.app
# or
https://your-frontend.netlify.app
```

### 4. NODE_ENV
```
production
```

### 5. PORT (Auto-set by Render)
```
10000
```
> Note: Render automatically sets this, but it's defined in render.yaml

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

Update your frontend environment variables to point to this URL:
```
VITE_API_URL=https://readtogether-server.onrender.com/api
VITE_SOCKET_URL=https://readtogether-server.onrender.com
```

---

## Security Notes

⚠️ **NEVER commit your real `.env` file to Git!**

✅ The `.env.example` files are safe to commit (no real secrets)

✅ Add real environment variables only in:
- Render Dashboard (for production)
- Local `.env` files (gitignored for development)
