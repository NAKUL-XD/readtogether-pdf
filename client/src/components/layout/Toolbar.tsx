import { ChevronLeft, ChevronRight, Maximize, Minimize, Grid, MessageSquare, Bookmark, MoreHorizontal, RotateCcw, ZoomIn, ZoomOut, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { useReaderStore, useRoomStore, useUIStore, useAnnotationStore } from '@/store'
import { cn } from '@/utils'
import { useKeyboard } from '@/hooks'
import { toolbarAnimation } from '@/animations'

interface ToolbarProps {
  onPreviousPage: () => void
  onNextPage: () => void
  onPageInput: (page: number) => void
  canGoPrevious: boolean
  canGoNext: boolean
}

export function Toolbar({ onPreviousPage, onNextPage, onPageInput, canGoPrevious, canGoNext }: ToolbarProps) {
  const {
    currentPage,
    totalPages,
    zoom,
    isFullscreen,
    isControlsVisible,
    readingMode,
    showThumbnails,
    toggleFullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    setReadingMode,
    setShowThumbnails,
  } = useReaderStore()

  const { isChatOpen, isBookmarksOpen, toggleChat, toggleBookmarks, openBottomSheet } = useUIStore()
  const { room } = useRoomStore()
  const { isEnabled: isAnnotationEnabled, setEnabled: setAnnotationEnabled } = useAnnotationStore()
  const controlMode = room?.controlMode

  useKeyboard({
    ArrowLeft: onPreviousPage,
    ArrowRight: onNextPage,
    ' ': onNextPage,
    Escape: () => isFullscreen && toggleFullscreen(),
    f: toggleFullscreen,
    F: toggleFullscreen,
  })

  return (
    <AnimatePresence>
      {isControlsVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={toolbarAnimation}
          className="toolbar flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Button
                variant="secondary"
                size="icon"
                onClick={onPreviousPage}
                disabled={!canGoPrevious}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </Button>

              <div className="flex-1 flex items-center justify-center">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => onPageInput(parseInt(e.target.value) || 1)}
                  onBlur={(e) => onPageInput(parseInt(e.target.value) || 1)}
                  onKeyDown={(e) => e.key === 'Enter' && onPageInput(parseInt(e.target.value) || 1)}
                  className="w-20 text-center bg-transparent border-none focus:outline-none text-charcoal-900 dark:text-charcoal-100 font-medium"
                  aria-label="Current page"
                />
                <span className="text-charcoal-500 dark:text-charcoal-400 text-sm">/ {totalPages}</span>
              </div>

              <Button
                variant="secondary"
                size="icon"
                onClick={onNextPage}
                disabled={!canGoNext}
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" aria-hidden="true" />
              </Button>
              <span className="w-16 text-center text-sm text-charcoal-500 dark:text-charcoal-400">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetZoom}
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-charcoal-200/50 dark:border-charcoal-700/50">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAnnotationEnabled(!isAnnotationEnabled)}
                className={cn(isAnnotationEnabled && 'text-primary-600 dark:text-primary-400')}
                aria-label="Annotations"
                aria-pressed={isAnnotationEnabled}
              >
                <Pencil className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleChat}
                className={cn(isChatOpen && 'text-primary-600 dark:text-primary-400')}
                aria-label="Chat"
                aria-pressed={isChatOpen}
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBookmarks}
                className={cn(isBookmarksOpen && 'text-primary-600 dark:text-primary-400')}
                aria-label="Bookmarks"
                aria-pressed={isBookmarksOpen}
              >
                <Bookmark className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={cn(showThumbnails && 'text-primary-600 dark:text-primary-400')}
                aria-label="Thumbnails"
                aria-pressed={showThumbnails}
              >
                <Grid className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={readingMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReadingMode(e.target.value as 'light' | 'dark' | 'sepia')}
                className="px-3 py-1.5 text-sm bg-charcoal-100 dark:bg-charcoal-800 border border-charcoal-300 dark:border-charcoal-700 rounded-lg text-charcoal-900 dark:text-charcoal-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-label="Reading mode"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="sepia">Sepia</option>
              </select>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => openBottomSheet('more')}
                aria-label="More options"
              >
                <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

