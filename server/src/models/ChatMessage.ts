import mongoose, { Document, Schema } from 'mongoose'

export interface IChatMessage extends Document {
  roomId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  displayName: string
  avatar?: string
  color: string
  message: string
  createdAt: Date
}

const chatMessageSchema = new Schema<IChatMessage>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true,
  },
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
  message: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

chatMessageSchema.index({ roomId: 1, createdAt: -1 })
chatMessageSchema.index({ createdAt: -1 })

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema)