# Build Prompt: Production Version of "Wiki Race"

You are GitHub Copilot acting as a senior full-stack engineer, product architect, and game systems designer.

Build the production version of an in-browser multiplayer web game called **Wiki Race**.

Wiki Race is a desktop-first, real-time competitive Wikipedia navigation game. It is similar to the classic Wiki Game, where players race from one Wikipedia article to another using only links inside article pages. The key multiplayer mechanic is that visited pages become blocked for other players.

The app should be production-minded, free-tier friendly, and deployable using:

- Frontend: Vercel
- Backend: Railway
- Database: Neon Postgres
- Realtime: WebSockets from the Railway backend
- Language: TypeScript preferred across the stack
- Frontend framework: Next.js with React
- Styling: Tailwind CSS
- Database ORM/query layer: Prisma or Drizzle, choose whichever is best for this build
- Data source: Hybrid Wikipedia strategy using live Wikipedia API plus cached article metadata and article links in Postgres

Prioritize a working production MVP over excessive abstraction.

---

## Product Summary

Wiki Race is a private friends-lobby multiplayer game.

A host creates a lobby, shares a join link with friends, and starts a race. All players receive the same starting Wikipedia article and the same target article.

Players navigate from the start page to the target page by clicking article links. Search is disabled. Manual URL entry is disabled. External links are not valid moves.

The twist:

> A page is safe for the player currently occupying it. Once that player leaves the page, the page becomes globally dead and unavailable to all players.

This creates real-time route denial. Players can race, block paths, and react to opponent movement.

---

## Core Game Mode: Private Friends Lobby

### Lobby Requirements

Implement private lobbies first.

A user should be able to:

1. Create a lobby.
2. Receive a short invite URL.
3. Join a lobby by invite URL.
4. Enter a display name.
5. See all joined players before the race starts.
6. Host can start the race.
7. Host can optionally configure:
   - Start article
   - Target article
   - Time limit
   - Max players
8. If no start or target is selected, the system generates a reasonable pair.

No full authentication is required for MVP. Use anonymous session IDs stored in cookies/local storage.

---

## Game Rules

### Movement

Players begin on the same Start Article.

Players may only move by clicking valid internal Wikipedia article links rendered in the game UI.

Allowed:

- Article namespace pages only
- Internal Wikipedia article links
- Normalized article titles

Disallowed:

- Search box
- Browser address bar navigation
- External links
- Wikipedia category pages
- Help pages
- File pages
- Talk pages
- Special pages
- Disambiguation pages if detectable
- Opening links in a new tab
- Browser back navigation as a game action

All moves must be validated server-side.

---

## Dead Page Rule

Implement this rule exactly:

1. When a player is currently on a page, that page is occupied by that player.
2. While occupied, that page is unavailable to other players.
3. When the player leaves that page, it becomes globally dead.
4. Dead pages cannot be entered by any player for the rest of the match.
5. The Start Article should be treated as a special page:
   - All players may initially occupy it.
   - After leaving it, players cannot return to it.
6. The Target Article should always remain enterable if reached through a valid move.
7. If two players attempt to enter the same page at nearly the same time, the server resolves by timestamp/order received. Only the first valid move succeeds.

If a player attempts to move to a blocked or dead page, reject the move and return a clear client message:
"That page is dead."

---

## Win Conditions

A player wins when they reach the target article through a valid move.

Rank players by:

1. Finish status
2. Finish time
3. Click count
4. Earliest join order as final tiebreaker

The match ends when:

- All active players finish
- Time limit expires
- Host ends the match

---

## Player Visibility

Each player should see:

### Main View

- Current Wikipedia article content
- Clickable valid internal article links
- Current article title
- Target article title
- Click count
- Timer
- Own navigation history

### Competitor Panel

Show each competitor in real time:

- Display name
- Current page
- Click count
- Finished / active / disconnected status
- Current rank if available

On mouseover or hover over a competitor, show a tooltip with that player’s full path so far.

Example tooltip:

```text
Brandon's path:
Peanut butter
Food
United States
NASA
Apollo 11