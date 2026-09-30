import { Fragment, ReactNode, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

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

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative w-full bg-white dark:bg-charcoal-900 rounded-2xl shadow-elevated',
        'border border-charcoal-200/50 dark:border-charcoal-700/50',
        sizes[size],
        'overflow-hidden'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {(title || showCloseButton) && (
        <div className="flex items-start justify-between p-6 border-b border-charcoal-200/50 dark:border-charcoal-700/50">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-charcoal-900 dark:text-charcoal-100">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  )

  const overlay = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal"
      onClick={closeOnOverlayClick ? onClose : undefined}
      aria-hidden="true"
    />
  )

  return createPortal(
    <Fragment>
      {overlay}
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4" onClick={closeOnOverlayClick ? onClose : undefined}>
        <div onClick={(e) => e.stopPropagation()}>{modalContent}</div>
      </div>
    </Fragment>,
    document.body
  )
}

