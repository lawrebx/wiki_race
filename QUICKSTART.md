# Wiki Race - Quick Reference

## 🚀 Getting Started (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both files with your database URL

# 3. Initialize database
cd backend
npm run db:push
cd ..

# 4. Start development servers
npm run dev
```

Visit: http://localhost:3000

---

## 📝 Daily Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:frontend
npm run dev:backend
```

---

## 🗄️ Database Commands

```bash
cd backend

# Push schema changes to database (no migrations)
npm run db:push

# Generate migration files
npm run db:generate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

---

## 🏗️ Building for Production

```bash
# Build everything
npm run build

# Or build separately
npm run build:backend
npm run build:frontend

# Start production backend
cd backend && npm start

# Start production frontend  
cd frontend && npm start
```

---

## 🚢 Deployment Checklist

### First Deployment

- [ ] Create Neon database
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Update environment variables on both platforms
- [ ] Run database migrations on Railway
- [ ] Test production URLs

### After Code Changes

```bash
# 1. Commit changes
git add .
git commit -m "Your changes"
git push

# 2. Railway and Vercel auto-deploy from GitHub
# 3. Check deployment logs
# 4. Test production site
```

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check environment variables
cat backend/.env

# Check database connection
cd backend
npm run db:studio
```

### Frontend can't connect to backend
```bash
# Check frontend environment
cat frontend/.env.local

# Verify backend is running
curl http://localhost:3001/api/health
```

### Database issues
```bash
# Re-push schema
cd backend
npm run db:push

# Or use Drizzle Studio
npm run db:studio
```

### Clean install
```bash
# Remove all node_modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules shared/node_modules
npm install
```

---

## 📊 Project Structure

```
wiki_race/
├── backend/                    # Express + WebSocket server
│   ├── src/
│   │   ├── db/                # Database schema and connection
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── websocket/         # WebSocket manager
│   │   └── index.ts           # Server entry point
│   ├── drizzle.config.ts      # Drizzle configuration
│   └── package.json
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # Pages (App Router)
│   │   ├── components/        # React components
│   │   └── lib/               # API client, WebSocket, utils
│   ├── tailwind.config.js
│   └── package.json
│
├── shared/                     # Shared TypeScript types
│   └── src/types.ts
│
├── .gitignore
├── package.json               # Root workspace config
├── README.md                  # Full documentation
├── SETUP.md                   # Complete setup guide
└── QUICKSTART.md             # This file!
```

---

## 🎮 Testing Locally

### Single Browser Test
1. Create lobby at http://localhost:3000
2. Copy lobby code
3. Open incognito window
4. Join lobby with code
5. Start game and test

### Multi-Device Test
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Create lobby on computer
3. Join from phone: `http://<your-ip>:3000`
4. Test multiplayer functionality

---

## 🔗 Useful URLs

### Local Development
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/api/health
- WebSocket: ws://localhost:3001/ws

### Production (after deployment)
- Frontend: https://your-project.vercel.app
- Backend API: https://your-backend.railway.app/api
- WebSocket: wss://your-backend.railway.app/ws

### Dashboards
- Neon: https://console.neon.tech
- Railway: https://railway.app
- Vercel: https://vercel.com/dashboard

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Kill process: `npx kill-port 3000` |
| Port 3001 in use | Kill process: `npx kill-port 3001` |
| TypeScript errors | Run `npm install` in affected folder |
| Database errors | Check DATABASE_URL and run `npm run db:push` |
| CORS errors | Check FRONTEND_URL in backend .env |
| WebSocket fails | Use wss:// (not ws://) in production |

---

## 📚 Key Technologies

- **Next.js 15** - React framework for frontend
- **Express** - Backend web server
- **WebSocket (ws)** - Real-time communication
- **Drizzle ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety across stack

---

## 💡 Tips

- Use `npm run db:studio` to inspect database visually
- Check Railway logs when backend issues occur
- Use browser DevTools → Network → WS to debug WebSocket
- Test with at least 2 players to verify real-time sync
- Start with Easy difficulty for testing
- Use predefined article pairs for consistent testing

---

## 🎯 Next Steps

After getting it running:

1. ✅ Test core gameplay loop
2. ✅ Test with multiple players
3. ✅ Deploy to production
4. ✅ Share with friends
5. 📈 Add custom article pairs
6. 📊 Add analytics (optional)
7. 🎨 Customize styling
8. 🔔 Add notifications/sound effects

---

**Need more help? Check README.md or SETUP.md**
