export interface StorageProvider {
  upload(file: File, path: string): Promise<{ url: string; key: string }>
  download(key: string): Promise<Blob>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

export class LocalStorageProvider implements StorageProvider {
  private basePath: string

  constructor(basePath: string = 'uploads') {
    this.basePath = basePath
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }

  async download(key: string): Promise<Blob> {
    const response = await fetch(`/api/storage/download/${key}`)
    if (!response.ok) {
      throw new Error('Download failed')
    }
    return response.blob()
  }

  async delete(key: string): Promise<void> {
    const response = await fetch(`/api/storage/${key}`, { method: 'DELETE' })
    if (!response.ok) {
      throw new Error('Delete failed')
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const response = await fetch(`/api/storage/signed-url/${key}?expires=${expiresIn}`)
    if (!response.ok) {
      throw new Error('Failed to get signed URL')
    }
    const { url } = await response.json()
    return url
  }
}

export class S3StorageProvider implements StorageProvider {
  private bucket: string
  private region: string
  private accessKeyId: string
  private secretAccessKey: string

  constructor(config: { bucket: string; region: string; accessKeyId: string; secretAccessKey: string }) {
    this.bucket = config.bucket
    this.region = config.region
    this.accessKeyId = config.accessKeyId
    this.secretAccessKey = config.secretAccessKey
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const response = await fetch('/api/storage/s3/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        path,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get upload URL')
    }

    const { uploadUrl, key } = await response.json()

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('S3 upload failed')
    }

    return { url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`, key }
  }

  async download(key: string): Promise<Blob> {
    const url = await this.getSignedUrl(key)
    const response = await fetch(url)
    return response.blob()
  }

  async delete(key: string): Promise<void> {
    await fetch('/api/storage/s3/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const response = await fetch('/api/storage/s3/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, expiresIn }),
    })
    const { url } = await response.json()
    return url
  }
}

export class SupabaseStorageProvider implements StorageProvider {
  private supabaseUrl: string
  private supabaseKey: string
  private bucket: string

  constructor(config: { supabaseUrl: string; supabaseKey: string; bucket: string }) {
    this.supabaseUrl = config.supabaseUrl
    this.supabaseKey = config.supabaseKey
    this.bucket = config.bucket
  }

  async upload(file: File, path: string): Promise<{ url: string; key: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)

    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.supabaseKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Supabase upload failed')
    }

    const data = await response.json()
    return {
      url: `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${data.Key}`,
      key: data.Key,
    }
  }

  async download(key: string): Promise<Blob> {
    const response = await fetch(`${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`, {
      headers: { Authorization: `Bearer ${this.supabaseKey}` },
    })
    return response.blob()
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
  const type = import.meta.env.VITE_STORAGE_TYPE || 'local'

  switch (type) {
    case 's3':
      return new S3StorageProvider({
        bucket: import.meta.env.VITE_S3_BUCKET!,
        region: import.meta.env.VITE_S3_REGION!,
        accessKeyId: import.meta.env.VITE_S3_ACCESS_KEY!,
        secretAccessKey: import.meta.env.VITE_S3_SECRET_KEY!,
      })
    case 'supabase':
      return new SupabaseStorageProvider({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL!,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY!,
        bucket: import.meta.env.VITE_SUPABASE_BUCKET!,
      })
    default:
      return new LocalStorageProvider()
  }
}