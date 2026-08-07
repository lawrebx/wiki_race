# Wiki Race

A real-time multiplayer Wikipedia racing game where every click changes the map.

Wiki Race challenges players to navigate from one Wikipedia article to another using only links found within articles. Unlike traditional Wiki Game variants, players compete simultaneously in a shared lobby where visited pages become unavailable to everyone else.

The result is a fast-paced mix of pathfinding, strategy, and sabotage.

## 🎮 How It Works

1. All players start on the same Wikipedia article
2. Everyone races to reach the same target article
3. Players may only move by clicking valid Wikipedia article links
4. A page can only be occupied by one player at a time
5. Once a player leaves a page, that page becomes permanently **dead**
6. Dead pages can never be visited again by anyone
7. The first player to reach the target wins

Every move permanently reshapes the navigation graph, forcing players to adapt as opponents eliminate routes in real time.

## ✨ Features

- 🎯 Configurable difficulty levels (Easy, Medium, Hard)
- 👥 Real-time multiplayer friends lobbies
- ☠️ Shared "dead page" territory control mechanic
- 📡 Live competitor tracking with path tooltips
- 🗺️ Hoverable path history for all players
- 🏆 Race rankings based on time and click count
- ⚡ WebSocket-powered real-time gameplay
- 📚 Wikipedia API integration with intelligent caching
- 🛡️ Server-authoritative move validation

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 with React 19
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Real-time:** WebSocket client

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express
- **WebSocket:** ws library
- **Deployment:** Railway
- **Database:** Neon Postgres
- **ORM:** Drizzle ORM

### Monorepo Structure
```
wiki-race/
├── frontend/          # Next.js application
├── backend/           # Express + WebSocket server
├── shared/            # Shared TypeScript types
└── package.json       # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or Neon)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd wiki_race
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Backend (`backend/.env`):
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/wikirace
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   Frontend (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```

4. **Initialize the database**
   ```bash
   cd backend
   npm run db:push
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This starts both frontend (localhost:3000) and backend (localhost:3001)

## 📦 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
   - `NEXT_PUBLIC_WS_URL`: Your Railway WebSocket URL (wss://)
4. Deploy

### Backend (Railway)

1. Create new Railway project
2. Add Neon Postgres database
3. Connect GitHub repository
4. Set environment variables:
   - `DATABASE_URL`: From Neon dashboard
   - `FRONTEND_URL`: Your Vercel deployment URL
   - `PORT`: 3001 (Railway sets this automatically)
5. Deploy

### Database (Neon)

1. Create account at neon.tech
2. Create new project
3. Copy connection string
4. Use in `DATABASE_URL` for Railway backend

## 🎯 Game Rules

### Valid Moves
- ✅ Internal Wikipedia article links only
- ✅ Article namespace pages (main Wikipedia articles)
- ✅ Normalized article titles

### Invalid Moves
- ❌ Search box usage
- ❌ Manual URL entry
- ❌ External links
- ❌ Category/Help/File/Talk pages
- ❌ Special pages
- ❌ Browser back button
- ❌ Opening links in new tabs

### Dead Page Rule
1. When a player occupies a page, it's unavailable to others
2. When the player leaves, the page becomes globally dead
3. Dead pages cannot be entered for the rest of the match
4. The start article is special: everyone starts there, but can't return
5. The target article always remains enterable

## 🎮 How to Play

1. **Create a Lobby**
   - Enter your name
   - Optionally configure start/target articles, difficulty, time limit
   - Share the 6-character code with friends

2. **Wait for Players**
   - Players join using the code
   - Host starts the game when ready (min 2 players)

3. **Race!**
   - Click Wikipedia links to navigate
   - Watch competitors' moves in real-time
   - Avoid dead pages (marked in red)
   - Be careful with occupied pages (marked in yellow)
   - Reach the target first to win

4. **View Results**
   - Rankings based on finish time and click count
   - See everyone's paths by hovering over player cards

## 🛠️ Development

### Available Scripts

**Root:**
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both projects
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend

**Backend:**
- `npm run dev` - Start development server with watch mode
- `npm run build` - Compile TypeScript
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

**Frontend:**
- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 API Documentation

### REST Endpoints

- `POST /api/lobbies` - Create new lobby
- `POST /api/lobbies/:code/join` - Join existing lobby
- `GET /api/lobbies/:code` - Get lobby info
- `GET /api/articles/:title` - Get Wikipedia article
- `GET /api/lobbies/:lobbyId/state` - Get game state
- `GET /api/health` - Health check

### WebSocket Events

**Client → Server:**
- `join_lobby` - Join lobby for real-time updates
- `start_game` - Start the game (host only)
- `move` - Make a move
- `leave_lobby` - Leave lobby

**Server → Client:**
- `game_state` - Full game state update
- `game_started` - Game has started
- `player_joined` - Player joined lobby
- `player_left` - Player left lobby
- `move_failed` - Move was invalid
- `player_finished` - Player reached target
- `game_ended` - Game ended
- `error` - Error occurred

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Wikipedia API for article data
- All the Wikipedia contributors who make this possible

---

**Built with ❤️ by the Wiki Race team**
