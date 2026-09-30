import { create } from 'zustand'
import type { AnnotationType } from '@/types'

interface AnnotationState {
  isEnabled: boolean
  currentTool: AnnotationType | 'eraser' | null
  currentColor: string
  strokeWidth: number
  isDrawing: boolean
  availableColors: string[]
  setEnabled: (enabled: boolean) => void
  setCurrentTool: (tool: AnnotationType | 'eraser' | null) => void
  setCurrentColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setIsDrawing: (drawing: boolean) => void
  reset: () => void
}

const defaultColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#000000', // black
]

export const useAnnotationStore = create<AnnotationState>((set) => ({
  isEnabled: false,
  currentTool: null,
  currentColor: '#ef4444',
  strokeWidth: 3,
  isDrawing: false,
  availableColors: defaultColors,

  setEnabled: (enabled) => set({ isEnabled: enabled, currentTool: enabled ? 'draw' : null }),
  
  setCurrentTool: (currentTool) => set({ currentTool }),
  
  setCurrentColor: (currentColor) => set({ currentColor }),
  
  setStrokeWidth: (strokeWidth) => set({ strokeWidth }),
  
  setIsDrawing: (isDrawing) => set({ isDrawing }),

  reset: () => set({
    isEnabled: false,
    currentTool: null,
    currentColor: '#ef4444',
    strokeWidth: 3,
    isDrawing: false,
  }),
}))
