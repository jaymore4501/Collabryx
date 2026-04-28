import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import mongoose from 'mongoose'
import boardRoutes from './routes/board.js'
import { setupSocket } from './socket/handler.js'
import { startCleanupWorker } from './jobs/cleanup.js'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
  },
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/board', boardRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Socket.io
setupSocket(io)

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3001
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/collabryx'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[Collabryx] Connected to MongoDB')
    httpServer.listen(PORT, () => {
      console.log(`[Collabryx] Server running on port ${PORT}`)
    })
    startCleanupWorker()
  })
  .catch((err) => {
    console.error('[Collabryx] MongoDB connection error:', err)
    process.exit(1)
  })
