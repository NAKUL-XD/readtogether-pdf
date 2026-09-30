import { useState, useEffect, ReactNode, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useUIStore, type Toast } from '@/store'
import { cn } from '@/utils'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const ToastItem = forwardRef<HTMLDivElement, { toast: Toast; onClose: (id: string) => void }>(
  ({ toast, onClose }, ref) => {
    const Icon = icons[toast.type]

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 100, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'fixed bottom-6 right-6 z-toast max-w-sm w-full mx-4',
          'bg-white dark:bg-charcoal-900 rounded-xl shadow-elevated border',
          'border-charcoal-200/50 dark:border-charcoal-700/50',
          'overflow-hidden'
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3 p-4">
          <div className={cn('flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', colors[toast.type])}>
            <Icon className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-charcoal-900 dark:text-charcoal-100">{toast.title}</p>
            {toast.message && (
              <p className="mt-0.5 text-sm text-charcoal-500 dark:text-charcoal-400">{toast.message}</p>
            )}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick()
                  onClose(toast.id)
                }}
                className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => onClose(toast.id)}
            className="flex-shrink-0 p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-800 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {toast.duration !== 0 && (
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: toast.duration || 4000, ease: 'linear' }}
            className={cn('h-1', colors[toast.type])}
            aria-hidden="true"
          />
        )}
      </motion.div>
    )
  }
)

ToastItem.displayName = 'ToastItem'

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </AnimatePresence>
  )
}