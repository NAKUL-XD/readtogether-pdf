import mongoose, { Document, Schema } from 'mongoose'

export type ControlMode = 'shared' | 'host'

export interface IRoomSettings {
  controlMode: ControlMode
  readingMode: 'light' | 'dark' | 'sepia'
  showThumbnails: boolean
  enableChat: boolean
  soundEffects: boolean
  pageAnimation: boolean
}

export interface IParticipant {
  userId: mongoose.Types.ObjectId
  displayName: string
  avatar?: string
  color: string
  joinedAt: Date
  currentPage: number
  isOnline: boolean
  isHost: boolean
}

export interface IRoom extends Document {
  roomCode: string
  name: string
  bookId: mongoose.Types.ObjectId
  hostId: mongoose.Types.ObjectId
  participants: IParticipant[]
  controlMode: ControlMode
  lastPage: number
  settings: IRoomSettings
  createdAt: Date
  updatedAt: Date
}

const participantSchema = new Schema<IParticipant>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  avatar: String,
  color: {
    type: String,
    required: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  currentPage: {
    type: Number,
    default: 1,
    min: 1,
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  isHost: {
    type: Boolean,
    default: false,
  },
})

const roomSettingsSchema = new Schema<IRoomSettings>({
  controlMode: {
    type: String,
    enum: ['shared', 'host'],
    default: 'shared',
  },
  readingMode: {
    type: String,
    enum: ['light', 'dark', 'sepia'],
    default: 'light',
  },
  showThumbnails: {
    type: Boolean,
    default: true,
  },
  enableChat: {
    type: Boolean,
    default: true,
  },
  soundEffects: {
    type: Boolean,
    default: true,
  },
  pageAnimation: {
    type: Boolean,
    default: true,
  },
})

const roomSchema = new Schema<IRoom>({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [participantSchema],
  controlMode: {
    type: String,
    enum: ['shared', 'host'],
    default: 'shared',
  },
  lastPage: {
    type: Number,
    default: 1,
    min: 1,
  },
  settings: {
    type: roomSettingsSchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

roomSchema.index({ roomCode: 1 }, { unique: true })
roomSchema.index({ hostId: 1, createdAt: -1 })
roomSchema.index({ 'participants.userId': 1 })
roomSchema.index({ createdAt: -1 })

roomSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export const Room = mongoose.model<IRoom>('Room', roomSchema)
export { roomSchema, participantSchema, roomSettingsSchema }