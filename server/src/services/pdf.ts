import { createRequire } from 'module'
import { Buffer } from 'buffer'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

export interface PDFInfo {
  totalPages: number
  title?: string
  author?: string
  subject?: string
  creator?: string
  producer?: string
  creationDate?: Date
  modificationDate?: Date
}

export async function extractPDFInfo(buffer: Buffer): Promise<PDFInfo> {
  try {
    const data = await pdfParse(buffer)
    return {
      totalPages: data.numpages,
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
      creationDate: data.info?.CreationDate,
      modificationDate: data.info?.ModDate,
    }
  } catch (error) {
    console.error('PDF parsing error:', error)
    return { totalPages: 1 }
  }
}

export async function generateThumbnail(buffer: Buffer, pageNumber = 1): Promise<Buffer | null> {
  try {
    const { PDFDocument } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.load(buffer)
    const page = pdfDoc.getPage(pageNumber - 1)
    const { width, height } = page.getSize()
    const scale = 200 / Math.max(width, height)
    return null // Would need pdf2pic or similar for actual thumbnail generation
  } catch {
    return null
  }
}

export function validatePDFBuffer(buffer: Buffer): { valid: boolean; error?: string } {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file' }
  }

  const pdfSignature = buffer.subarray(0, 5).toString()
  if (pdfSignature !== '%PDF-') {
    return { valid: false, error: 'Not a valid PDF file' }
  }

  return { valid: true }
}