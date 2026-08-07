# Wiki Race - Complete Setup Guide

This guide walks you through setting up Wiki Race from scratch, including all deployment steps.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Setup (Neon)](#database-setup-neon)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### 1. Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd wiki_race

# Install all dependencies
npm install
```

### 3. Set Up Local Database

**Option A: Use Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

**Option B: Use Local PostgreSQL**
```bash
# Install PostgreSQL
# Create database
createdb wikirace
```

### 4. Configure Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://username:password@host:5432/wikirace
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 5. Initialize Database

```bash
cd backend
npm run db:push
```

This creates all necessary tables in your database.

### 6. Start Development Servers

**From root directory:**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

### 7. Test Locally

1. Open http://localhost:3000
2. Create a lobby
3. Open another browser/tab
4. Join the lobby using the code
5. Start the game and test navigation

---

## Database Setup (Neon)

### 1. Create Account
1. Visit [neon.tech](https://neon.tech)
2. Sign up with GitHub (recommended)

### 2. Create Project
1. Click "Create a project"
2. Choose a region close to your Railway deployment
3. Name your project "wiki-race"

### 3. Get Connection String
1. Go to project dashboard
2. Copy the connection string
3. It looks like: `postgresql://user:pass@host.neon.tech/dbname`

### 4. Configure
- Connection pooling is automatically enabled
- Free tier includes:
  - 0.5 GB storage
  - Autosuspend after inactivity
  - Perfect for this project

---

## Backend Deployment (Railway)

### 1. Prepare Repository
Make sure your code is pushed to GitHub.

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your wiki_race repository

### 3. Configure Build
Railway should auto-detect the Node.js project. Verify:
- Build Command: `cd backend && npm install && npm run build`
- Start Command: `cd backend && npm start`

Or use the included `railway.json` configuration.

### 4. Add Environment Variables

In Railway project settings, add:

```env
DATABASE_URL=<your-neon-connection-string>
NODE_ENV=production
FRONTEND_URL=<will-add-after-vercel-deployment>
PORT=3001
```

**Note:** Leave `FRONTEND_URL` empty for now. We'll update it after deploying the frontend.

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Railway will provide a URL like: `https://wiki-race-backend.railway.app`
4. Save this URL for frontend configuration

### 6. Initialize Database
After first deployment:
```bash
# Use Railway CLI
railway run npm run db:push
```

Or connect to your Railway deployment and run migrations through Drizzle Studio.

### 7. Test Backend
Visit: `https://your-backend.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

---

## Frontend Deployment (Vercel)

### 1. Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your wiki_race repository

### 2. Configure Build Settings

Vercel should auto-detect Next.js. Verify:
- Framework Preset: Next.js
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`

Or use the included `vercel.json` configuration.

### 3. Set Environment Variables

In Vercel project settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend.railway.app
```

**Important:** Use `https://` for API and `wss://` for WebSocket!

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Vercel will provide a URL like: `https://wiki-race.vercel.app`

### 5. Update Backend CORS

Go back to Railway and update the backend environment variable:
```env
FRONTEND_URL=https://your-project.vercel.app
```

Redeploy the backend for changes to take effect.

### 6. Test Production
1. Visit your Vercel URL
2. Create a lobby
3. Share the join link
4. Test multiplayer functionality

---

## Testing

### Local Testing Checklist
- [ ] Can create a lobby
- [ ] Can join a lobby with code
- [ ] Host can start game
- [ ] Can navigate Wikipedia articles
- [ ] Links are clickable
- [ ] Dead pages are marked in red
- [ ] Can see other players' positions
- [ ] Can see path tooltips on hover
- [ ] Winner is determined correctly
- [ ] WebSocket reconnects on disconnect

### Production Testing Checklist
- [ ] All local tests pass
- [ ] Can access from different devices
- [ ] Can access from different networks
- [ ] WebSocket (WSS) works over HTTPS
- [ ] Database persists across restarts
- [ ] No CORS errors in console

---

## Troubleshooting

### "Failed to connect" Error

**Problem:** Frontend can't reach backend.

**Solutions:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify Railway backend is running
3. Check Railway logs for errors
4. Ensure CORS is configured with correct frontend URL

### "Lobby not found" Error

**Problem:** Database not initialized or connection failed.

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Run `npm run db:push` in backend
3. Check Neon dashboard that database is active
4. Check Railway logs for database connection errors

### WebSocket Connection Failed

**Problem:** Real-time updates not working.

**Solutions:**
1. Check `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
2. Verify Railway supports WebSocket (it does by default)
3. Check browser console for WebSocket errors
4. Test WebSocket endpoint: Open DevTools → Network → WS tab

### Wikipedia Articles Not Loading

**Problem:** Article fetching fails.

**Solutions:**
1. Check backend logs for Wikipedia API errors
2. Verify internet connection
3. Wikipedia API might be rate-limiting (wait a few minutes)
4. Check if article title is valid

### "That page is dead" for Start Article

**Problem:** Start article incorrectly marked as dead.

**Solutions:**
1. This is a bug - start article should never be dead
2. Check game logic in `game.service.ts`
3. Clear dead pages for that lobby in database
4. Restart the game

### Build Failures

**Railway Build Fails:**
1. Check `package.json` scripts are correct
2. Verify all dependencies are listed
3. Check Railway build logs for specific errors
4. Ensure Node.js version compatibility

**Vercel Build Fails:**
1. Check Next.js configuration
2. Verify all environment variables are set
3. Check Vercel build logs
4. Ensure TypeScript compiles without errors

### Database Issues

**Connection Timeouts:**
1. Check Neon project is not paused (free tier auto-pauses)
2. Visit Neon dashboard to wake up database
3. Verify connection string is correct
4. Check network/firewall settings

**Migration Errors:**
1. Run `npm run db:generate` to create new migration
2. Run `npm run db:push` to apply to database
3. Check schema.ts for syntax errors
4. Use Drizzle Studio to inspect database state

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |

### Frontend (.env.local)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend HTTP URL | `http://localhost:3001` |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL | `ws://localhost:3001` |

**Note:** Use `https://` and `wss://` in production!

---

## Useful Commands

### Development
```bash
# Start everything
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Database operations
cd backend
npm run db:generate    # Create migration
npm run db:push        # Apply to database
npm run db:studio      # Open Drizzle Studio
```

### Production
```bash
# Build everything
npm run build

# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Start production backend
cd backend && npm start

# Start production frontend
cd frontend && npm start
```

---

## Next Steps

After successful deployment:

1. **Test thoroughly** with multiple players
2. **Monitor logs** in Railway and Vercel
3. **Set up error tracking** (Sentry recommended)
4. **Configure custom domain** (optional)
5. **Add analytics** (optional)

---

## Support

If you encounter issues not covered here:

1. Check Railway logs: `railway logs`
2. Check Vercel logs: Project → Deployments → Logs
3. Check browser console for frontend errors
4. Check database with Drizzle Studio
5. Review this guide thoroughly

---

**Happy Racing! 🏁**
