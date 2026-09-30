import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { config } from '@/config'
import { Readable } from 'stream'

export interface StorageProvider {
  upload(file: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }>
  download(key: string): Promise<Readable>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string

  constructor() {
    this.uploadDir = config.storage.local.uploadDir
    this.ensureDir()
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create upload directory:', error)
    }
  }

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }> {
    const key = `${uuidv4()}-${fileName}`
    const filePath = path.join(this.uploadDir, key)
    await fs.writeFile(filePath, file)
    return { url: `/api/storage/${key}`, key }
  }

  async download(key: string): Promise<Readable> {
    const filePath = path.join(this.uploadDir, key)
    const fileHandle = await fs.open(filePath, 'r')
    return fileHandle.createReadStream()
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key)
    await fs.unlink(filePath).catch(() => {})
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return `/api/storage/${key}`
  }
}

export class S3StorageProvider implements StorageProvider {
  private bucket: string
  private region: string

  constructor() {
    this.bucket = config.storage.s3.bucket!
    this.region = config.storage.s3.region!
  }

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

    const client = new S3Client({ region: this.region })
    const key = `uploads/${uuidv4()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })

    await client.send(command)

    return {
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
      key,
    }
  }

  async download(key: string): Promise<Readable> {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({ region: this.region })

    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    const response = await client.send(command)

    return response.Body as Readable
  }

  async delete(key: string): Promise<void> {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = new S3Client({ region: this.region })

    const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    await client.send(command)
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

    const client = new S3Client({ region: this.region })
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })

    return getSignedUrl(client, command, { expiresIn })
  }
}

export class SupabaseStorageProvider implements StorageProvider {
  private supabaseUrl: string
  private supabaseKey: string
  private bucket: string

  constructor() {
    this.supabaseUrl = config.storage.supabase.url!
    this.supabaseKey = config.storage.supabase.key!
    this.bucket = config.storage.supabase.bucket!
  }

  async upload(file: Buffer, fileName: string, mimeType: string): Promise<{ url: string; key: string }> {
    const key = `uploads/${uuidv4()}-${fileName}`

    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
        'Content-Type': mimeType,
      },
      body: file,
    })

    if (!response.ok) {
      throw new Error('Supabase upload failed')
    }

    return {
      url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`,
      key,
    }
  }

  async download(key: string): Promise<Readable> {
    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`, {
      headers: { Authorization: `Bearer ${this.supabaseKey}` },
    })

    if (!response.ok) {
      throw new Error('Supabase download failed')
    }

    return Readable.fromWeb(response.body as any)
  }

  async delete(key: string): Promise<void> {
    await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.supabaseKey}` },
    })
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/sign/${this.bucket}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn }),
    })

    const { signedURL } = await response.json()
    return `${this.supabaseUrl}${signedURL}`
  }
}

export function createStorageProvider(): StorageProvider {
  switch (config.storage.type) {
    case 's3':
      return new S3StorageProvider()
    case 'supabase':
      return new SupabaseStorageProvider()
    default:
      return new LocalStorageProvider()
  }
}