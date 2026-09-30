import { Fragment, ReactNode, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { cn } from '@/utils'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  snapPoints?: number[]
  defaultSnap?: number
  showDragIndicator?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
  defaultSnap = 0.5,
  showDragIndicator = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: BottomSheetProps) {
  if (!isOpen) return null

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose()
    }
  }

  useEffect(() => {
    if (closeOnEscape) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [closeOnEscape])

  const maxHeight = snapPoints[Math.max(...snapPoints.map((_, i) => i))] * 100

  const sheetContent = (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-modal bg-white dark:bg-charcoal-900 rounded-t-2xl',
        'border-t border-charcoal-200/50 dark:border-charcoal-700/50',
        'shadow-elevated max-h-[90vh] flex flex-col',
        'safe-area-bottom'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
    >
      <div className="flex items-center justify-center px-4 py-3 border-b border-charcoal-200/50 dark:border-charcoal-700/50">
        {showDragIndicator && (
          <div className="w-10 h-1 bg-charcoal-300 dark:bg-charcoal-600 rounded-full" aria-hidden="true" />
        )}
        {title && (
          <h2 id="bottom-sheet-title" className="text-lg font-semibold text-charcoal-900 dark:text-charcoal-100 px-4">
            {title}
          </h2>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </motion.div>
  )

  const overlay = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
      onClick={closeOnOverlayClick ? onClose : undefined}
      aria-hidden="true"
    />
  )

  return createPortal(
    <Fragment>
      {overlay}
      <div className="fixed inset-0 z-[55]" onClick={closeOnOverlayClick ? onClose : undefined}>
        <div onClick={(e) => e.stopPropagation()}>{sheetContent}</div>
      </div>
    </Fragment>,
    document.body
  )
}