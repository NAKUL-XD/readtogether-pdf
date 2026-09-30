import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Highlighter, Eraser, X, Palette } from 'lucide-react'
import { useAnnotationStore } from '@/store'
import { Button } from '@/components/ui'
import { cn } from '@/utils'
import { useState } from 'react'

export function AnnotationToolbar() {
  const {
    isEnabled,
    currentTool,
    currentColor,
    availableColors,
    setEnabled,
    setCurrentTool,
    setCurrentColor,
  } = useAnnotationStore()

  const [showColorPicker, setShowColorPicker] = useState(false)

  if (!isEnabled) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
    >
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl border border-charcoal-200 dark:border-charcoal-700 p-3 flex items-center gap-2">
        {/* Draw Tool */}
        <Button
          variant={currentTool === 'draw' ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => setCurrentTool(currentTool === 'draw' ? null : 'draw')}
          aria-label="Draw"
          className="relative"
        >
          <Pencil className="w-5 h-5" />
          {currentTool === 'draw' && (
            <motion.div
              layoutId="activeTool"
              className="absolute inset-0 bg-primary-500/20 rounded-lg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </Button>

        {/* Highlight Tool */}
        <Button
          variant={currentTool === 'highlight' ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => setCurrentTool(currentTool === 'highlight' ? null : 'highlight')}
          aria-label="Highlight"
          className="relative"
        >
          <Highlighter className="w-5 h-5" />
          {currentTool === 'highlight' && (
            <motion.div
              layoutId="activeTool"
              className="absolute inset-0 bg-primary-500/20 rounded-lg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </Button>

        {/* Eraser Tool */}
        <Button
          variant={currentTool === 'eraser' ? 'primary' : 'ghost'}
          size="icon"
          onClick={() => setCurrentTool(currentTool === 'eraser' ? null : 'eraser')}
          aria-label="Eraser"
          className="relative"
        >
          <Eraser className="w-5 h-5" />
          {currentTool === 'eraser' && (
            <motion.div
              layoutId="activeTool"
              className="absolute inset-0 bg-primary-500/20 rounded-lg"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </Button>

        {/* Divider */}
        <div className="w-px h-8 bg-charcoal-200 dark:bg-charcoal-700" />

        {/* Color Picker */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowColorPicker(!showColorPicker)}
            aria-label="Choose color"
            className="relative"
          >
            <div className="w-6 h-6 rounded-full border-2 border-charcoal-300 dark:border-charcoal-600" style={{ backgroundColor: currentColor }} />
          </Button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-charcoal-200 dark:border-charcoal-700 p-3"
              >
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setCurrentColor(color)
                        setShowColorPicker(false)
                      }}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                        currentColor === color
                          ? 'border-primary-500 ring-2 ring-primary-500/50'
                          : 'border-charcoal-300 dark:border-charcoal-600'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-charcoal-200 dark:bg-charcoal-700" />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEnabled(false)}
          aria-label="Close annotations"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  )
}
