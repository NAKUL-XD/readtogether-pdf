import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Input, Label } from '@/components/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'
import { Loader2, AlertCircle, Users, BookOpen, ChevronLeft, Lock } from 'lucide-react'
import { api } from '@/services'
import { useUserStore, useRoomStore, useReaderStore } from '@/store'
import { socketService } from '@/services'
import { cn, copyToClipboard } from '@/utils'
import { useUIStore } from '@/store'

export function JoinRoomPage() {
  const navigate = useNavigate()
  const { roomCode: roomCodeParam } = useParams()
  const { user, createGuestUser, clearUser } = useUserStore()
  const { setRoom } = useRoomStore()
  const { setCurrentPage } = useReaderStore()
  const { addToast } = useUIStore()

  const [step, setStep] = useState<'enter' | 'loading' | 'preview' | 'error'>('enter')
  const [roomCode, setRoomCode] = useState(roomCodeParam || '')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [roomData, setRoomData] = useState<{ room: any; book: any; participant: any; messages: any[]; bookmarks: any[] } | null>(null)

  // Clear user if no auth token exists
  useEffect(() => {
    const hasToken = localStorage.getItem('auth_token')
    if (user && !hasToken) {
      console.log('Clearing stale user data - no auth token found')
      clearUser()
      localStorage.clear()
    }
  }, [])

  useEffect(() => {
    if (roomCodeParam) {
      handleJoinByLink(roomCodeParam)
    }
  }, [roomCodeParam])

  const handleJoinByLink = async (code: string) => {
    setStep('loading')
    setError(null)
    try {
      const data = await api.getRoomByCode(code.toUpperCase())
      setRoomData(data)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room not found')
      setStep('error')
    }
  }

  const handleJoin = async () => {
    if (!roomCode.trim() || !displayName.trim()) return

    setStep('loading')
    setError(null)

    try {
      // Create or use existing guest user and authenticate
      if (!user) {
        const guestUser = createGuestUser(displayName.trim())

        // Register the guest user with the backend
        const { user: backendUser, token } = await api.createGuestUser(
          guestUser.displayName,
          guestUser.color,
          guestUser.avatar
        )

        // Update the local user with the backend ID
        useUserStore.getState().setUser({
          ...guestUser,
          id: backendUser.id,
        })
      }

      const data = await api.getRoomByCode(roomCode.toUpperCase())
      setRoomData(data)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid room code')
      setStep('error')
    }
  }

  const handleConfirmJoin = async () => {
    if (!roomData || !user) return

    try {
      const newUser = useUserStore.getState().user
      if (!newUser) return

      const participant = {
        userId: newUser.id,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        color: newUser.color,
        joinedAt: new Date(),
        currentPage: roomData.room.lastPage || 1,
        isOnline: true,
        isHost: roomData.room.hostId === newUser.id,
      }

      setRoom(
        roomData.room,
        roomData.book,
        participant
      )

      setCurrentPage(roomData.room.lastPage || 1)

      await socketService.connect(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000')
      socketService.joinRoom(roomData.room.id, newUser.id, newUser.displayName, newUser.avatar)

      addToast({ type: 'success', title: 'Joined room!' })
      navigate(`/room/${roomData.room.id}`)
    } catch (err) {
      setError('Failed to join room')
      setStep('error')
    }
  }

  const handleGoBack = () => {
    setStep('enter')
    setRoomData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {step === 'enter' && (
            <motion.div
              key="enter"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <motion.h1 className="font-serif text-3xl font-medium text-charcoal-900 dark:text-charcoal-100">
                  Join Reading Room
                </motion.h1>
                <motion.p className="mt-2 text-charcoal-500 dark:text-charcoal-400">
                  Enter a room code to join a reading session
                </motion.p>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="roomCode">Room Code</Label>
                    <div className="relative">
                      <Input
                        id="roomCode"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="ABC123"
                        maxLength={6}
                        className="text-center text-lg tracking-widest font-mono"
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="displayName">Your Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={30}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                  </div>
                  <Button variant="primary" className="w-full" size="lg" onClick={handleJoin} disabled={!roomCode.trim() || !displayName.trim()}>
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4 border-3 border-primary-500 border-t-transparent rounded-full"
              />
              <p className="font-medium text-charcoal-900 dark:text-charcoal-100">
                Connecting to room…
              </p>
            </motion.div>
          )}

          {step === 'preview' && roomData && roomData.book && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle>{roomData.book.title}</CardTitle>
                      <CardDescription>by {roomData.book.uploadedBy || 'Unknown'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-charcoal-500 dark:text-charcoal-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" aria-hidden="true" />
                      {roomData.room.participants.length} reader{roomData.room.participants.length !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" aria-hidden="true" />
                      {roomData.book.totalPages} pages
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {roomData.room.participants.map((p: any) => (
                      <div key={p.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                          {p.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-charcoal-900 dark:text-charcoal-100">{p.displayName}</span>
                        {p.isHost && <span className="ml-auto text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">Host</span>}
                        <span className="text-sm text-charcoal-500 dark:text-charcoal-400">Page {p.currentPage}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <div>
                    <Label htmlFor="joinDisplayName">Your Name</Label>
                    <Input
                      id="joinDisplayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      maxLength={30}
                    />
                  </div>
                </CardFooter>
              </Card>

              <div className="flex gap-3">
                <Button variant="primary" size="lg" className="flex-1" onClick={handleConfirmJoin}>
                  Join Reading Room
                </Button>
                <Button variant="ghost" size="lg" onClick={handleGoBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                  Back
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card variant="outlined" className="border-red-200 dark:border-red-800">
                <CardContent className="p-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" aria-hidden="true" />
                  <h2 className="font-medium text-charcoal-900 dark:text-charcoal-100 mb-2">
                    {error || 'Room not found'}
                  </h2>
                  <p className="text-charcoal-500 dark:text-charcoal-400 mb-6">
                    This reading room doesn't exist or has expired. Please check the code and try again.
                  </p>
                  <Button variant="secondary" onClick={handleGoBack}>
                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                    Try Another Code
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}