# 🚀 SwasthyaSetu Deployment Guide

SwasthyaSetu consists of:

1. **Frontend** – Static HTML/CSS/JS (Hosted on Vercel)
2. **Backend** – Node.js + Express API (Hosted on Render)
3. **Database** – MongoDB Atlas (Cloud)

---

# 🧠 Deployment Architecture

User → Vercel (Frontend) → Render (Backend API) → MongoDB Atlas (Database)

---

# 🌐 Backend Deployment (Render)

## Step 1: Create Account
1. Go to https://render.com
2. Sign up with GitHub
3. Verify email

---

## Step 2: Create Web Service
1. Click **New → Web Service**
2. Connect GitHub repository
3. Select `SwasthyaSetu`
4. Choose branch: `main`

---

## Step 3: Configure Service

### Basic Settings
- **Name:** `swasthyasetu-backend`
- **Region:** Singapore (or nearest)
- **Runtime:** Node
- **Root Directory:** `backend`

### Build & Start Commands
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`

### Instance Type
Select **Free Tier**

---

## Step 4: Add Environment Variables

In Render → Environment tab:
Add these variables:

```
MONGODB_URI = your_mongodb_connection_string

JWT_SECRET = your_secure_random_secret

NODE_ENV = production

PORT = 5000

FRONTEND_URL = https://your-frontend-url
```
⚠️ Never commit secrets to GitHub.

---

## Step 5: Deploy

Click **Create Web Service**

Deployment takes ~3–5 minutes.

Backend URL: https://swasthyasetu-backend.onrender.com/

---

## Step 6: Verify Backend

Open: https://swasthyasetu-backend.onrender.com/api/health-check

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

✅ **Backend is live!**

---

# 🎨 Frontend Deployment (Vercel)

The frontend of SwasthyaSetu is a fully static HTML/CSS/JavaScript application and does not require a build step.

---

## Step 1: Deploy to Vercel

1. Go to https://vercel.com
2. Click **Add New → Project**
3. Import your GitHub repository

### Configuration Settings

- **Framework Preset:** Other
- **Build Command:** (Leave empty)
- **Output Directory:** `.`
- **Install Command:** (Leave empty)

Click **Deploy**.

Vercel will automatically host your frontend and provide a public URL.

---

## Step 2: Connect Frontend to Backend

After deploying the backend on Render, connect the frontend using one of the following methods:

---

### Option A (Recommended): Use Vercel Rewrites

Create or update a file named `vercel.json` in the root directory:

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
### Option B : Direct Backend URL

Update `js/services/api.js` and `js/services/auth.js` to use Render URL directly:

```javascript
const apiBaseUrl = 'https://swasthyasetu-backend.onrender.com/api';
```

## Step 3: Redeploy Frontend

```bash
git add .
git commit -m "Update for Render backend deployment"
git push
```

Vercel will auto-deploy the frontend.

---
## Step 4: Verify Frontend Deployment

Open: https://swasthyasetu.vercel.app

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

✅ **Frontend is live!**

---

# 🗄 MongoDB Atlas Setup

SwasthyaSetu uses **MongoDB Atlas** as its cloud database provider.

---

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Click **Try Free**
3. Sign up using Google or email
4. Create a new project (e.g., `SwasthyaSetu`)

---

## Step 2: Create a Free Cluster

1. Click **Build a Database**
2. Select **M0 Free Tier**
3. Choose your preferred region (closest to your backend region)
4. Click **Create Cluster**

Cluster creation may take 2–5 minutes.

---

## Step 3: Create Database User

1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password Authentication**
4. Enter:
   - Username (e.g., `swasthyasetu_user`)
   - Strong password
5. Set Role:
   - `Read and write to any database`
6. Click **Add User**

---

## Step 4: Configure Network Access

1. Go to **Network Access**
2. Click **Add IP Address**
3. Select: Allow Access from Anywhere (0.0.0.0/0)

This is required for Render to connect to MongoDB.

Click **Confirm**.

---

## Step 5: Get Connection String

1. Go to **Database**
2. Click **Connect**
3. Select **Connect your application**
4. Copy the provided connection string

It will look like:

```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/swasthyasetu?retryWrites=true&w=majority
```
---

## Step 6: Replace Credentials

Replace:

- `USERNAME` → your database username
- `PASSWORD` → your database password

Also specify your database name:

```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority
```
---

## Step 7: Add to Render Environment Variables

In Render → Backend Service → **Environment Variables**

Add:

```
MONGODB_URI = mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database_name>?retryWrites=true&w=majority
```
Do NOT commit this string to GitHub.

---

## Step 8: Verify Connection

After backend deployment:

1. Open Render dashboard
2. Check logs
3. Ensure no MongoDB connection errors appear

You should see:

```
Mongoose connected to MongoDB
```
---

## Optional: Create Initial Database

MongoDB Atlas automatically creates the database when your backend first inserts data.

No manual database creation is required.

---

## Security Best Practices

- Use a strong password
- Do not expose connection string publicly
- Rotate JWT_SECRET periodically
- Restrict IP access in production (avoid 0.0.0.0/0 outside hackathon/demo)

---

## Free Tier Limits

- 512 MB storage
- Shared cluster resources
- Suitable for demo and development

---

Your MongoDB database is now connected and ready for use with SwasthyaSetu.

---

# ⚠️ Free Tier Notes

SwasthyaSetu is deployed entirely using free-tier services. While cost-effective, free tiers come with certain limitations.

---

## Render Free Tier

- Server sleeps after **15 minutes** of inactivity
- First request after sleep may take **30–60 seconds** (cold start)
- 750 free hours per month
- Limited CPU and RAM

### Recommendation (Optional)

Use a free uptime monitoring service like UptimeRobot to ping:

```
https://swasthyasetu-backend.onrender.com/api/health-check
```

every 10 minutes to prevent cold starts during demo periods.

---

## Vercel Free Tier

- Ideal for static frontend hosting
- Automatic deployments on Git push
- Bandwidth limits apply (sufficient for hackathon/demo use)

---

## MongoDB Atlas Free Tier

- 512 MB storage
- Shared cluster performance
- Suitable for development and demo environments

---

# 🧪 Post-Deployment Checklist

After deployment, verify the following:

## Backend Verification

- Open health endpoint:

```
https://swasthyasetu-backend.onrender.com/api/health-check
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```
# 🔄 Updating Deployment

## Backend Updates

Whenever backend changes are made:

```bash
git add .
git commit -m "Backend update"
git push
```
# 💰 Cost Breakdown

SwasthyaSetu is deployed entirely using free-tier services.

| Service        | Plan        | Monthly Cost |
|---------------|------------|--------------|
| Render        | Free Tier  | $0           |
| Vercel        | Free Tier  | $0           |
| MongoDB Atlas | Free Tier  | $0           |

---

## Total Monthly Cost

**$0 / month**

The entire platform runs free under development and hackathon-level usage limits.

---

# 🌍 Final URLs

After deployment, your application will be accessible at:

## 🔹 Backend API
https://swasthyasetu-backend.onrender.com

## 🔹 Frontend
https://your-frontend.vercel.app

## 🔹 API Health Check
https://swasthyasetu-backend.onrender.com/api/health-check

---

Share the frontend URL for demos.
Use the health-check endpoint to verify backend availability.
