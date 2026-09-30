import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { ChatMessage, Bookmark, Reaction } from '@/models'
import { RoomService } from '@/services'
import { AppError } from '@/middleware'
import { AuthRequest } from '@/middleware'

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params
    const limit = parseInt(req.query.limit as string) || 50

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    const messages = await RoomService.getMessages(new Types.ObjectId(roomId), limit)
    res.json({ messages: messages.reverse() })
  } catch (error) {
    next(error)
  }
}

export const getBookmarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    const bookmarks = await RoomService.getBookmarks(new Types.ObjectId(roomId))
    res.json({ bookmarks })
  } catch (error) {
    next(error)
  }
}

export const addBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params
    const { pageNumber, label, isShared } = req.body

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    if (!pageNumber || pageNumber < 1) {
      throw new AppError('Valid page number required', 400)
    }

    const bookmark = await RoomService.addBookmark(
      new Types.ObjectId(roomId),
      new Types.ObjectId(req.userId!),
      pageNumber,
      label,
      isShared
    )

    res.status(201).json({ bookmark })
  } catch (error) {
    next(error)
  }
}

export const removeBookmark = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId, bookmarkId } = req.params

    if (!Types.ObjectId.isValid(roomId) || !Types.ObjectId.isValid(bookmarkId)) {
      throw new AppError('Invalid ID', 400)
    }

    await RoomService.removeBookmark(new Types.ObjectId(bookmarkId), new Types.ObjectId(req.userId!))
    res.json({ message: 'Bookmark removed' })
  } catch (error) {
    next(error)
  }
}

export const addReaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params
    const { type } = req.body

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    const validTypes = ['heart', 'laugh', 'thumbsUp', 'fire', 'book']
    if (!validTypes.includes(type)) {
      throw new AppError('Invalid reaction type', 400)
    }

    const reaction = await RoomService.saveReaction(
      new Types.ObjectId(roomId),
      new Types.ObjectId(req.userId!),
      req.user!.displayName,
      req.user!.avatar,
      req.user!.color,
      type
    )

    res.status(201).json({ reaction })
  } catch (error) {
    next(error)
  }
}