
<div align="center">

<img src="./public/collabryx.svg" width="72" alt="Collabryx Logo" />

Collabryx
Real-time. Anonymous. Collaborative.

<p align="center">
    
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-v1.0.0-blue)
![Contributions](https://img.shields.io/badge/Contributions-Welcome-orange)
![Made With](https://img.shields.io/badge/Made%20With-WebSockets-purple)
![Realtime](https://img.shields.io/badge/Realtime-Collaboration-ff69b4)
![Anonymous](https://img.shields.io/badge/Anonymous-No%20Login-blueviolet)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success)
<img src="https://img.shields.io/badge/WebSockets-Realtime-8b5cf6?style=flat-square" alt="WebSockets" />
<img src="https://img.shields.io/badge/Contributions-Welcome-f59e0b?style=flat-square" alt="Contributions Welcome" />

</p>



</div>

# <img src="./public/collabryx.svg" width="25" /> Collabryx

Collabryx is a real-time, anonymous digital whiteboard built for teams who want to brainstorm and collaborate instantly. No logins, no friction just create a board, share the link, and start drawing.

Whether you're sketching out a quick idea, building a flowchart, or just chatting with teammates on a shared canvas, Collabryx keeps everything in sync across everyone's screen with zero lag.

---

## 🔗 Live Test
**Website is Live! Test here and enjoy:**
👉 [**https://collabryx-frontend.onrender.com**](https://collabryx-frontend.onrender.com)

---

## 📸 Preview

### Light Theme
![Collabryx Light Theme](./public/Snapshots%20and%20Project%20Demonstration/Screenshot%202026-04-28%20173751.png)

### Dark Theme
![Collabryx Dark Theme](./public/Snapshots%20and%20Project%20Demonstration/Screenshot%202026-04-28%20173901.png)

![Collabryx Project Overview](./public/Project%20Overview%20(1).png)

---

## ✨ Key Features

- **Instant Collaboration**: Jump straight into a board without signing up.
- **Real-time Sync**: Sub-50ms latency for drawing, moving elements, and cursors.
- **Live Multiplayer**: See exactly where your team is working with live cursor tracking.
- **Integrated Chat**: Communicate directly on the canvas with your collaborators.
- **High-Quality Export**: Save your work as a high-resolution **.PNG** or backup the raw data as a **.JSON** file.
- **Ephemeral Boards**: For maximum privacy, boards and their data are automatically deleted once the last user leaves.
- **Dynamic UI**: Beautiful dark/light mode with a professional glassmorphism design.

---

## 🛠️ The Tech Stack

- **Frontend**: React.js, Konva (for the canvas), Zustand (state management), Framer Motion.
- **Backend**: Node.js, Express.
- **Real-time**: Socket.io.
- **Database**: MongoDB Atlas.
- **Icons**: Lucide React.

---

## 📁 Project Structure

```text
Collabryx/
├── server/                   # Node.js + Express Backend
│   ├── src/
│   │   ├── models/           # Mongoose schemas (Board, Element, Session)
│   │   ├── routes/           # REST API for board management & exports
│   │   ├── socket/           # Real-time orchestration logic (Socket.io)
│   │   └── jobs/             # Cleanup workers for ephemeral boards
│   └── .env                  # Backend configuration
├── src/                      # React + TypeScript Frontend
│   ├── components/
│   │   ├── board/            # Canvas engine, Toolbar, and Sidebar modules
│   │   ├── layout/           # Shared layout & navigation components
│   │   └── ui/               # Reusable atoms (Buttons, Modals, Glows)
│   ├── services/             # API clients & WebSocket handlers
│   ├── stores/               # Global state management (Zustand)
│   ├── lib/                  # Style utilities & technical helpers
│   └── pages/                # Main app routes (Landing, Dashboard, Board)
├── public/                   # Snapshots, icons, and static assets
├── Deployment.md             # Full setup & hosting instructions
└── System_Overview.md        # High-level architecture deep-dive
```

---

## 🚀 Getting Started Locally

### 1. Clone & Install
Extract the project files and open your terminal:

**Install Frontend:**
```bash
npm install
```

**Install Backend:**
```bash
cd server
npm install
cd ..
```

### 2. Set up Database
You can use a **local MongoDB** instance for development or **MongoDB Atlas** for cloud storage.

- **Local**: Use `mongodb://localhost:27017/collabryx` in your `.env`.
- **Atlas (Production)**:
    1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
    2. Allow access from "Anywhere" (IP `0.0.0.0/0`) in Network Access.
    3. Create a database user and copy your connection string.

### 3. Environment Variables
Create a `.env` file inside the `server` folder:
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

### 4. Run the App
Open two terminals:

- **Terminal 1 (Backend):** `cd server && npm start`
- **Terminal 2 (Frontend):** `npm run dev`

Open `http://localhost:5173` and you're ready to go!

---

## 🌐 Deployment

For a comprehensive, step-by-step guide on how to host Collabryx in the cloud, please refer to our **[Detailed Deployment Guide](./Deployment.md)**.

### Backend (Render)
1. Push your code to GitHub.
2. Create a new "Web Service" on Render.
3. Set root directory to `server`.
4. Build command: `npm install`.
5. Start command: `node src/index.js`.
6. Add your `.env` variables in the settings.

### Frontend (Render)
1. Create a new **Static Site** on Render.
2. Select your GitHub repository.
3. **Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. **Environment Variable**: Add `VITE_API_URL` pointing to your Render backend URL.
5. **CRITICAL (Fix 404s)**: 
   - Go to **Redirects/Rewrites** in the Render sidebar.
   - Add: Source: `/*`, Destination: `/index.html`, Action: `Rewrite`.
6. Click Deploy!

---

## 🔧 Common Issues

- **"CORS Error"**: Make sure the `CLIENT_URL` in your backend `.env` matches your frontend URL exactly (no trailing slash!).
- **"Database Timeout"**: Double-check that you allowed "Access from Anywhere" in your MongoDB Network settings.
- **"Blurry Export"**: We use 2x scaling, so make sure your browser zoom is set to 100% for the best quality.

---

## 🔮 Future Scope

- **AI-Powered Shapes**: Turn rough sketches into perfect diagrams automatically.
- **Voice Channels**: Built-in voice chat for even faster collaboration.
- **Version History**: A way to see who changed what and when.
- **Mobile Apps**: Dedicated touch-friendly apps for iPad and tablets.

---

## ⚖️ License

This project is for **educational purposes only**. It is a custom-built technical showcase and is not intended for commercial or public personal use. Please see the [LICENSE](LICENSE) file for more details.

---

Made with ❤️ for creative teams. Happy collaborating!
