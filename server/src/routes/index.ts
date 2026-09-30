import { Router } from 'express'
import bookRoutes from './books'
import roomRoutes from './rooms'
import chatRoutes from './chat'
import storageRoutes from './storage'
import userRoutes from './users'

const router = Router()

router.use('/books', bookRoutes)
router.use('/rooms', roomRoutes)
router.use('/chat', chatRoutes)
router.use('/storage', storageRoutes)
router.use('/users', userRoutes)

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router