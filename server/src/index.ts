import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'

import { config } from '@/config'
import { setupSocketHandlers } from '@/sockets'
import routes from '@/routes'
import { errorHandler, notFoundHandler } from '@/middleware'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

app.use('/api', routes)

app.use(notFoundHandler)
app.use(errorHandler)

setupSocketHandlers(io)

async function startServer(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri)
    console.log('[DB] Connected to MongoDB')

    httpServer.listen(config.port, () => {
      console.log(`[Server] Running on port ${config.port}`)
      console.log(`[Server] Environment: ${config.nodeEnv}`)
      console.log(`[Socket] Socket.IO server ready`)
    })
  } catch (error) {
    console.error('[Server] Failed to start:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, shutting down gracefully')
  httpServer.close(() => {
    console.log('[Server] HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('[DB] MongoDB connection closed')
      process.exit(0)
    })
  })
})

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, shutting down gracefully')
  httpServer.close(() => {
    console.log('[Server] HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('[DB] MongoDB connection closed')
      process.exit(0)
    })
  })
})

startServer()