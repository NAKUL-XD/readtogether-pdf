import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { Room, Book } from '@/models'
import { RoomService } from '@/services'
import { AppError } from '@/middleware'
import { AuthRequest } from '@/middleware'

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookId, name } = req.body

    if (!req.userId) {
      throw new AppError('User authentication required', 401)
    }

    if (!bookId || !Types.ObjectId.isValid(bookId)) {
      throw new AppError('Valid book ID required', 400)
    }

    const book = await Book.findById(bookId)
    if (!book) {
      throw new AppError('Book not found', 404)
    }

    const room = await RoomService.createRoom({
      bookId: new Types.ObjectId(bookId),
      hostId: new Types.ObjectId(req.userId),
      name: name || book.title,
    })

    res.status(201).json({
      room: {
        id: room._id,
        roomCode: room.roomCode,
        name: room.name,
        bookId: room.bookId,
        hostId: room.hostId,
        controlMode: room.controlMode,
        lastPage: room.lastPage,
        settings: room.settings,
        createdAt: room.createdAt,
      },
      book: {
        id: book._id,
        title: book.title,
        fileUrl: book.fileUrl,
        fileSize: book.fileSize,
        totalPages: book.totalPages,
        thumbnailUrl: book.thumbnailUrl,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    const room = await RoomService.getRoomById(new Types.ObjectId(roomId))
    if (!room) {
      throw new AppError('Room not found', 404)
    }

    // Get the book details
    const book = await Book.findById(room.bookId)
    if (!book) {
      throw new AppError('Book not found', 404)
    }

    res.json({
      room: {
        id: room._id,
        roomCode: room.roomCode,
        name: room.name,
        bookId: room.bookId,
        hostId: room.hostId,
        participants: room.participants,
        controlMode: room.controlMode,
        lastPage: room.lastPage,
        settings: room.settings,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
      book: {
        id: book._id,
        title: book.title,
        fileUrl: book.fileUrl,
        fileSize: book.fileSize,
        totalPages: book.totalPages,
        thumbnailUrl: book.thumbnailUrl,
        uploadedBy: book.uploadedBy,
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getRoomByCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomCode } = req.params

    const room = await RoomService.getRoomByCode(roomCode.toUpperCase())
    if (!room) {
      throw new AppError('Room not found', 404)
    }

    // Get the book details
    const book = await Book.findById(room.bookId)
    if (!book) {
      throw new AppError('Book not found', 404)
    }

    res.json({
      room: {
        id: room._id,
        roomCode: room.roomCode,
        name: room.name,
        bookId: room.bookId,
        hostId: room.hostId,
        participants: room.participants,
        controlMode: room.controlMode,
        lastPage: room.lastPage,
        settings: room.settings,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      },
      book: {
        id: book._id,
        title: book.title,
        fileUrl: book.fileUrl,
        fileSize: book.fileSize,
        totalPages: book.totalPages,
        thumbnailUrl: book.thumbnailUrl,
        uploadedBy: book.uploadedBy,
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getUserRooms = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rooms = await RoomService.getUserRooms(new Types.ObjectId(req.userId!))
    res.json({ rooms })
  } catch (error) {
    next(error)
  }
}

export const updateRoomSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params
    const { settings } = req.body

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    const room = await Room.findById(roomId)
    if (!room) {
      throw new AppError('Room not found', 404)
    }

    if (room.hostId.toString() !== req.userId) {
      throw new AppError('Not authorized', 403)
    }

    const updatedRoom = await RoomService.updateSettings(
      new Types.ObjectId(roomId),
      new Types.ObjectId(req.userId!),
      settings
    )

    res.json({ room: updatedRoom })
  } catch (error) {
    next(error)
  }
}

export const leaveRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params

    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError('Invalid room ID', 400)
    }

    await RoomService.leaveRoom(new Types.ObjectId(roomId), new Types.ObjectId(req.userId!))
    res.json({ message: 'Left room' })
  } catch (error) {
    next(error)
  }
}