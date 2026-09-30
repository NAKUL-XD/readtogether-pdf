import { Room, Book, User, ChatMessage, Bookmark, Reaction, IRoom, IParticipant, ControlMode } from '@/models'
import { Types } from 'mongoose'

export interface CreateRoomData {
  bookId: Types.ObjectId
  hostId: Types.ObjectId
  name: string
  controlMode?: ControlMode
}

export interface JoinRoomData {
  roomId: Types.ObjectId
  userId: Types.ObjectId
  displayName: string
  avatar?: string
  color: string
}

export class RoomService {
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  static async createRoom(data: CreateRoomData): Promise<IRoom> {
    const roomCode = this.generateRoomCode()
    const host = await User.findById(data.hostId)
    if (!host) throw new Error('Host not found')

    const participant: IParticipant = {
      userId: data.hostId,
      displayName: host.displayName,
      avatar: host.avatar,
      color: host.color,
      joinedAt: new Date(),
      currentPage: 1,
      isOnline: true,
      isHost: true,
    }

    const room = new Room({
      roomCode,
      name: data.name,
      bookId: data.bookId,
      hostId: data.hostId,
      participants: [participant],
      controlMode: data.controlMode || 'shared',
      lastPage: 1,
      settings: {
        controlMode: data.controlMode || 'shared',
        readingMode: 'light',
        showThumbnails: true,
        enableChat: true,
        soundEffects: true,
        pageAnimation: true,
      },
    })

    await room.save()
    await room.populate('bookId')
    return room
  }

  static async getRoomById(roomId: Types.ObjectId): Promise<IRoom | null> {
    return Room.findById(roomId).populate('bookId')
  }

  static async getRoomByCode(roomCode: string): Promise<IRoom | null> {
    return Room.findOne({ roomCode: roomCode.toUpperCase() }).populate('bookId')
  }

  static async joinRoom(data: JoinRoomData): Promise<{ room: IRoom; participant: IParticipant }> {
    const room = await Room.findById(data.roomId)
    if (!room) throw new Error('Room not found')

    const existingParticipant = room.participants.find(
      (p) => p.userId.toString() === data.userId.toString()
    )

    let participant: IParticipant

    if (existingParticipant) {
      existingParticipant.isOnline = true
      existingParticipant.joinedAt = new Date()
      participant = existingParticipant
    } else {
      participant = {
        userId: data.userId,
        displayName: data.displayName,
        avatar: data.avatar,
        color: data.color,
        joinedAt: new Date(),
        currentPage: room.lastPage,
        isOnline: true,
        isHost: room.hostId.toString() === data.userId.toString(),
      }
      room.participants.push(participant)
    }

    await room.save()
    return { room, participant }
  }

  static async leaveRoom(roomId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    const room = await Room.findById(roomId)
    if (!room) return

    const participant = room.participants.find((p) => p.userId.toString() === userId.toString())
    if (participant) {
      participant.isOnline = false
      await room.save()
    }
  }

  static async updateParticipantPage(
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
    pageNumber: number
  ): Promise<void> {
    const room = await Room.findById(roomId)
    if (!room) return

    const participant = room.participants.find((p) => p.userId.toString() === userId.toString())
    if (participant) {
      participant.currentPage = pageNumber
      room.lastPage = pageNumber
      await room.save()
    }
  }

  static async updateSettings(
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
    settings: Partial<IRoom['settings']>
  ): Promise<IRoom | null> {
    const room = await Room.findById(roomId)
    if (!room) return null

    const isHost = room.hostId.toString() === userId.toString()
    if (!isHost && settings.controlMode) {
      delete settings.controlMode
    }

    room.settings = { ...room.settings, ...settings }
    if (settings.controlMode) room.controlMode = settings.controlMode
    await room.save()
    return room
  }

  static async getMessages(roomId: Types.ObjectId, limit = 50): Promise<any[]> {
    return ChatMessage.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  }

  static async saveMessage(
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
    displayName: string,
    avatar: string | undefined,
    color: string,
    message: string
  ): Promise<any> {
    const chatMessage = new ChatMessage({
      roomId,
      userId,
      displayName,
      avatar,
      color,
      message,
    })
    await chatMessage.save()
    return chatMessage
  }

  static async getBookmarks(roomId: Types.ObjectId): Promise<any[]> {
    return Bookmark.find({ roomId }).sort({ pageNumber: 1 }).lean()
  }

  static async addBookmark(
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
    pageNumber: number,
    label?: string,
    isShared = false
  ): Promise<any> {
    const bookmark = new Bookmark({
      roomId,
      userId,
      pageNumber,
      label,
      isShared,
    })
    await bookmark.save()
    return bookmark
  }

  static async removeBookmark(bookmarkId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    await Bookmark.findOneAndDelete({ _id: bookmarkId, userId })
  }

  static async saveReaction(
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
    displayName: string,
    avatar: string | undefined,
    color: string,
    type: string
  ): Promise<any> {
    const reaction = new Reaction({
      roomId,
      userId,
      displayName,
      avatar,
      color,
      type,
    })
    await reaction.save()
    return reaction
  }

  static async getUserRooms(userId: Types.ObjectId): Promise<IRoom[]> {
    return Room.find({ 'participants.userId': userId })
      .populate('bookId')
      .sort({ updatedAt: -1 })
      .lean()
  }
}