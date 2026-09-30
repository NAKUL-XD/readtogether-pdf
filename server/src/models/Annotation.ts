import { Schema, model, Document, Types } from 'mongoose'

export interface IPoint {
  x: number
  y: number
}

export interface IAnnotation extends Document {
  roomId: Types.ObjectId
  userId: Types.ObjectId
  displayName: string
  color: string
  pageNumber: number
  type: 'draw' | 'highlight'
  points: IPoint[]
  strokeWidth: number
  createdAt: Date
}

const PointSchema = new Schema<IPoint>({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
}, { _id: false })

const AnnotationSchema = new Schema<IAnnotation>({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  displayName: { type: String, required: true },
  color: { type: String, required: true },
  pageNumber: { type: Number, required: true, index: true },
  type: { type: String, enum: ['draw', 'highlight'], required: true },
  points: { type: [PointSchema], required: true },
  strokeWidth: { type: Number, required: true, default: 3 },
  createdAt: { type: Date, default: Date.now, index: true },
})

AnnotationSchema.index({ roomId: 1, pageNumber: 1 })

export const Annotation = model<IAnnotation>('Annotation', AnnotationSchema)
