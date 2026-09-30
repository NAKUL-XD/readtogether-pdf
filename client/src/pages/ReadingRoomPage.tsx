import { useEffect, useCallback, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Header, Toolbar, Sidebar } from '@/components/layout'
import { PDFViewer, AnnotationToolbar } from '@/components/reader'
import { BottomSheet } from '@/components/ui'
import { ChevronDown, ChevronLeft, ChevronRight, Minimize2, MoreHorizontal, Bookmark, MessageSquare, Users, Settings, Share2, Copy, ExternalLink, X, Bell, Moon, Sun, BookOpen, Trash2 } from 'lucide-react'
import { useRoomStore, useReaderStore, useUIStore, useUserStore } from '@/store'
import { socketService } from '@/services'
import { cn, getShareableUrl, copyToClipboard } from '@/utils'
import { useTouchGestures } from '@/hooks'
import { useKeyboard } from '@/hooks'

export function ReadingRoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useUserStore()
  const {
    room,
    book,
    participants,
    currentUser,
    connectionStatus,
    syncState,
    setConnectionStatus,
    clearRoom,
  } = useRoomStore()
  const {
    currentPage,
    totalPages,
    zoom,
    isFullscreen,
    isControlsVisible,
    readingMode,
    showThumbnails,
    isLoading,
    error,
    setCurrentPage,
    setTotalPages,
    setLoading,
    setError,
    toggleControls,
    setControlsVisible,
  } = useReaderStore()
  const {
    isChatOpen,
    isParticipantsOpen,
    isBookmarksOpen,
    isSettingsOpen,
    toggleChat,
    toggleParticipants,
    toggleBookmarks,
    toggleSettings,
    openBottomSheet,
    closeBottomSheet,
    activeBottomSheet,
    addToast,
  } = useUIStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [showMoreSheet, setShowMoreSheet] = useState(false)

  // Wire isFullscreen state to the real browser Fullscreen API
  useEffect(() => {
    const el = document.documentElement
    if (isFullscreen) {
      el.requestFullscreen?.().catch(() => { })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => { })
      }
    }
  }, [isFullscreen])

  // Sync back when user presses Escape to exit fullscreen via browser
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        useReaderStore.getState().setFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  useEffect(() => {
    if (!roomId || !user) {
      navigate('/join')
      return
    }

    const initRoom = async () => {
      try {
        setLoading(true)
        setConnectionStatus('connecting')

        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
        await socketService.connect(socketUrl)
        socketService.joinRoom(roomId, user.id, user.displayName, user.avatar)

        const handleReconnected = (event: CustomEvent) => {
          const { currentPage: page } = event.detail
          setCurrentPage(page)
          setConnectionStatus('connected')
          addToast({ type: 'success', title: 'Back in sync' })
        }

        window.addEventListener('reconnected', handleReconnected as EventListener)

        return () => {
          window.removeEventListener('reconnected', handleReconnected as EventListener)
          socketService.leaveRoom()
        }
      } catch (err) {
        setError('Failed to connect to room')
        setConnectionStatus('disconnected')
      } finally {
        setLoading(false)
      }
    }

    initRoom()

    return () => {
      socketService.leaveRoom()
      clearRoom()
    }
  }, [roomId, user, navigate, setLoading, setConnectionStatus, setCurrentPage, setError, clearRoom, addToast])

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      if (room && (room.controlMode === 'shared' || currentUser?.isHost)) {
        socketService.changePage(newPage)
      }
    }
  }, [currentPage, room, currentUser, setCurrentPage])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      if (room && (room.controlMode === 'shared' || currentUser?.isHost)) {
        socketService.changePage(newPage)
      }
    }
  }, [currentPage, totalPages, room, currentUser, setCurrentPage])

  const handlePageInput = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(clampedPage)
    if (room && (room.controlMode === 'shared' || currentUser?.isHost)) {
      socketService.changePage(clampedPage)
    }
  }, [totalPages, room, currentUser, setCurrentPage])

  useKeyboard({
    ArrowLeft: handlePreviousPage,
    ArrowRight: handleNextPage,
    ' ': handleNextPage,
    Escape: () => useReaderStore.getState().setFullscreen(false),
    f: () => useReaderStore.getState().toggleFullscreen(),
    F: () => useReaderStore.getState().toggleFullscreen(),
  }, [handlePreviousPage, handleNextPage])

  useTouchGestures(containerRef, {
    onSwipeLeft: handleNextPage,
    onSwipeRight: handlePreviousPage,
    onDoubleTap: () => useReaderStore.getState().toggleControls(),
    enabled: !isLoading && totalPages > 0,
    preventScroll: false,
  })

  const handleCopyInvite = async () => {
    if (!room) return
    try {
      await copyToClipboard(getShareableUrl(room.roomCode))
      addToast({ type: 'success', title: 'Invite link copied!' })
    } catch {
      addToast({ type: 'error', title: 'Failed to copy link' })
    }
  }

  const handleLeaveRoom = () => {
    socketService.leaveRoom()
    clearRoom()
    useReaderStore.getState().reset()
    navigate('/')
  }

  const moreSheetItems = [
    { label: 'Share Invite', icon: Share2, action: handleCopyInvite },
    { label: 'Copy Room Code', icon: Copy, action: () => copyToClipboard(room?.roomCode || '') },
    { label: 'Reading Mode', icon: readingMode === 'dark' ? Moon : readingMode === 'sepia' ? BookOpen : Sun, action: () => openBottomSheet('reading-mode') },
    { label: 'Notifications', icon: Bell, action: () => { } },
    { label: 'Leave Room', icon: ExternalLink, action: handleLeaveRoom, destructive: true },
  ]

  // Set totalPages from book data initially
  useEffect(() => {
    if (book && book.totalPages) {
      setTotalPages(book.totalPages)
    }
  }, [book, setTotalPages])

  if (!room || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4 border-3 border-primary-500 border-t-transparent rounded-full"
          />
          <p className="text-charcoal-500 dark:text-charcoal-400">Loading reading room…</p>
        </div>
      </div>
    )
  }

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages
  const isHostControl = room.controlMode === 'host' && !currentUser?.isHost

  return (
    <div className="min-h-screen bg-paper-light dark:bg-charcoal-900 sepia:bg-paper-sepia transition-colors duration-300">

      {/* ── FULLSCREEN MODE: only PDF + exit hint ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <PDFViewer
            fileUrl={book.fileUrl}
            onPageChange={handlePageInput}
            onLoadComplete={setTotalPages}
            onLoadError={setError}
            onLoadProgress={() => { }}
          />
          {/* floating exit button */}
          <button
            onClick={() => useReaderStore.getState().setFullscreen(false)}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal-900/80 text-white text-sm font-medium backdrop-blur-sm hover:bg-charcoal-900 transition-colors"
            aria-label="Exit fullscreen"
          >
            <Minimize2 className="w-4 h-4" />
            Exit Fullscreen
          </button>
          {/* page counter */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-charcoal-900/70 text-white text-sm font-medium backdrop-blur-sm pointer-events-none">
            {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {/* ── NORMAL MODE ── */}
      {!isFullscreen && (
        <>
          <Header
            title={book.title}
            onBack={handleLeaveRoom}
            showBack={true}
          />

          <main className="relative h-[calc(100vh-4rem)]">
            <div
              ref={containerRef}
              className="h-full w-full overflow-hidden relative"
              onClick={() => setControlsVisible(true)}
            >
              <PDFViewer
                fileUrl={book.fileUrl}
                onPageChange={handlePageInput}
                onLoadComplete={setTotalPages}
                onLoadError={setError}
                onLoadProgress={() => { }}
              />

              {/* Desktop prev/next buttons */}
              <div className="hidden md:block">
                {canGoPrevious && !isHostControl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePreviousPage() }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-charcoal-900 dark:text-charcoal-100 hover:bg-white dark:hover:bg-charcoal-700 transition-colors z-10"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {canGoNext && !isHostControl && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextPage() }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-charcoal-900 dark:text-charcoal-100 hover:bg-white dark:hover:bg-charcoal-700 transition-colors z-10"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm shadow-lg text-sm font-medium text-charcoal-900 dark:text-charcoal-100 z-10 pointer-events-none">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {connectionStatus !== 'connected' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4"
                >
                  <div className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl',
                    connectionStatus === 'connecting' && 'bg-blue-500/90 text-white',
                    connectionStatus === 'reconnecting' && 'bg-amber-500/90 text-white',
                    connectionStatus === 'disconnected' && 'bg-red-500/90 text-white'
                  )}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {connectionStatus === 'connecting' && 'Connecting…'}
                    {connectionStatus === 'reconnecting' && 'Reconnecting…'}
                    {connectionStatus === 'disconnected' && 'Connection lost'}
                  </div>
                </motion.div>
              )}

              {room.controlMode === 'host' && !currentUser?.isHost && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed top-16 right-4 z-30 px-4"
                >
                  <div className="bg-charcoal-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-charcoal-900 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    Following {participants.find(p => p.isHost)?.displayName || 'host'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Toolbar
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              onPageInput={handlePageInput}
              canGoPrevious={canGoPrevious && !isHostControl}
              canGoNext={canGoNext && !isHostControl}
            />

            <AnnotationToolbar />
          </main>

          <BottomSheet
            isOpen={showMoreSheet}
            onClose={() => setShowMoreSheet(false)}
            title="More Options"
            snapPoints={[0.4, 0.6]}
          >
            <div className="space-y-1">
              {moreSheetItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowMoreSheet(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left',
                    'hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors',
                    item.destructive && 'text-red-600 dark:text-red-400'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </BottomSheet>

          <BottomSheet
            isOpen={activeBottomSheet === 'reading-mode'}
            onClose={closeBottomSheet}
            title="Reading Mode"
            snapPoints={[0.4]}
          >
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'dark', 'sepia'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    useReaderStore.getState().setReadingMode(mode)
                    useRoomStore.getState().setReadingMode(mode)
                    socketService.updateSettings({ readingMode: mode })
                    closeBottomSheet()
                  }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all',
                    readingMode === mode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-charcoal-200 dark:border-charcoal-700'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-lg mx-auto mb-2', {
                    'bg-white border border-charcoal-200': mode === 'light',
                    'bg-charcoal-900': mode === 'dark',
                    'bg-paper-sepia border border-charcoal-200': mode === 'sepia',
                  })} />
                  <span className="text-sm font-medium capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </BottomSheet>
        </>
      )}
    </div>
  )
}