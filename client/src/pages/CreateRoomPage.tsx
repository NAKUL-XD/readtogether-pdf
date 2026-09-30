import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label } from '@/components/ui'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui'
import { Loader2, CheckCircle, FileText, X, Copy, Link as LinkIcon, ArrowRight, Upload, ChevronDown } from 'lucide-react'
import { api } from '@/services'
import { useUserStore, useRoomStore, useReaderStore } from '@/store'
import { socketService } from '@/services'
import { cn, validatePDFFile, formatFileSize, getShareableUrl, copyToClipboard } from '@/utils'
import { useUIStore } from '@/store'

export function CreateRoomPage() {
  const navigate = useNavigate()
  const { user, createGuestUser, clearUser } = useUserStore()
  const { setRoom } = useRoomStore()
  const { setCurrentPage } = useReaderStore()
  const { addToast } = useUIStore()

  // Clear user if no auth token exists (from before backend auth was implemented)
  useEffect(() => {
    const hasToken = localStorage.getItem('auth_token')
    if (user && !hasToken) {
      console.log('Clearing stale user data - no auth token found')
      clearUser()
      localStorage.clear() // Clear all localStorage to start fresh
    }
  }, [])

  const [step, setStep] = useState<'upload' | 'creating' | 'ready'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [roomName, setRoomName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [roomData, setRoomData] = useState<{ roomId: string; roomCode: string; roomName: string; bookTitle: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    const validation = validatePDFFile(selectedFile)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    setError(null)
    setFile(selectedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFileSelect(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setStep('creating')
    setError(null)

    try {
      // Ensure we have a backend-authenticated user
      let currentUser = user
      const hasToken = localStorage.getItem('auth_token')

      if (!currentUser || !hasToken) {
        const guestName = prompt('Enter your name to continue:') || 'Reader'
        const guestUser = currentUser || createGuestUser(guestName)

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

        currentUser = useUserStore.getState().user
      }

      const uploadResult = await api.uploadPDF(file, setUploadProgress)
      const roomResult = await api.createRoom(uploadResult.book.id, roomName || file.name.replace('.pdf', ''))

      const roomCode = roomResult.room.roomCode
      const shareableUrl = getShareableUrl(roomCode)

      const newUser = useUserStore.getState().user
      if (!newUser) return

      const participant = {
        userId: newUser.id,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        color: newUser.color,
        joinedAt: new Date(),
        currentPage: 1,
        isOnline: true,
        isHost: true,
      }

      setRoomData({
        roomId: roomResult.room.id,
        roomCode,
        roomName: roomResult.room.name,
        bookTitle: uploadResult.book.title,
      })

      setRoom(
        {
          id: roomResult.room.id,
          roomCode: roomResult.room.roomCode,
          name: roomResult.room.name,
          bookId: uploadResult.book.id,
          hostId: newUser.id,
          participants: [participant],
          controlMode: 'shared',
          lastPage: 1,
          settings: roomResult.room.settings,
          createdAt: new Date(roomResult.room.createdAt),
          updatedAt: new Date(roomResult.room.updatedAt),
        },
        {
          id: uploadResult.book.id,
          title: uploadResult.book.title,
          fileUrl: uploadResult.book.fileUrl,
          fileSize: uploadResult.book.fileSize,
          totalPages: uploadResult.book.totalPages,
          uploadedBy: newUser.id,
          createdAt: new Date(),
          thumbnailUrl: uploadResult.book.thumbnailUrl,
        },
        participant
      )

      setCurrentPage(1)
      setStep('ready')
      addToast({ type: 'success', title: 'Room created!', message: 'Your reading room is ready.' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
      setStep('upload')
    }
  }

  const handleCopyLink = async () => {
    if (!roomData) return
    try {
      await copyToClipboard(getShareableUrl(roomData.roomCode))
      addToast({ type: 'success', title: 'Invite link copied!' })
    } catch {
      addToast({ type: 'error', title: 'Failed to copy link' })
    }
  }

  const handleCopyCode = async () => {
    if (!roomData) return
    try {
      await copyToClipboard(roomData.roomCode)
      addToast({ type: 'success', title: 'Room code copied!' })
    } catch {
      addToast({ type: 'error', title: 'Failed to copy code' })
    }
  }

  const handleEnterRoom = () => {
    if (roomData) {
      navigate(`/room/${roomData.roomId}`)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setFile(null)
    setRoomName('')
    setUploadProgress(0)
    setError(null)
    setRoomData(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-3xl lg:text-4xl font-medium text-charcoal-900 dark:text-charcoal-100"
          >
            Create Reading Room
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-charcoal-500 dark:text-charcoal-400"
          >
            Upload a PDF and invite a friend to read together
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UploadZone
                file={file}
                error={error}
                isDragging={isDragging}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileSelect={handleFileInputChange}
              />
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <FilePreview
                    file={file}
                    onRemove={() => setFile(null)}
                  />
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="roomName">Room Name (optional)</Label>
                      <Input
                        id="roomName"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="My Reading Room"
                        maxLength={50}
                      />
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      size="lg"
                      onClick={handleUpload}
                      disabled={!file}
                    >
                      <Upload className="w-5 h-5 mr-2" aria-hidden="true" />
                      Create Room
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'creating' && (
            <motion.div
              key="creating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4 border-3 border-primary-500 border-t-transparent rounded-full"
              />
              <p className="font-medium text-charcoal-900 dark:text-charcoal-100 mb-2">
                {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Creating your room...'}
              </p>
              <div className="w-64 mx-auto h-2 bg-charcoal-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  className="h-full bg-primary-600 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {step === 'ready' && roomData && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" aria-hidden="true" />
                </motion.div>
                <h2 className="font-serif text-2xl font-medium text-charcoal-900 dark:text-charcoal-100">
                  Your reading room is ready!
                </h2>
                <p className="mt-2 text-charcoal-500 dark:text-charcoal-400">
                  {roomData.bookTitle}
                </p>
              </div>

              <Card className="mb-6">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <LinkIcon className="w-5 h-5 text-charcoal-400" aria-hidden="true" />
                      <span className="font-mono text-sm text-charcoal-900 dark:text-charcoal-100 break-all">
                        {getShareableUrl(roomData.roomCode)}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopyLink} aria-label="Copy link">
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 text-charcoal-400" aria-hidden="true">#</span>
                      <span className="font-mono text-lg font-medium text-charcoal-900 dark:text-charcoal-100 tracking-widest">
                        {roomData.roomCode}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCopyCode} aria-label="Copy code">
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" size="lg" className="flex-1" onClick={handleEnterRoom}>
                  <ArrowRight className="w-5 h-5 mr-2" aria-hidden="true" />
                  Enter Room
                </Button>
                <Button variant="secondary" size="lg" className="flex-1" onClick={handleReset}>
                  <X className="w-5 h-5 mr-2" aria-hidden="true" />
                  Create Another
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <p className="text-charcoal-500 dark:text-charcoal-400 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" aria-hidden="true" />
                  Waiting for your reader…
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function UploadZone({
  file,
  error,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: {
  file: File | null
  error: string | null
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'relative border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center transition-all duration-200',
        'cursor-pointer',
        isDragging
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-charcoal-300 dark:border-charcoal-700 hover:border-primary-400 dark:hover:border-primary-600'
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
      aria-label="Drop zone for PDF upload"
    >
      <input
        id="file-input"
        type="file"
        accept=".pdf"
        onChange={onFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Choose PDF file"
        disabled={!!file}
      />
      <FileText className="w-12 h-12 mx-auto mb-4 text-charcoal-300 dark:text-charcoal-600" aria-hidden="true" />
      <p className="font-medium text-charcoal-900 dark:text-charcoal-100 mb-1">
        Drag & drop a PDF here, or click to browse
      </p>
      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
        Max file size: 100MB
      </p>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center justify-center gap-1"
          role="alert"
        >
          <X className="w-4 h-4" aria-hidden="true" />
          {error}
        </motion.p>
      )}
    </div>
  )
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <Card variant="outlined">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-charcoal-900 dark:text-charcoal-100 truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}