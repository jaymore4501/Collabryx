# 🚀 Collabryx — Deployment & Setup Guide

This guide will help you get Collabryx up and running, whether you're working on your local machine or deploying it to the cloud for live collaboration.

---

## 💻 Part 1: Local Setup (Run on your PC)

Follow these steps sequentially to run the project locally.

### 1. Prerequisites
Make sure you have **Node.js** installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).

### 2. Extract & Open
1.  Extract the `Collabryx.zip` file to a folder on your PC.
2.  Open that folder in **VS Code** (or your preferred editor).
3.  Open a new **Terminal** in your editor.

### 3. Install Dependencies
You need to install packages for both the frontend and the backend.

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 4. Setup Database
You can use a **local MongoDB** (if installed) or **MongoDB Atlas** (Cloud).

- **Local**: Ensure MongoDB is running on your PC (port 27017).
- **Cloud**: Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), create a user, and allow IP access from anywhere.

### 5. Environment Variables (.env)
Create a file named `.env` inside the `server/` folder and paste the following:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/collabryx
CLIENT_URL=http://localhost:5173
```
*(If using Atlas, replace the `MONGO_URI` with your connection string).*

### 6. Run the Project
You will need **two terminal windows** open.

**Terminal 1 (Run Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Run Frontend):**
```bash
npm run dev
```

Now open `http://localhost:5173` in your browser. You're live locally!

---

## 🌐 Part 2: Go Live! (Cloud Deployment)

Follow these steps to host your project online for free.

### 1. Push to GitHub
Before deploying, your code needs to be on GitHub.
1.  Create a **New Repository** on [GitHub](https://github.com/new).
2.  In your project root terminal, run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git remote add origin https://github.com/your-username/your-repo-name.git
    git branch -M main
    git push -u origin main
    ```

### 2. Host Backend on Render
1.  Login to [Render.com](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configure**:
    - **Name**: `collabryx-backend`
    - **Root Directory**: `server`
    - **Build Command**: `npm install`
    - **Start Command**: `node src/index.js`
5.  **Environment Variables**:
    - `PORT`: `10000`
    - `MONGO_URI`: (Your Atlas connection string)
    - `CLIENT_URL`: (Wait for your Vercel URL below)

### 3. Host Frontend on Vercel
1.  Login to [Vercel.com](https://vercel.com/).
2.  Click **Add New** -> **Project** and import your GitHub repo.
3.  **Environment Variables**:
    - `VITE_API_URL`: (Paste your Render URL here)
4.  Click **Deploy**.

### 4. Final Connection
1.  Copy your new **Vercel URL** (e.g., `https://collabryx.vercel.app`).
2.  Go back to **Render** -> **Environment Variables** and update `CLIENT_URL` with this Vercel link.
3.  Save and wait for the backend to redeploy.

---

## ✅ Testing the Deployment
1.  Visit your **Vercel URL**.
2.  Create a new board.
3.  Share the link with a friend.
4.  Draw something—if it appears on both screens, you've successfully deployed Collabryx! 🎉
