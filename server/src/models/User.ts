import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  displayName: string
  avatar?: string
  color: string
  createdAt: Date
  lastSeen: Date
}

const userSchema = new Schema<IUser>({
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  avatar: {
    type: String,
  },
  color: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
})

userSchema.index({ createdAt: -1 })

export const User = mongoose.model<IUser>('User', userSchema)