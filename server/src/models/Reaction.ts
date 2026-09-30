import mongoose, { Document, Schema } from 'mongoose'

export type ReactionType = 'heart' | 'laugh' | 'thumbsUp' | 'fire' | 'book'

export interface IReaction extends Document {
  roomId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  displayName: string
  avatar?: string
  color: string
  type: ReactionType
  createdAt: Date
}

const reactionSchema = new Schema<IReaction>({
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
  type: {
    type: String,
    enum: ['heart', 'laugh', 'thumbsUp', 'fire', 'book'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

reactionSchema.index({ roomId: 1, createdAt: -1 })
reactionSchema.index({ createdAt: -1 })

export const Reaction = mongoose.model<IReaction>('Reaction', reactionSchema)