const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token)
}

export const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token')
}

interface UploadResponse {
  book: {
    id: string
    title: string
    fileUrl: string
    fileSize: number
    totalPages: number
    thumbnailUrl?: string
  }
  room: {
    id: string
    roomCode: string
    name: string
  }
}

interface CreateRoomResponse {
  room: {
    id: string
    roomCode: string
    name: string
    bookId: string
    hostId: string
    controlMode: string
    lastPage: number
    settings: any
    createdAt: string
  }
  book: {
    id: string
    title: string
    fileUrl: string
    fileSize: number
    totalPages: number
    thumbnailUrl?: string
  }
}

interface JoinRoomResponse {
  room: any
  book: any
  participant: any
  messages: any[]
  bookmarks: any[]
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

export const api = {
  async createGuestUser(displayName: string, color: string, avatar?: string): Promise<{ user: any; token: string }> {
    const response = await request<{ user: any; token: string }>('/users/guest', {
      method: 'POST',
      body: JSON.stringify({ displayName, color, avatar }),
    })
    setAuthToken(response.token)
    return response
  },

  async uploadPDF(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('pdf', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/books/upload`)

      const token = getAuthToken()
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(JSON.parse(xhr.responseText)?.message || 'Upload failed'))
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }
      xhr.send(formData)
    })
  },

  async createRoom(bookId: string, name?: string): Promise<CreateRoomResponse> {
    return request<CreateRoomResponse>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ bookId, name }),
    })
  },

  async getRoom(roomId: string): Promise<JoinRoomResponse> {
    return request<JoinRoomResponse>(`/rooms/${roomId}`)
  },

  async getRoomByCode(roomCode: string): Promise<JoinRoomResponse> {
    return request<JoinRoomResponse>(`/rooms/code/${roomCode}`)
  },

  async getBook(bookId: string): Promise<{ book: any }> {
    return request<{ book: any }>(`/books/${bookId}`)
  },

  async deleteBook(bookId: string): Promise<void> {
    return request<void>(`/books/${bookId}`, { method: 'DELETE' })
  },

  async getUserRooms(): Promise<{ rooms: any[] }> {
    return request<{ rooms: any[] }>('/rooms/user/me')
  },
}