import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isChatOpen: boolean
  isParticipantsOpen: boolean
  isSettingsOpen: boolean
  isBookmarksOpen: boolean
  activeBottomSheet: string | null
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleChat: () => void
  setChatOpen: (open: boolean) => void
  toggleParticipants: () => void
  setParticipantsOpen: (open: boolean) => void
  toggleSettings: () => void
  setSettingsOpen: (open: boolean) => void
  toggleBookmarks: () => void
  setBookmarksOpen: (open: boolean) => void
  openBottomSheet: (sheet: string) => void
  closeBottomSheet: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isChatOpen: false,
  isParticipantsOpen: false,
  isSettingsOpen: false,
  isBookmarksOpen: false,
  activeBottomSheet: null,
  toasts: [],

  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, toast.duration ?? 4000)
    }
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),

  toggleParticipants: () => set((state) => ({ isParticipantsOpen: !state.isParticipantsOpen })),
  setParticipantsOpen: (isParticipantsOpen) => set({ isParticipantsOpen }),

  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),

  toggleBookmarks: () => set((state) => ({ isBookmarksOpen: !state.isBookmarksOpen })),
  setBookmarksOpen: (isBookmarksOpen) => set({ isBookmarksOpen }),

  openBottomSheet: (activeBottomSheet) => set({ activeBottomSheet }),
  closeBottomSheet: () => set({ activeBottomSheet: null }),
}))