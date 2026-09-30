import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { socketService } from '@/services'
import { useRoomStore } from '@/store'
import { useUserStore } from '@/store'

interface SocketContextType {
  connect: (roomId: string) => Promise<void>
  disconnect: () => void
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useUserStore()
  const { setConnectionStatus } = useRoomStore()
  const mountedRef = useRef(false)

  const connect = async (roomId: string) => {
    if (!user) return
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
    await socketService.connect(socketUrl)
    socketService.joinRoom(roomId, user.id, user.displayName, user.avatar)
  }

  const disconnect = () => {
    socketService.disconnect()
    setConnectionStatus('disconnected')
  }

  const isConnected = socketService.isConnected()

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (socketService.isConnected()) {
        socketService.disconnect()
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ connect, disconnect, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}