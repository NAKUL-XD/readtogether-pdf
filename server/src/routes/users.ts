import { Router } from 'express'
import { z } from 'zod'
import { validate } from '@/middleware'
import { createGuestUser } from '@/controllers'

const router = Router()

const createGuestSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(50),
    color: z.string(),
    avatar: z.string().optional(),
  }),
})

router.post('/guest', validate(createGuestSchema), createGuestUser)

export default router
