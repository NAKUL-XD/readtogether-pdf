import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { generateId, getColorForUser } from '@/utils'

interface UserState {
  user: User | null
  isGuest: boolean
  setUser: (user: User) => void
  createGuestUser: (displayName: string) => User
  updateDisplayName: (name: string) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isGuest: true,

      setUser: (user) => set({ user, isGuest: false }),

      createGuestUser: (displayName) => {
        const id = generateId()
        const user: User = {
          id,
          displayName,
          color: getColorForUser(id),
          createdAt: new Date(),
          lastSeen: new Date(),
        }
        set({ user, isGuest: true })
        return user
      },

      updateDisplayName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, displayName: name } : null,
        })),

      clearUser: () => set({ user: null, isGuest: true }),
    }),
    {
      name: 'readtogether-user',
      partialize: (state) => ({ user: state.user, isGuest: state.isGuest }),
    }
  )
)