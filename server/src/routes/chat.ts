import { Router } from 'express'
import { getMessages, getBookmarks, addBookmark, removeBookmark, addReaction } from '@/controllers'
import { authenticate } from '@/middleware'
import { z } from 'zod'
import { validate } from '@/middleware'

const router = Router()

const addBookmarkSchema = z.object({
  params: z.object({
    roomId: z.string(),
  }),
  body: z.object({
    pageNumber: z.number().int().positive(),
    label: z.string().max(100).optional(),
    isShared: z.boolean().default(false),
  }),
})

const addReactionSchema = z.object({
  params: z.object({
    roomId: z.string(),
  }),
  body: z.object({
    type: z.enum(['heart', 'laugh', 'thumbsUp', 'fire', 'book']),
  }),
})

router.get('/:roomId/messages', getMessages)
router.get('/:roomId/bookmarks', getBookmarks)
router.post('/:roomId/bookmarks', authenticate, validate(addBookmarkSchema), addBookmark)
router.delete('/:roomId/bookmarks/:bookmarkId', authenticate, removeBookmark)
router.post('/:roomId/reactions', authenticate, validate(addReactionSchema), addReaction)

export default router