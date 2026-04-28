# Collabryx — Project Walkthrough

## ✅ Status: Running & Verified

Both servers start cleanly, TypeScript compiles with 0 errors, and all API endpoints return correct responses.

## How to Run

```bash
# Terminal 1 — Backend (Express + Socket.io + MongoDB)
cd server
npm install
npm run dev          # → http://localhost:3001

# Terminal 2 — Frontend (Vite + React + TypeScript)
# (Run from the project root)
npm install
npm run dev          # → http://localhost:5173
```

> [!IMPORTANT]
> **Database Configuration**:
> - **Development**: You can use a local MongoDB instance (defaulting to `mongodb://localhost:27017/collabryx`) or MongoDB Atlas.
> - **Production**: MongoDB Atlas is required for persistent cloud storage.
> Update `server/.env` with your preferred `MONGO_URI`.

## Project Structure

```
Collabryx/
├── index.html                    # Entry HTML with Inter font, SEO meta
├── vite.config.ts                # Vite + Tailwind v4 + proxy to backend
├── tsconfig.json                 # TS strict mode, path aliases
├── package.json                  # Frontend dependencies
│
├── public/
│   └── collabryx.svg             # Favicon
│
├── src/
│   ├── main.tsx                  # React entry with BrowserRouter
│   ├── App.tsx                   # Routes + Toaster
│   ├── index.css                 # Design system (Tailwind v4 themes)
│   │
│   ├── types/index.ts            # All TypeScript interfaces
│   ├── lib/utils.ts              # cn(), ID/username/color generators
│   │
│   ├── stores/
│   │   ├── themeStore.ts         # Light/Dark/System theme (Zustand)
│   │   └── boardStore.ts         # Canvas state, elements, history
│   │
│   ├── services/
│   │   ├── api.ts                # REST API client
│   │   └── socket.ts             # Socket.io service class
│   │
│   ├── components/
│   │   ├── layout/Navbar.tsx     # Glassmorphism navbar
│   │   ├── ui/ThemeToggle.tsx    # Animated theme cycler
│   │   └── board/
│   │       ├── BoardNavbar.tsx   # Board toolbar + user avatars
│   │       ├── ToolSidebar.tsx   # Drawing tools + color palette
│   │       ├── CanvasArea.tsx    # Konva.js canvas engine
│   │       └── RightSidebar.tsx  # Activity, metrics, settings
│   │
│   └── pages/
│       ├── LandingPage.tsx       # Hero, features, FAQ, footer
│       ├── DashboardPage.tsx     # Create/join boards
│       └── BoardPage.tsx         # 3-column workspace
│
└── server/
    ├── package.json
    ├── .env
    └── src/
        ├── index.js              # Express + Socket.io + MongoDB
        ├── models/index.js       # Board, Element, Session schemas
        ├── routes/board.js       # REST API (CRUD + export)
        ├── socket/handler.js     # Real-time event handling
        └── jobs/cleanup.js       # Stale board cleanup worker
```

## Architecture Summary
Collabryx uses a modern **Client-Server-DB** architecture optimized for low-latency collaboration.
- **Client**: React provides the UI, while Konva.js handles the high-performance canvas rendering. State is managed globally via Zustand.
- **Server**: Node.js and Express handle the REST API, while Socket.io manages bidirectional real-time communication (rooms, events, presence).
- **Database**: MongoDB Atlas stores board data and active user sessions. A background worker periodically cleans up stale data.

## Features Implemented

### Frontend
| Feature | Status |
|---------|--------|
| Landing page (hero, features, FAQ, footer) | ✅ |
| Dashboard (create/join boards) | ✅ |
| Board workspace (3-column layout) | ✅ |
| Theme engine (light/dark/system + localStorage) | ✅ |
| Konva.js canvas with all drawing tools | ✅ |
| Tool sidebar with shortcuts & tooltips | ✅ |
| Right sidebar (activity, metrics, users, settings) | ✅ |
| Framer Motion animations throughout | ✅ |
| Glassmorphism navbar | ✅ |
| Shiny text effect | ✅ |
| Border glow effect | ✅ |
| Dot grid backgrounds | ✅ |
| Skeleton/loading states | ✅ |
| Keyboard shortcuts (Del, Ctrl+Z/Y/V/A, tool keys) | ✅ |
| Zoom/pan canvas | ✅ |
| Undo/redo history | ✅ |

### Backend
| Feature | Status |
|---------|--------|
| Board CRUD API | ✅ |
| Socket.io room management | ✅ |
| Real-time element sync | ✅ |
| Cursor sync (volatile emit) | ✅ |
| Presence tracking | ✅ |
| Activity feed events | ✅ |
| Heartbeat system (10s interval) | ✅ |
| Auto-cleanup on last user leave | ✅ |
| Stale board cleanup worker (2min threshold) | ✅ |
| JSON Export (Raw data backup) | ✅ |
| PNG Export (High-quality image) | ✅ |
| Anonymous user generation | ✅ |

### Design System
| Element | Implementation |
|---------|---------------|
| Colors | Indigo accent (#6366F1), dual theme tokens |
| Typography | Inter (sans), JetBrains Mono (mono) |
| Cards | Glassmorphism + shadow hierarchy |
| Buttons | Glow hover, lift transform |
| Transitions | 400ms spring easing |
| Scrollbar | Custom styled |
| Selection | Accent-colored |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/board/create` | Create new board |
| GET | `/api/board/:id` | Fetch board + elements |
| DELETE | `/api/board/:id` | Delete board |
| GET | `/api/board/:id/export/json` | Export raw board data as .json file |
| (Client) | - | Export high-quality canvas as .png file |
| POST | `/api/board/save` | Save board state |
| GET | `/api/health` | Health check |

## WebSocket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `JOIN_BOARD` | Client → Server | Join board room |
| `LEAVE_BOARD` | Client → Server | Leave board room |
| `CURSOR_MOVE` | Client → Server | Send cursor position |
| `ADD_ELEMENT` | Bidirectional | Add canvas element |
| `UPDATE_ELEMENT` | Bidirectional | Update element props |
| `DELETE_ELEMENT` | Bidirectional | Remove element |
| `CLEAR_BOARD` | Bidirectional | Clear all elements |
| `HEARTBEAT` | Client → Server | Keep session alive |
| `BOARD_STATE` | Server → Client | Initial board state |
| `BOARD_DELETED` | Server → Client | Board was deleted |
| `PRESENCE_UPDATE` | Server → Client | Active users list |
| `CURSORS_UPDATE` | Server → Client | All cursor positions |
| `ACTIVITY_EVENT` | Bidirectional | Activity feed events |

## Board Lifecycle Summary
1. **Created**: A user initializes a board from the dashboard.
2. **Active**: The first user joins, creating a real-time room.
3. **Collaboration**: Multiple users interact simultaneously via WebSockets.
4. **Cleanup**: When the last user leaves or their heartbeat stops for 2 minutes, the backend automatically purges all board data (elements, sessions, and the board record) to ensure privacy and efficiency.
