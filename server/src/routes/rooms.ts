import { Router } from 'express'
import { createRoom, getRoom, getRoomByCode, getUserRooms, updateRoomSettings, leaveRoom } from '@/controllers'
import { authenticate, optionalAuth } from '@/middleware'
import { z } from 'zod'
import { validate } from '@/middleware'

const router = Router()

const createRoomSchema = z.object({
  body: z.object({
    bookId: z.string(),
    name: z.string().max(100).optional(),
  }),
})

const updateSettingsSchema = z.object({
  params: z.object({
    roomId: z.string(),
  }),
  body: z.object({
    settings: z.object({
      controlMode: z.enum(['shared', 'host']).optional(),
      readingMode: z.enum(['light', 'dark', 'sepia']).optional(),
      showThumbnails: z.boolean().optional(),
      enableChat: z.boolean().optional(),
      soundEffects: z.boolean().optional(),
      pageAnimation: z.boolean().optional(),
    }),
  }),
})

router.post('/', authenticate, validate(createRoomSchema), createRoom)
router.get('/my', authenticate, getUserRooms)
router.get('/:roomId', getRoom)
router.get('/code/:roomCode', getRoomByCode)
router.patch('/:roomId/settings', authenticate, validate(updateSettingsSchema), updateRoomSettings)
router.post('/:roomId/leave', authenticate, leaveRoom)

export default router