import mongoose, { Document, Schema } from 'mongoose'

export interface IBookmark extends Document {
  roomId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  pageNumber: number
  label?: string
  isShared: boolean
  createdAt: Date
}

const bookmarkSchema = new Schema<IBookmark>({
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
  pageNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  label: {
    type: String,
    maxlength: 100,
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

bookmarkSchema.index({ roomId: 1, userId: 1, pageNumber: 1 })
bookmarkSchema.index({ roomId: 1, isShared: 1, pageNumber: 1 })
bookmarkSchema.index({ createdAt: -1 })

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema)