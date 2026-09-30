import { Request, Response, NextFunction } from 'express'
import { Book } from '@/models'
import { extractPDFInfo, validatePDFBuffer } from '@/services'
import { createStorageProvider } from '@/services'
import { AppError } from '@/middleware'
import { AuthRequest } from '@/middleware'

const storage = createStorageProvider()

export const uploadBook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400)
    }

    if (!req.userId) {
      throw new AppError('User authentication required', 401)
    }

    

    const validation = validatePDFBuffer(req.file.buffer)
    if (!validation.valid) {
      throw new AppError(validation.error || 'Invalid PDF file', 400)
    }

    const pdfInfo = await extractPDFInfo(req.file.buffer)

    const { url, key } = await storage.upload(req.file.buffer, req.file.originalname, req.file.mimetype)

    const book = new Book({
      title: req.body.title || req.file.originalname.replace('.pdf', ''),
      fileUrl: url,
      fileSize: req.file.size,
      totalPages: pdfInfo.totalPages,
      uploadedBy: req.userId,
      thumbnailUrl: undefined,
    })

    await book.save()

    res.status(201).json({
      book: {
        id: book._id,
        title: book.title,
        fileUrl: book.fileUrl,
        fileSize: book.fileSize,
        totalPages: book.totalPages,
        thumbnailUrl: book.thumbnailUrl,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = req.params
    const book = await Book.findById(bookId)
    if (!book) {
      throw new AppError('Book not found', 404)
    }
    res.json({ book })
  } catch (error) {
    next(error)
  }
}

export const deleteBook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bookId } = req.params
    const book = await Book.findById(bookId)
    if (!book) {
      throw new AppError('Book not found', 404)
    }

    if (book.uploadedBy.toString() !== req.userId) {
      throw new AppError('Not authorized', 403)
    }

    await storage.delete(book.fileUrl.split('/').pop() || '')
    await book.deleteOne()

    res.json({ message: 'Book deleted' })
  } catch (error) {
    next(error)
  }
}

export const getUserBooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const books = await Book.find({ uploadedBy: req.userId! })
      .sort({ createdAt: -1 })
      .lean()
    res.json({ books })
  } catch (error) {
    next(error)
  }
}