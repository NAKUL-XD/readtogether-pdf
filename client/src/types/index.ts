export interface User {
  id: string
  displayName: string
  avatar?: string
  color: string
  createdAt: Date
  lastSeen: Date
}

export interface Book {
  id: string
  title: string
  fileUrl: string
  fileSize: number
  totalPages: number
  uploadedBy: string
  createdAt: Date
  thumbnailUrl?: string
}

export interface Room {
  id: string
  roomCode: string
  name: string
  bookId: string
  hostId: string
  participants: Participant[]
  controlMode: ControlMode
  lastPage: number
  settings: RoomSettings
  createdAt: Date
  updatedAt: Date
}

export interface Participant {
  userId: string
  displayName: string
  avatar?: string
  color: string
  joinedAt: Date
  currentPage: number
  isOnline: boolean
  isHost: boolean
}

export type ControlMode = 'shared' | 'host'

export interface RoomSettings {
  controlMode: ControlMode
  readingMode: ReadingMode
  showThumbnails: boolean
  enableChat: boolean
  soundEffects: boolean
  pageAnimation: boolean
}

export type ReadingMode = 'light' | 'dark' | 'sepia'

export interface ChatMessage {
  id: string
  roomId: string
  userId: string
  displayName: string
  avatar?: string
  color: string
  message: string
  createdAt: Date
}

export interface Bookmark {
  id: string
  roomId: string
  userId: string
  pageNumber: number
  label?: string
  isShared: boolean
  createdAt: Date
}

export interface Reaction {
  id: string
  roomId: string
  userId: string
  displayName: string
  avatar?: string
  color: string
  type: ReactionType
  createdAt: Date
}

export type ReactionType = 'heart' | 'laugh' | 'thumbsUp' | 'fire' | 'book'

export interface PageChangeEvent {
  roomId: string
  pageNumber: number
  userId: string
  timestamp: number
}

export interface CursorPosition {
  userId: string
  displayName: string
  color: string
  pageNumber: number
  x: number
  y: number
}

// Client to Server events
export interface ClientToServerEvents {
  join_room: (data: JoinRoomData) => void
  leave_room: (data: LeaveRoomData) => void
  page_changed: (data: PageChangeData) => void
  chat_message: (data: ChatMessageData) => void
  reaction: (data: ReactionData) => void
  typing_start: (data: TypingData) => void
  typing_stop: (data: TypingData) => void
  request_sync: (data: RequestSyncData) => void
  update_settings: (data: UpdateSettingsData) => void
  annotation_add: (data: AnnotationData) => void
  annotation_delete: (data: DeleteAnnotationData) => void
}

// Server to Client events
export interface ServerToClientEvents {
  room_state: (data: RoomStateData) => void
  user_joined: (data: UserJoinedData) => void
  user_left: (data: UserLeftData) => void
  page_changed: (data: PageChangeBroadcast) => void
  chat_message: (data: ChatMessage) => void
  reaction: (data: ReactionBroadcast) => void
  user_typing: (data: TypingBroadcast) => void
  settings_changed: (data: SettingsChangedData) => void
  sync_response: (data: SyncResponseData) => void
  error: (data: SocketError) => void
  reconnected: (data: ReconnectedData) => void
  annotation_added: (data: AnnotationBroadcast) => void
  annotation_deleted: (data: AnnotationDeletedBroadcast) => void
}

export interface JoinRoomData {
  roomId: string
  userId: string
  displayName: string
  avatar?: string
}

export interface LeaveRoomData {
  roomId: string
  userId: string
}

export interface PageChangeData {
  roomId: string
  pageNumber: number
  userId: string
}

export interface ChatMessageData {
  roomId: string
  message: string
}

export interface ReactionData {
  roomId: string
  type: ReactionType
}

export interface TypingData {
  roomId: string
  userId: string
}

export interface RequestSyncData {
  roomId: string
}

export interface UpdateSettingsData {
  roomId: string
  settings: Partial<RoomSettings>
}

export interface RoomStateData {
  room: Room
  book: Book
  currentUser: Participant
  messages: ChatMessage[]
  bookmarks: Bookmark[]
}

export interface UserJoinedData {
  participant: Participant
}

export interface UserLeftData {
  userId: string
  displayName: string
}

export interface PageChangeBroadcast {
  pageNumber: number
  userId: string
  displayName: string
  color: string
  animated: boolean
}

export interface ReactionBroadcast {
  userId: string
  displayName: string
  avatar?: string
  color: string
  type: ReactionType
}

export interface TypingBroadcast {
  userId: string
  displayName: string
  isTyping: boolean
}

export interface SettingsChangedData {
  settings: RoomSettings
  changedBy: string
}

export interface SyncResponseData {
  currentPage: number
  controlMode: ControlMode
  hostId: string
}

export interface SocketError {
  code: string
  message: string
}

export interface ReconnectedData {
  roomId: string
  currentPage: number
}

// Annotations
export type AnnotationType = 'draw' | 'highlight'

export interface Point {
  x: number
  y: number
}

export interface Annotation {
  id: string
  roomId: string
  userId: string
  displayName: string
  color: string
  pageNumber: number
  type: AnnotationType
  points: Point[]
  strokeWidth: number
  createdAt: Date
}

export interface AnnotationData {
  roomId: string
  pageNumber: number
  type: AnnotationType
  points: Point[]
  color: string
  strokeWidth: number
}

export interface DeleteAnnotationData {
  roomId: string
  annotationId: string
}

export interface AnnotationBroadcast extends Annotation { }

export interface AnnotationDeletedBroadcast {
  annotationId: string
  userId: string
}
