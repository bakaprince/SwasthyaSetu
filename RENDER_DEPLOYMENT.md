# Deploying SwasthyaSetu to Render.com

## Why Render?

✅ **Perfect for Express.js + MongoDB backends**
✅ **Free tier available**
✅ **Always-on server (not serverless)**
✅ **Easy GitHub integration**
✅ **No code changes needed**

---

## Step-by-Step Deployment Guide

### Part 1: Deploy Backend to Render

#### 1. Create Render Account

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. Verify your email

#### 2. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** to link GitHub
3. Select your **SwasthyaSetu** repository
4. Click **"Connect"**

#### 3. Configure Service

Fill in the following settings:

**Basic Settings:**
- **Name:** `swasthyasetu-backend`
- **Region:** Singapore (or closest to you)
- **Branch:** `main`
- **Root Directory:** Leave blank
- **Runtime:** `Node`

**Build & Deploy:**
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`

**Instance Type:**
- Select **"Free"** (0.1 CPU, 512 MB RAM)

#### 4. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
MONGODB_URI = mongodb+srv://swasthyasetu_db_user:YOUR_PASSWORD@cluster0.iv0i7uk.mongodb.net/swasthyasetu?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET = swasthya_setu_jwt_secret_2026_secure

NODE_ENV = production

PORT = 5000

FRONTEND_URL = https://swasthyasetu.vercel.app
```

> **Important:** Replace `YOUR_PASSWORD` with your actual MongoDB password!

#### 5. Deploy!

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://swasthyasetu-backend.onrender.com`

#### 6. Test Backend

Once deployed, test the API:

1. Visit: `https://swasthyasetu-backend.onrender.com/api/health-check`
2. Should see: `{"success":true,"message":"Server is running"}`

✅ **Backend is live!**

---

### Part 2: Update Frontend to Use Render Backend

#### 1. Update API Service

The frontend is already configured to auto-detect the backend URL. No changes needed!

When deployed on Vercel, it will use `/api` (which we'll configure).

#### 2. Update Vercel Configuration

Your `vercel.json` is already set up. Just need to add a rewrite rule to point to Render backend.

#### 3. Redeploy Frontend

```bash
git add .
git commit -m "Update for Render backend deployment"
git push
```

Vercel will auto-deploy the frontend.

---

### Part 3: Connect Frontend to Backend

#### Option A: Use Vercel Rewrites (Recommended)

Update `vercel.json` to proxy API requests to Render:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://swasthyasetu-backend.onrender.com/api/:path*"
    }
  ]
}
```

#### Option B: Direct Backend URL

Update `js/services/api.js` and `js/services/auth.js` to use Render URL directly:

```javascript
const apiBaseUrl = 'https://swasthyasetu-backend.onrender.com/api';
```

---

## Testing the Deployment

### 1. Test Backend API

Visit: `https://swasthyasetu-backend.onrender.com/api/health-check`

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### 2. Test Frontend

Visit: `https://swasthyasetu.vercel.app`

Try logging in:
- **ABHA ID:** `12-3456-7890-1234`
- **Password:** `patient123`

Should redirect to dashboard!

---

## Important Notes

### Free Tier Limitations

⚠️ **Render Free Tier:**
- Server sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (enough for one service)

**Solution:** Keep backend active with a ping service (optional):
- Use https://uptimerobot.com (free)
- Ping your backend every 10 minutes

### MongoDB Atlas

Ensure MongoDB Atlas allows connections:
1. Go to MongoDB Atlas → Network Access
2. Verify `0.0.0.0/0` is in IP whitelist
3. This allows Render to connect

### CORS Configuration

Your backend already has CORS configured to allow all origins in production. No changes needed!

---

## Troubleshooting

### Backend won't start

**Check logs:**
1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors

**Common issues:**
- Missing environment variables
- Wrong MongoDB connection string
- Port configuration (should be 5000)

### Frontend can't connect to backend

**Check:**
1. Backend health check works
2. CORS headers are set
3. API URL is correct in frontend
4. No typos in Render URL

### MongoDB connection fails

**Fix:**
1. Check MongoDB Atlas IP whitelist
2. Verify connection string is correct
3. Ensure password doesn't have special characters (or URL-encode them)

---

## Updating Your Deployment

### Backend Updates

Just push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push
```

Render auto-deploys on every push to `main` branch!

### Frontend Updates

Same process - push to GitHub, Vercel auto-deploys!

---

## URLs Summary

After deployment, you'll have:

- **Backend API:** `https://swasthyasetu-backend.onrender.com`
- **Frontend:** `https://swasthyasetu.vercel.app`
- **API Health:** `https://swasthyasetu-backend.onrender.com/api/health-check`

Share these URLs with your team!

---

## Cost

- **Render Free Tier:** $0/month
- **Vercel Free Tier:** $0/month
- **MongoDB Atlas Free Tier:** $0/month

**Total: FREE!** 🎉

---

## Need Help?

1. Check Render logs for backend errors
2. Check browser console (F12) for frontend errors
3. Verify environment variables are set correctly
4. Test backend health check endpoint

---

## Next Steps After Deployment

1. ✅ Test all features (login, hospitals, appointments)
2. ✅ Share URLs with team members
3. ✅ Set up uptime monitoring (optional)
4. ✅ Configure custom domain (optional)
5. ✅ Set up automatic database backups

**Your app is now live and accessible to everyone!** 🚀
