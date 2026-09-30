import { Request, Response, NextFunction } from 'express'
import { config } from '@/config'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map((e) => e.message),
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
    })
  }

  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      message: 'Duplicate entry',
    })
  }

  const statusCode = 500
  const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message

  return res.status(statusCode).json({
    message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack }),
  })
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
}