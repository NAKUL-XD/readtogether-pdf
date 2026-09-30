import { Router, Response } from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import { config } from '@/config'
import { Readable } from 'stream'

const router = Router()

router.get('/:key', async (req, res: Response) => {
  try {
    const { key } = req.params
    const filePath = path.join(config.storage.local.uploadDir, key)

    try {
      await fs.access(filePath)
    } catch {
      return res.status(404).json({ message: 'File not found' })
    }

    const stat = await fs.stat(filePath)
    const fileHandle = await fs.open(filePath, 'r')
    const stream = fileHandle.createReadStream()

    res.setHeader('Content-Length', stat.size)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Cache-Control', 'public, max-age=31536000')

    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
      const chunkSize = end - start + 1

      res.status(206)
      res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`)
      res.setHeader('Content-Length', chunkSize)

      const chunkStream = fileHandle.createReadStream({ start, end })
      chunkStream.pipe(res)
    } else {
      stream.pipe(res)
    }

    stream.on('error', (err) => {
      console.error('Stream error:', err)
      if (!res.headersSent) {
        res.status(500).json({ message: 'Stream error' })
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    if (!res.headersSent) {
      res.status(500).json({ message: 'Download failed' })
    }
  }
})

router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const filePath = path.join(config.storage.local.uploadDir, key)

    try {
      await fs.unlink(filePath)
      res.json({ message: 'File deleted' })
    } catch {
      res.status(404).json({ message: 'File not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' })
  }
})

router.post('/upload', async (req, res) => {
  // For local storage, upload is handled by multer in book routes
  res.status(501).json({ message: 'Use /api/books/upload for file uploads' })
})

export default router