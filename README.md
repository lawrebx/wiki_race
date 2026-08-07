# Wiki Race

A real-time multiplayer Wikipedia racing game where every click changes the map.

Wiki Race challenges players to navigate from one Wikipedia article to another using only links found within articles. Unlike traditional Wiki Game variants, players compete simultaneously in a shared lobby where visited pages become unavailable to everyone else.

The result is a fast-paced mix of pathfinding, strategy, and sabotage.

## How It Works

1. All players start on the same Wikipedia article.
2. Everyone is trying to reach the same target article.
3. Players may only move by clicking valid Wikipedia article links.
4. A page can only be occupied by one player at a time.
5. Once a player leaves a page, that page becomes permanently **dead** for the remainder of the match.
6. Dead pages can never be visited again.
7. The first player to reach the target wins.

Every move permanently reshapes the navigation graph, forcing players to adapt as opponents eliminate routes in real time.

## Features

- 🎯 Daily and private-race Wikipedia challenges
- 👥 Real-time multiplayer friends lobbies
- ☠️ Shared "dead page" territory control mechanic
- 📡 Live competitor tracking
- 🗺️ Hoverable path history for all players
- 🏆 Race rankings and match results
- ⚡ WebSocket-powered gameplay
- 📚 Wikipedia API integration with intelligent caching
- 🛡️ Server-authoritative move validation and anti-cheat protections

## Example

**Start:** Peanut Butter  
**Target:** Apollo 11

Alice navigates through:

```text
Peanut Butter
→ Food
→ United States
→ NASA
→ Apollo 11
