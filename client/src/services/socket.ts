import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types'
import { useRoomStore } from '@/store'
import { useUserStore } from '@/store'
import { useReaderStore } from '@/store'
import { useUIStore } from '@/store'

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10
  private reconnectDelay = 1000

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      // Get current user data for socket authentication
      const user = useUserStore.getState().user
      if (!user) {
        reject(new Error('User not authenticated'))
        return
      }

      const token = localStorage.getItem('auth_token')

      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        autoConnect: true,
        auth: {
          token: token,
          userId: user.id,
          displayName: user.displayName,
          avatar: user.avatar,
          color: user.color,
        },
      })

      this.socket.on('connect', () => {
        console.log('[Socket] Connected:', this.socket?.id)
        this.reconnectAttempts = 0
        useRoomStore.getState().setConnectionStatus('connected')
        this.requestSync()
        resolve()
      })

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason)
        useRoomStore.getState().setConnectionStatus('disconnected')
        if (reason === 'io server disconnect') {
          this.socket?.connect()
        }
      })

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error)
        this.reconnectAttempts++
        useRoomStore.getState().setConnectionStatus('reconnecting')
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Max reconnection attempts reached'))
        }
      })

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts')
        useRoomStore.getState().setConnectionStatus('connected')
        this.requestSync()
      })

      this.setupEventHandlers()
    })
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('room_state', (data) => {
      console.log('[Socket] Room state received')
      useRoomStore.getState().setRoom(data.room, data.book, data.currentUser)
      useRoomStore.getState().setMessages(data.messages || [])
      useRoomStore.getState().setBookmarks(data.bookmarks || [])
      useRoomStore.getState().setSyncState('synced')
    })

    this.socket.on('user_joined', (data) => {
      console.log('[Socket] User joined:', data.participant.displayName)
      useRoomStore.getState().addParticipant(data.participant)
      this.showToast('info', `${data.participant.displayName} joined the room`)
    })

    this.socket.on('user_left', (data) => {
      console.log('[Socket] User left:', data.displayName)
      useRoomStore.getState().removeParticipant(data.userId)
      this.showToast('info', `${data.displayName} left the room`)
    })

    this.socket.on('page_changed', (data) => {
      console.log('[Socket] Page changed to:', data.pageNumber, 'by', data.displayName)
      useRoomStore.getState().updateParticipantPage(data.userId, data.pageNumber)
      useRoomStore.getState().setLastPage(data.pageNumber)
      useReaderStore.getState().setCurrentPage(data.pageNumber)
      if (data.animated !== false) {
        this.showToast('info', `${data.displayName} moved to page ${data.pageNumber}`)
      }
    })

    this.socket.on('chat_message', (data) => {
      console.log('[Socket] Chat message:', data.message)
      useRoomStore.getState().addMessage(data)
    })

    this.socket.on('reaction', (data) => {
      console.log('[Socket] Reaction:', data.type, 'from', data.displayName)
      this.showReaction(data)
    })

    this.socket.on('user_typing', () => {
      // Handle typing indicator
    })

    this.socket.on('settings_changed', (data) => {
      console.log('[Socket] Settings changed by', data.changedBy)
      useRoomStore.getState().updateSettings(data.settings)
    })

    this.socket.on('sync_response', (data) => {
      console.log('[Socket] Sync response:', data)
      useReaderStore.getState().setCurrentPage(data.currentPage)
      useRoomStore.getState().setSyncState('synced')
    })

    this.socket.on('error', (data) => {
      console.error('[Socket] Error:', data)
      this.showToast('error', data.message)
    })

    this.socket.on('reconnected', (data) => {
      console.log('[Socket] Reconnected to room')
      useReaderStore.getState().setCurrentPage(data.currentPage)
      useRoomStore.getState().setSyncState('synced')
      this.showToast('success', 'Back in sync')
    })

    this.socket.on('annotation_added', (data) => {
      console.log('[Socket] Annotation added:', data)
      useRoomStore.getState().addAnnotation(data)
    })

    this.socket.on('annotation_deleted', (data) => {
      console.log('[Socket] Annotation deleted:', data.annotationId)
      useRoomStore.getState().removeAnnotation(data.annotationId)
    })
  }

  private showToast(type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string): void {
    useUIStore.getState().addToast({ type, title, message })
  }

  private showReaction(data: any): void {
    const event = new CustomEvent('reaction', { detail: data })
    window.dispatchEvent(event)
  }

  disconnect(): void {
    if (this.socket) {
      this.leaveRoom()
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinRoom(roomId: string, userId: string, displayName: string, avatar?: string): void {
    this.socket?.emit('join_room', { roomId, userId, displayName, avatar })
    useRoomStore.getState().setConnectionStatus('connecting')
    useRoomStore.getState().setSyncState('syncing')
  }

  leaveRoom(): void {
    const { room } = useRoomStore.getState()
    const { user } = useUserStore.getState()
    if (room && user) {
      this.socket?.emit('leave_room', { roomId: room.id, userId: user.id })
    }
  }

  changePage(pageNumber: number): void {
    const { room } = useRoomStore.getState()
    const { user } = useUserStore.getState()
    console.log('[Socket] changePage called', { room, user, pageNumber })
    if (room && user) {
      const roomId = room.id || room._id
      console.log('[Socket] Emitting page_changed', { roomId, pageNumber, userId: user.id })
      this.socket?.emit('page_changed', { roomId: roomId, pageNumber, userId: user.id })
      useRoomStore.getState().setSyncState('syncing')
    }
  }

  sendChatMessage(message: string): void {
    const { room } = useRoomStore.getState()
    if (room && message.trim()) {
      this.socket?.emit('chat_message', { roomId: room.id, message: message.trim() })
    }
  }

  sendReaction(type: string): void {
    const { room } = useRoomStore.getState()
    if (room) {
      this.socket?.emit('reaction', { roomId: room.id, type })
    }
  }

  startTyping(): void {
    const { room } = useRoomStore.getState()
    const { user } = useUserStore.getState()
    if (room && user) {
      this.socket?.emit('typing_start', { roomId: room.id, userId: user.id })
    }
  }

  stopTyping(): void {
    const { room } = useRoomStore.getState()
    const { user } = useUserStore.getState()
    if (room && user) {
      this.socket?.emit('typing_stop', { roomId: room.id, userId: user.id })
    }
  }

  requestSync(): void {
    const { room } = useRoomStore.getState()
    if (room) {
      this.socket?.emit('request_sync', { roomId: room.id })
      useRoomStore.getState().setSyncState('syncing')
    }
  }

  updateSettings(settings: Partial<any>): void {
    const { room } = useRoomStore.getState()
    if (room) {
      this.socket?.emit('update_settings', { roomId: room.id, settings })
    }
  }

  addAnnotation(pageNumber: number, type: 'draw' | 'highlight', points: any[], color: string, strokeWidth: number): void {
    const { room } = useRoomStore.getState()
    if (room) {
      this.socket?.emit('annotation_add', {
        roomId: room.id,
        pageNumber,
        type,
        points,
        color,
        strokeWidth,
      })
    }
  }

  deleteAnnotation(annotationId: string): void {
    const { room } = useRoomStore.getState()
    if (room) {
      this.socket?.emit('annotation_delete', { roomId: room.id, annotationId })
    }
  }

  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()