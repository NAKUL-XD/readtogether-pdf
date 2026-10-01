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
**IMPORTANT:** Your frontend URL for CORS and Socket.IO

```
# Option 1: Single production URL (after frontend deployment):
https://readtogether.vercel.app

# Option 2: Multiple URLs (comma-separated, for both dev and prod):
http://localhost:3000,https://readtogether.vercel.app

# Option 3: Wildcard (ONLY for testing - NOT SECURE):
*
```

⚠️ **Recommended approach:**

**During initial backend deployment:**
```
CLIENT_URL=*
```
This allows any origin temporarily so you can test.

**After frontend deployment (CHANGE THIS ASAP):**
```
CLIENT_URL=https://readtogether.vercel.app
```
Or if you want to keep localhost access for development:
```
CLIENT_URL=http://localhost:3000,https://readtogether.vercel.app
```

**How to update:**
1. Deploy backend first
2. Deploy frontend and get the URL
3. Go to Render Dashboard → Your Service → Environment
4. Update `CLIENT_URL` with your frontend URL
5. Click "Save Changes" (auto-restarts)

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
