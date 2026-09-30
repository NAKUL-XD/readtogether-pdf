import { Request, Response, NextFunction } from 'express'
import { User } from '@/models'
import { generateToken } from '@/middleware'

export const createGuestUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { displayName, color, avatar } = req.body

    const user = new User({
      displayName,
      color,
      avatar,
      lastSeen: new Date(),
    })

    await user.save()

    const token = generateToken(user._id.toString())

    res.status(201).json({
      user: {
        id: user._id,
        displayName: user.displayName,
        color: user.color,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastSeen: user.lastSeen,
      },
      token,
    })
  } catch (error) {
    next(error)
  }
}
