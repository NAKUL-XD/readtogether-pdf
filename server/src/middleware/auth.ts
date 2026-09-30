import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config'
import { User } from '@/models'

export interface AuthRequest extends Request {
  user?: any
  userId?: string
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

    const user = await User.findById(decoded.userId).select('-__v')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    req.userId = user._id.toString()
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }

    const user = await User.findById(decoded.userId).select('-__v')
    if (user) {
      req.user = user
      req.userId = user._id.toString()
    }
    next()
  } catch {
    next()
  }
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })
}