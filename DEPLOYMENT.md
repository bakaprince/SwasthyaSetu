# Deploying SwasthyaSetu to Vercel

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas account with database set up

## Step 1: Prepare Your Repository

1. **Initialize Git (if not already done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SwasthyaSetu"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Create a new repository named "SwasthyaSetu"
   - Don't initialize with README (you already have files)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/SwasthyaSetu.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project:**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as is)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
   - **Install Command:** `cd backend && npm install`

3. **Add Environment Variables:**
   Click "Environment Variables" and add these:

   ```
   MONGODB_URI=mongodb+srv://swasthyasetu_db_user:swasthyasetu@cluster0.iv0i7uk.mongodb.net/swasthyasetu?retryWrites=true&w=majority&appName=Cluster0

   JWT_SECRET=swasthya_setu_jwt_secret_2026_secure

   NODE_ENV=production

   PORT=5000
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://swasthyasetu.vercel.app`

## Step 3: Test Your Deployment

1. **Visit your Vercel URL**
2. **Test the login:**
   - ABHA ID: `12-3456-7890-1234`
   - Password: `patient123`

3. **Check if backend is working:**
   - Visit: `https://your-app.vercel.app/api/health`
   - Should return: `{"success":true,"message":"Server is running"}`

## Step 4: Update MongoDB Atlas (if needed)

If you get connection errors:

1. Go to MongoDB Atlas → Network Access
2. Ensure `0.0.0.0/0` is in the IP whitelist
3. Wait a few minutes for changes to propagate

## Updating Your Deployment

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically redeploy!

## Troubleshooting

### Build Failed Error

If you see "No Output Directory named 'public' found":
- This is expected and can be ignored
- The `vercel.json` configuration handles this

### API Not Working

1. Check environment variables in Vercel dashboard
2. Check Vercel function logs for errors
3. Ensure MongoDB Atlas allows connections from `0.0.0.0/0`

### CORS Errors

The backend is already configured to allow all origins in production.
If you still get CORS errors, check the browser console for the exact error.

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Important Notes

- **Free Tier Limits:** Vercel free tier has limits on bandwidth and function execution time
- **Serverless Functions:** Backend runs as serverless functions (cold starts may occur)
- **Environment Variables:** Never commit `.env` file to Git
- **MongoDB:** Ensure your MongoDB Atlas cluster is in a free tier region for best performance

## Team Access

Share your Vercel URL with your team:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api`

Everyone can now access the same deployment without running anything locally!
