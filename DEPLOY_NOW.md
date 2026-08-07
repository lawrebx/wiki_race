# Wiki Race - Direct to Production Deployment

## 🚀 YOLO Deployment Guide

Skip local testing and deploy directly to production. The code is ready!

---

## Step 1: Push to GitHub

```powershell
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Wiki Race MVP"

# Create a new repository on GitHub (via web interface)
# Then link it:
git remote add origin https://github.com/YOUR_USERNAME/wiki-race.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize GitHub and select your `wiki-race` repository
5. Railway will auto-detect the Node.js project

### 2.2 Configure Environment Variables

In Railway project settings → Variables, add:

```env
DATABASE_URL=your_neon_connection_string_here
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://placeholder-will-update-later.vercel.app
```

**Important:** 
- Use your Neon connection string for `DATABASE_URL`
- We'll update `FRONTEND_URL` after Vercel deployment

### 2.3 Configure Build Settings

Railway should auto-detect, but verify:
- **Build Command:** `cd backend && npm install && npm run build`
- **Start Command:** `cd backend && npm start`
- **Root Directory:** `/` (monorepo root)

Or Railway will use the included `railway.json` config automatically.

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Railway will provide a URL like: `https://wiki-race-production.up.railway.app`
4. **Save this URL!** You'll need it for frontend config

### 2.5 Initialize Database

After deployment, run migrations:

**Option A: Railway CLI (if installed)**
```powershell
railway link
railway run npm run db:push --workspaces=backend
```

**Option B: Drizzle Studio**
1. In Railway dashboard, click your service
2. Go to Variables tab
3. Copy your DATABASE_URL
4. Locally run: `cd backend && DATABASE_URL="your_railway_db_url" npm run db:push`

**Option C: Via Railway Shell**
1. In Railway dashboard, click your service
2. Click "Deploy Logs"
3. You can trigger a redeploy to run migrations automatically if configured

### 2.6 Verify Backend

Visit: `https://your-backend.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to **https://vercel.com**
2. Click **"Add New Project"**
3. Import your `wiki-race` GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Project Settings

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 3.3 Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

**Important:** 
- Replace `your-backend` with your actual Railway URL
- Use `https://` for API URL
- Use `wss://` (WebSocket Secure) for WS URL

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build (1-2 minutes)
3. Vercel will provide a URL like: `https://wiki-race.vercel.app`
4. **Save this URL!**

---

## Step 4: Update Backend CORS

Now that you have your Vercel URL, go back to Railway:

1. Go to your Railway project
2. Navigate to Variables
3. Update `FRONTEND_URL` to your Vercel URL:
   ```env
   FRONTEND_URL=https://your-project.vercel.app
   ```
4. Railway will automatically redeploy with the new variable

---

## Step 5: Test Production! 🎮

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Click "Create Lobby"
3. Enter your name and create a lobby
4. Share the invite link with friends
5. Start racing!

---

## Troubleshooting Production Issues

### Frontend can't reach backend
- ✅ Check `NEXT_PUBLIC_API_URL` in Vercel is correct
- ✅ Check Railway backend is running (visit /api/health)
- ✅ Check CORS: `FRONTEND_URL` in Railway matches your Vercel URL exactly

### WebSocket connection fails
- ✅ Verify you're using `wss://` (not `ws://`) in Vercel config
- ✅ Railway supports WebSocket by default, no extra config needed
- ✅ Check browser console for specific error messages

### Database errors
- ✅ Verify DATABASE_URL in Railway is correct
- ✅ Check your Neon database is active (not paused)
- ✅ Verify migrations ran: `npm run db:push` in backend

### 404 or routing errors
- ✅ Clear Vercel cache and redeploy
- ✅ Check Railway logs for backend errors
- ✅ Verify root directory is set to `frontend` in Vercel

---

## View Logs

### Railway Logs
```
https://railway.app/project/YOUR_PROJECT/service/YOUR_SERVICE
→ Click "Deployments" → Select deployment → View logs
```

### Vercel Logs
```
https://vercel.com/YOUR_USERNAME/YOUR_PROJECT/deployments
→ Click deployment → "Logs" tab
```

---

## Quick Reference: URLs to Save

```
Neon Database:     https://console.neon.tech
Railway Backend:   https://your-backend.railway.app
Vercel Frontend:   https://your-project.vercel.app
```

---

## Environment Variables Checklist

### Railway (Backend)
- [x] `DATABASE_URL` - From Neon
- [x] `NODE_ENV` - Set to `production`
- [x] `PORT` - Set to `3001` (or Railway default)
- [x] `FRONTEND_URL` - Your Vercel URL

### Vercel (Frontend)
- [x] `NEXT_PUBLIC_API_URL` - Railway HTTPS URL
- [x] `NEXT_PUBLIC_WS_URL` - Railway WSS URL

---

## Custom Domains (Optional)

### Add custom domain to Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

### Add custom domain to Railway
1. Go to Project Settings → Domains
2. Add your domain
3. Update Vercel environment variables with new domain

---

## What's Next?

After successful deployment:

1. ✅ Share the invite link with friends
2. ✅ Test with multiple players
3. ✅ Monitor Railway and Vercel dashboards
4. 📊 (Optional) Add analytics
5. 🎨 (Optional) Customize styling
6. 🔔 (Optional) Add notifications

---

## Cost Estimate (Free Tiers)

- **Neon:** Free tier (0.5 GB storage, auto-suspend)
- **Railway:** $5/month free credit (enough for this project)
- **Vercel:** Free hobby plan (unlimited personal projects)

**Total:** Basically free! 🎉

---

**Ready to deploy? Start with Step 1 (GitHub) and work your way down!**

If you run into issues, check the logs first, then refer to the troubleshooting section.
