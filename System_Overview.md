# 🏛️ Collabryx — System Architecture

This document outlines the high-level design and architectural decisions behind Collabryx.

![Collabryx Technical Architecture](./public/Project%20Overview%20(2).png)

## 1. High-Level Design
Collabryx follows a **Client-Server-Database** architecture optimized for high-frequency real-time updates.

- **The Frontend** is a thick client responsible for rendering the canvas and managing local state.
- **The Backend** acts as a real-time orchestrator, routing events between users and maintaining the temporary state in the database.
- **The Database** stores the active boards and their elements until the session ends.

## 2. Technical Stack

| Layer | Technology | Role |
|-------|------------|------|
| **UI Layer** | React.js | Component-based interface management. |
| **Canvas Engine** | Konva.js | High-performance 2D drawing and element manipulation. |
| **State Management** | Zustand | Global store for elements, user presence, and settings. |
| **Real-time Communication** | Socket.io | Bidirectional event-based communication. |
| **Backend API** | Node.js / Express | REST endpoints for board management. |
| **Data Persistence** | MongoDB Atlas | Cloud document store for active board states. |

## 3. Communication Patterns
### 3.1 REST API
Used for non-real-time operations like:
- Creating a new board.
- Fetching initial board data when joining.
- Exporting data to JSON.

### 3.2 WebSockets (Socket.io)
The "Heart" of the app. Handles all live interaction:
- **Presence**: Joining/leaving rooms.
- **Mutations**: Moving, adding, or deleting shapes.
- **Interaction**: Live cursor tracking and chat messages.

## 4. Security & Isolation
- **Room Isolation**: Each board ID corresponds to a unique Socket.io "Room." Data never leaks between different boards.
- **Input Sanitization**: All user-generated text (chat, element text) is sanitized to prevent XSS.
- **Rate Limiting**: Socket events are throttled to prevent server overload from spam or scripts.

## 5. Scalability Strategy
- **Stateless Backend**: The Node.js server does not store long-term session data in memory. This allows us to scale horizontally (adding more servers) by using a Redis adapter for Socket.io.
- **Ephemeral Storage**: By purging data after sessions end, we keep the database lean and performant.

---

For internal logic details, see the **[Project Walkthrough](./project_walkthrough.md)**.
