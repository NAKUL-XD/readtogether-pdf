import { Router } from 'express'
import multer from 'multer'
import { uploadBook, getBook, deleteBook, getUserBooks } from '@/controllers'
import { authenticate, optionalAuth } from '@/middleware'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

router.post('/upload', authenticate, upload.single('pdf'), uploadBook)
router.get('/my', authenticate, getUserBooks)
router.get('/:bookId', getBook)
router.delete('/:bookId', authenticate, deleteBook)

export default router