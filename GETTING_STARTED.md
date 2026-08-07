# Getting Started - First Time Setup

## ❗ You're seeing ERR_CONNECTION_REFUSED because the development server isn't running yet.

Follow these steps to get Wiki Race up and running:

---

## Step 1: Install Node.js ⚠️ REQUIRED

The project needs Node.js to run. 

1. **Download Node.js**
   - Go to: https://nodejs.org/
   - Download the **LTS version** (recommended for most users)
   - Run the installer

2. **Verify Installation**
   - Open a **NEW** terminal/PowerShell window
   - Run: `node --version` (should show v18 or higher)
   - Run: `npm --version` (should show version number)

3. **Restart VS Code** after installing Node.js

---

## Step 2: Quick Setup (Windows)

Once Node.js is installed, you can use the automated setup:

```powershell
# Run the setup script
.\setup.bat
```

This will:
- Install all dependencies
- Create environment files
- Guide you through database setup

**OR** follow the manual steps below:

---

## Step 3: Manual Setup

### 3a. Install Dependencies

```powershell
npm install
```

This installs all packages for frontend, backend, and shared code.

### 3b. Set Up Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://user:password@host:5432/wikirace
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**For quick local testing**, you can use a free Neon database:
1. Go to https://neon.tech
2. Sign up (free)
3. Create a project
4. Copy the connection string
5. Paste it as DATABASE_URL in `backend/.env`

### 3c. Initialize Database

```powershell
cd backend
npm run db:push
cd ..
```

This creates all the necessary tables.

---

## Step 4: Start Development Servers

**Option A: Use the start script (Windows)**
```powershell
.\start.bat
```

**Option B: Use npm command**
```powershell
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Step 5: Open in Browser

Visit: **http://localhost:3000**

You should see the Wiki Race home page!

---

## 🎮 Quick Test

1. Click "Create Lobby"
2. Enter your name
3. Click "Create Lobby" button
4. Copy the lobby code
5. Open another browser tab/window
6. Click "Join Lobby"
7. Enter the code and a different name
8. Start the game from the first tab
9. Try navigating Wikipedia articles!

---

## 🐛 Troubleshooting

### "npm is not recognized"
- Node.js isn't installed or not in PATH
- Install Node.js from https://nodejs.org/
- Restart your terminal/VS Code

### "Port 3000 is already in use"
```powershell
npx kill-port 3000
```

### "Database connection failed"
- Check DATABASE_URL in `backend/.env`
- Make sure your Neon database is active
- Try pinging the database from Neon dashboard

### "Module not found" errors
```powershell
# Clean install
rm -r node_modules
npm install
```

### Still not working?
1. Check [todo.md](todo.md) for setup checklist
2. See [SETUP.md](SETUP.md) for detailed guide
3. See [QUICKSTART.md](QUICKSTART.md) for commands reference

---

## 📚 Next Steps

After you get it running locally:

1. ✅ Test the game with multiple players
2. ✅ Read [README.md](README.md) for full documentation
3. ✅ Check [SETUP.md](SETUP.md) for deployment guide
4. ✅ See [todo.md](todo.md) for deployment checklist

---

## 🚀 When You're Ready to Deploy

The project is production-ready and includes:
- Vercel config for frontend
- Railway config for backend
- Complete deployment guide in SETUP.md

---

**Need help? All documentation is in the project root:**
- README.md - Overview
- SETUP.md - Detailed setup
- QUICKSTART.md - Quick reference
- todo.md - Setup checklist
