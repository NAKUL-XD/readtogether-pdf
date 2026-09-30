import mongoose, { Document, Schema } from 'mongoose'

export interface IBook extends Document {
  title: string
  fileUrl: string
  fileSize: number
  totalPages: number
  uploadedBy: mongoose.Types.ObjectId
  thumbnailUrl?: string
  createdAt: Date
}

const bookSchema = new Schema<IBook>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
    min: 1,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thumbnailUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

bookSchema.index({ uploadedBy: 1, createdAt: -1 })
bookSchema.index({ createdAt: -1 })

export const Book = mongoose.model<IBook>('Book', bookSchema)