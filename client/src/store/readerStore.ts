import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReaderState {
  currentPage: number
  totalPages: number
  zoom: number
  targetZoom: number
  isFullscreen: boolean
  isControlsVisible: boolean
  isLoading: boolean
  loadingProgress: number
  error: string | null
  readingMode: 'light' | 'dark' | 'sepia'
  showThumbnails: boolean
  showOutline: boolean
  rotation: number
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setZoom: (zoom: number) => void
  setTargetZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  toggleFullscreen: () => void
  setFullscreen: (fullscreen: boolean) => void
  toggleControls: () => void
  setControlsVisible: (visible: boolean) => void
  setLoading: (loading: boolean) => void
  setLoadingProgress: (progress: number) => void
  setError: (error: string | null) => void
  setReadingMode: (mode: 'light' | 'dark' | 'sepia') => void
  toggleThumbnails: () => void
  setShowThumbnails: (show: boolean) => void
  toggleOutline: () => void
  setShowOutline: (show: boolean) => void
  rotate: (degrees: number) => void
  reset: () => void
}

const initialState = {
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  targetZoom: 1,
  isFullscreen: false,
  isControlsVisible: true,
  isLoading: false,
  loadingProgress: 0,
  error: null,
  readingMode: 'light' as const,
  showThumbnails: false,
  showOutline: false,
  rotation: 0,
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentPage: (page) => set({ currentPage: Math.max(1, Math.min(page, get().totalPages)) }),

      setTotalPages: (totalPages) => set({ totalPages }),

      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(zoom, 3)) }),

      setTargetZoom: (targetZoom) => set({ targetZoom: Math.max(0.5, Math.min(targetZoom, 3)) }),

      zoomIn: () => set((state) => ({ zoom: Math.min(state.zoom + 0.2, 3) })),

      zoomOut: () => set((state) => ({ zoom: Math.max(state.zoom - 0.2, 0.5) })),

      resetZoom: () => set({ zoom: 1, targetZoom: 1 }),

      toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

      setFullscreen: (isFullscreen) => set({ isFullscreen }),

      toggleControls: () => set((state) => ({ isControlsVisible: !state.isControlsVisible })),

      setControlsVisible: (isControlsVisible) => set({ isControlsVisible }),

      setLoading: (isLoading) => set({ isLoading }),

      setLoadingProgress: (loadingProgress) => set({ loadingProgress }),

      setError: (error) => set({ error }),

      setReadingMode: (readingMode) => set({ readingMode }),

      toggleThumbnails: () => set((state) => ({ showThumbnails: !state.showThumbnails })),

      setShowThumbnails: (showThumbnails) => set({ showThumbnails }),

      toggleOutline: () => set((state) => ({ showOutline: !state.showOutline })),

      setShowOutline: (showOutline) => set({ showOutline }),

      rotate: (degrees) =>
        set((state) => ({ rotation: (state.rotation + degrees) % 360 })),

      reset: () => set(initialState),
    }),
    {
      name: 'readtogether-reader',
      partialize: (state) => ({
        zoom: state.zoom,
        readingMode: state.readingMode,
        showThumbnails: state.showThumbnails,
      }),
    }
  )
)