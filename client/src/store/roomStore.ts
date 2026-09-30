import { create } from 'zustand'
import type { Room, Participant, RoomSettings, Book, ChatMessage, Bookmark, ReadingMode, ControlMode, Annotation } from '@/types'

interface RoomState {
  room: Room | null
  book: Book | null
  participants: Participant[]
  currentUser: Participant | null
  messages: ChatMessage[]
  bookmarks: Bookmark[]
  annotations: Annotation[]
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  syncState: 'synced' | 'syncing' | 'out-of-sync'
  unreadCount: number
  setRoom: (room: Room, book: Book, currentUser: Participant) => void
  setParticipants: (participants: Participant[]) => void
  addParticipant: (participant: Participant) => void
  removeParticipant: (userId: string) => void
  updateParticipantPage: (userId: string, page: number) => void
  setCurrentUser: (user: Participant) => void
  setConnectionStatus: (status: RoomState['connectionStatus']) => void
  setSyncState: (state: RoomState['syncState']) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  incrementUnread: () => void
  clearUnread: () => void
  setBookmarks: (bookmarks: Bookmark[]) => void
  addBookmark: (bookmark: Bookmark) => void
  removeBookmark: (bookmarkId: string) => void
  setAnnotations: (annotations: Annotation[]) => void
  addAnnotation: (annotation: Annotation) => void
  removeAnnotation: (annotationId: string) => void
  updateSettings: (settings: Partial<RoomSettings>) => void
  setControlMode: (mode: ControlMode) => void
  setReadingMode: (mode: ReadingMode) => void
  setLastPage: (page: number) => void
  clearRoom: () => void
}

const defaultSettings: RoomSettings = {
  controlMode: 'shared',
  readingMode: 'light',
  showThumbnails: true,
  enableChat: true,
  soundEffects: true,
  pageAnimation: true,
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  book: null,
  participants: [],
  currentUser: null,
  messages: [],
  bookmarks: [],
  annotations: [],
  connectionStatus: 'disconnected',
  syncState: 'synced',
  unreadCount: 0,

  setRoom: (room, book, currentUser) =>
    set({ room, book, currentUser, participants: room.participants, connectionStatus: 'connected', syncState: 'synced' }),

  setParticipants: (participants) => set({ participants }),

  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants.filter((p) => p.userId !== participant.userId), participant],
    })),

  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.userId !== userId),
    })),

  updateParticipantPage: (userId, page) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.userId === userId ? { ...p, currentPage: page } : p
      ),
    })),

  setCurrentUser: (currentUser) => set({ currentUser }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setSyncState: (syncState) => set({ syncState }),

  setMessages: (messages) => set({ messages, unreadCount: 0 }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      unreadCount: state.unreadCount + 1,
    })),

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  clearUnread: () => set({ unreadCount: 0 }),

  setBookmarks: (bookmarks) => set({ bookmarks }),

  addBookmark: (bookmark) =>
    set((state) => ({ bookmarks: [...state.bookmarks, bookmark] })),

  removeBookmark: (bookmarkId) =>
    set((state) => ({ bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId) })),

  setAnnotations: (annotations) => set({ annotations }),

  addAnnotation: (annotation) =>
    set((state) => ({ annotations: [...state.annotations, annotation] })),

  removeAnnotation: (annotationId) =>
    set((state) => ({ annotations: state.annotations.filter((a) => a.id !== annotationId) })),

  updateSettings: (settings) =>
    set((state) => ({
      room: state.room ? { ...state.room, settings: { ...state.room.settings, ...settings } } : null,
    })),

  setControlMode: (controlMode) =>
    set((state) => ({
      room: state.room ? { ...state.room, controlMode } : null,
    })),

  setReadingMode: (readingMode) =>
    set((state) => ({
      room: state.room ? { ...state.room, settings: { ...state.room.settings, readingMode } } : null,
    })),

  setLastPage: (lastPage) =>
    set((state) => ({
      room: state.room ? { ...state.room, lastPage } : null,
    })),

  clearRoom: () =>
    set({
      room: null,
      book: null,
      participants: [],
      currentUser: null,
      messages: [],
      bookmarks: [],
      annotations: [],
      connectionStatus: 'disconnected',
      syncState: 'synced',
      unreadCount: 0,
    }),
}))