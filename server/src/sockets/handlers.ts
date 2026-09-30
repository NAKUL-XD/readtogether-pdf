import { Server, Socket } from 'socket.io'
import { Types } from 'mongoose'
import { RoomService } from '@/services'
import { Room, ChatMessage, Bookmark, Reaction, Annotation } from '@/models'
import { IParticipant } from '@/models/Room'

interface AuthenticatedSocket extends Socket {
  userId?: string
  roomId?: string
  userData?: {
    displayName: string
    avatar?: string
    color: string
  }
}

const userSockets = new Map<string, Set<string>>()

export function setupSocketHandlers(io: Server): void {
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token
    const userId = socket.handshake.auth.userId
    const displayName = socket.handshake.auth.displayName
    const avatar = socket.handshake.auth.avatar
    const color = socket.handshake.auth.color

    if (!userId || !displayName) {
      return next(new Error('Authentication required'))
    }

    socket.userId = userId
    socket.userData = { displayName, avatar, color }
    next()
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('[Socket] Client connected:', socket.id, 'User:', socket.userId)

    if (!userSockets.has(socket.userId!)) {
      userSockets.set(socket.userId!, new Set())
    }
    userSockets.get(socket.userId!)!.add(socket.id)

    socket.on('join_room', async (data: { roomId: string }) => {
      try {
        const { roomId } = data
        const userId = socket.userId!

        if (!Types.ObjectId.isValid(roomId)) {
          socket.emit('error', { code: 'INVALID_ROOM', message: 'Invalid room ID' })
          return
        }

        const room = await RoomService.joinRoom({
          roomId: new Types.ObjectId(roomId),
          userId: new Types.ObjectId(userId),
          displayName: socket.userData!.displayName,
          avatar: socket.userData!.avatar,
          color: socket.userData!.color,
        })

        socket.join(roomId)
        socket.roomId = roomId

        const messages = await RoomService.getMessages(new Types.ObjectId(roomId))
        const bookmarks = await RoomService.getBookmarks(new Types.ObjectId(roomId))
        const annotations = await Annotation.find({ roomId: new Types.ObjectId(roomId) }).sort({ createdAt: 1 })

        // Get the book data
        const book = await Room.findById(roomId).populate('bookId')
        const bookData = book?.bookId as any

        const roomData = {
          id: room.room._id.toString(),
          roomCode: room.room.roomCode,
          name: room.room.name,
          bookId: room.room.bookId,
          hostId: room.room.hostId,
          participants: room.room.participants,
          controlMode: room.room.controlMode,
          lastPage: room.room.lastPage,
          settings: room.room.settings,
          createdAt: room.room.createdAt,
          updatedAt: room.room.updatedAt,
        }

        console.log('[Socket] Sending room_state with roomId:', roomData.id)

        // Send existing annotations to the newly joined user
        annotations.forEach((ann) => {
          socket.emit('annotation_added', {
            id: ann._id.toString(),
            roomId: ann.roomId.toString(),
            userId: ann.userId.toString(),
            displayName: ann.displayName,
            color: ann.color,
            pageNumber: ann.pageNumber,
            type: ann.type,
            points: ann.points,
            strokeWidth: ann.strokeWidth,
            createdAt: ann.createdAt,
          })
        })

        socket.emit('room_state', {
          room: roomData,
          book: bookData ? {
            id: bookData._id,
            title: bookData.title,
            fileUrl: bookData.fileUrl,
            fileSize: bookData.fileSize,
            totalPages: bookData.totalPages,
            thumbnailUrl: bookData.thumbnailUrl,
            uploadedBy: bookData.uploadedBy,
          } : null,
          currentUser: room.participant,
          messages: messages.reverse(),
          bookmarks,
        })

        socket.to(roomId).emit('user_joined', {
          participant: room.participant,
        })

        console.log('[Socket] User joined room:', socket.userData?.displayName, roomId)
      } catch (error: any) {
        console.error('[Socket] Join room error:', error)
        socket.emit('error', { code: 'JOIN_FAILED', message: error.message })
      }
    })

    socket.on('leave_room', async (data: { roomId: string }) => {
      await handleLeaveRoom(socket, data.roomId)
    })

    socket.on('page_changed', async (data: { roomId: string; pageNumber: number }) => {
      const { roomId, pageNumber } = data
      const userId = socket.userId!

      console.log('[Socket] Page change requested:', {
        pageNumber,
        userId,
        displayName: socket.userData?.displayName,
        roomId
      })

      if (!socket.rooms.has(roomId)) {
        console.log('[Socket] User not in room:', roomId)
        return
      }

      const room = await Room.findById(roomId)
      if (!room) {
        console.log('[Socket] Room not found:', roomId)
        return
      }

      const isHost = room.hostId.toString() === userId
      const controlMode = room.controlMode

      console.log('[Socket] Control mode:', controlMode, 'isHost:', isHost)

      if (controlMode === 'host' && !isHost) {
        console.log('[Socket] Blocked: non-host cannot change page in host mode')
        return
      }

      await RoomService.updateParticipantPage(new Types.ObjectId(roomId), new Types.ObjectId(userId), pageNumber)

      console.log('[Socket] Broadcasting page change to room:', roomId)
      socket.to(roomId).emit('page_changed', {
        pageNumber,
        userId,
        displayName: socket.userData!.displayName,
        color: socket.userData!.color,
        animated: true,
      })
    })

    socket.on('chat_message', async (data: { roomId: string; message: string }) => {
      const { roomId, message } = data
      const userId = socket.userId!

      if (!socket.rooms.has(roomId)) return
      if (!message.trim()) return

      const savedMessage = await RoomService.saveMessage(
        new Types.ObjectId(roomId),
        new Types.ObjectId(userId),
        socket.userData!.displayName,
        socket.userData!.avatar,
        socket.userData!.color,
        message.trim()
      )

      io.to(roomId).emit('chat_message', {
        id: savedMessage._id,
        roomId,
        userId,
        displayName: socket.userData!.displayName,
        avatar: socket.userData!.avatar,
        color: socket.userData!.color,
        message: message.trim(),
        createdAt: savedMessage.createdAt,
      })
    })

    socket.on('reaction', async (data: { roomId: string; type: string }) => {
      const { roomId, type } = data
      const userId = socket.userId!

      if (!socket.rooms.has(roomId)) return

      await RoomService.saveReaction(
        new Types.ObjectId(roomId),
        new Types.ObjectId(userId),
        socket.userData!.displayName,
        socket.userData!.avatar,
        socket.userData!.color,
        type
      )

      socket.to(roomId).emit('reaction', {
        userId,
        displayName: socket.userData!.displayName,
        avatar: socket.userData!.avatar,
        color: socket.userData!.color,
        type,
      })
    })

    socket.on('typing_start', (data: { roomId: string }) => {
      const { roomId } = data
      if (!socket.rooms.has(roomId)) return

      socket.to(roomId).emit('user_typing', {
        userId: socket.userId!,
        displayName: socket.userData!.displayName,
        isTyping: true,
      })
    })

    socket.on('typing_stop', (data: { roomId: string }) => {
      const { roomId } = data
      if (!socket.rooms.has(roomId)) return

      socket.to(roomId).emit('user_typing', {
        userId: socket.userId!,
        displayName: socket.userData!.displayName,
        isTyping: false,
      })
    })

    socket.on('request_sync', async (data: { roomId: string }) => {
      const { roomId } = data
      const room = await Room.findById(roomId)
      if (!room) return

      socket.emit('sync_response', {
        currentPage: room.lastPage,
        controlMode: room.controlMode,
        hostId: room.hostId.toString(),
      })
    })

    socket.on('update_settings', async (data: { roomId: string; settings: any }) => {
      const { roomId, settings } = data
      const userId = socket.userId!

      const room = await Room.findById(roomId)
      if (!room) return

      const isHost = room.hostId.toString() === userId
      if (!isHost) return

      const updatedRoom = await RoomService.updateSettings(
        new Types.ObjectId(roomId),
        new Types.ObjectId(userId),
        settings
      )

      if (updatedRoom) {
        io.to(roomId).emit('settings_changed', {
          settings: updatedRoom.settings,
          changedBy: userId,
        })
      }
    })

    socket.on('annotation_add', async (data: {
      roomId: string
      pageNumber: number
      type: 'draw' | 'highlight'
      points: Array<{ x: number; y: number }>
      color: string
      strokeWidth: number
    }) => {
      const { roomId, pageNumber, type, points, color, strokeWidth } = data
      const userId = socket.userId!

      if (!socket.rooms.has(roomId)) return
      if (points.length < 2) return

      const annotation = await Annotation.create({
        roomId: new Types.ObjectId(roomId),
        userId: new Types.ObjectId(userId),
        displayName: socket.userData!.displayName,
        color,
        pageNumber,
        type,
        points,
        strokeWidth,
      })

      io.to(roomId).emit('annotation_added', {
        id: annotation._id.toString(),
        roomId,
        userId,
        displayName: socket.userData!.displayName,
        color,
        pageNumber,
        type,
        points,
        strokeWidth,
        createdAt: annotation.createdAt,
      })
    })

    socket.on('annotation_delete', async (data: { roomId: string; annotationId: string }) => {
      const { roomId, annotationId } = data
      const userId = socket.userId!

      if (!socket.rooms.has(roomId)) return
      if (!Types.ObjectId.isValid(annotationId)) return

      const annotation = await Annotation.findById(annotationId)
      if (!annotation) return

      // Only the creator or host can delete
      const room = await Room.findById(roomId)
      const isHost = room?.hostId.toString() === userId
      const isOwner = annotation.userId.toString() === userId

      if (!isHost && !isOwner) return

      await Annotation.findByIdAndDelete(annotationId)

      io.to(roomId).emit('annotation_deleted', {
        annotationId,
        userId,
      })
    })

    socket.on('disconnect', async () => {
      console.log('[Socket] Client disconnected:', socket.id)

      const userSocketsSet = userSockets.get(socket.userId!)
      if (userSocketsSet) {
        userSocketsSet.delete(socket.id)
        if (userSocketsSet.size === 0) {
          userSockets.delete(socket.userId!)
          if (socket.roomId) {
            await handleLeaveRoom(socket, socket.roomId)
          }
        }
      }
    })
  })
}

async function handleLeaveRoom(socket: AuthenticatedSocket, roomId: string): Promise<void> {
  if (!socket.userId || !Types.ObjectId.isValid(roomId)) return

  await RoomService.leaveRoom(new Types.ObjectId(roomId), new Types.ObjectId(socket.userId))

  socket.leave(roomId)
  socket.to(roomId).emit('user_left', {
    userId: socket.userId,
    displayName: socket.userData?.displayName || 'Someone',
  })

  socket.roomId = undefined
}

export function getUserSocketCount(userId: string): number {
  return userSockets.get(userId)?.size || 0
}

export function isUserOnline(userId: string): boolean {
  return (userSockets.get(userId)?.size || 0) > 0
}