/* ── Board Types ── */
export interface Board {
  _id: string
  title: string
  roomId: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  message: string
  username: string
  color: string
  sessionId: string
  timestamp: string
}

/* ── Element Types ── */
export type ElementType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'pen'

export interface CanvasElement {
  id: string
  boardId: string
  type: ElementType
  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string
  textDecoration?: string
  points?: number[]
  opacity?: number
  cornerRadius?: number
  draggable: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
}

/* ── Session / User Types ── */
export interface UserSession {
  sessionId: string
  boardId: string
  username: string
  color: string
  lastHeartbeat: string
}

export interface CursorPosition {
  sessionId: string
  username: string
  color: string
  x: number
  y: number
}

/* ── Activity Feed ── */
export interface ActivityEvent {
  id: string
  message: string
  username: string
  color: string
  timestamp: string
  type: 'add' | 'update' | 'delete' | 'join' | 'leave' | 'clear' | 'rename'
}

/* ── Tool Types ── */
export type ToolType = 'select' | 'pen' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'eraser'

/* ── Theme ── */
export type ThemeMode = 'light' | 'dark' | 'system'

/* ── Metrics ── */
export interface BoardMetrics {
  activeUsers: number
  totalElements: number
  editsPerSecond: number
  sessionDuration: number
}

/* ── Socket Events ── */
export const SocketEvent = {
  JOIN_BOARD: 'JOIN_BOARD',
  LEAVE_BOARD: 'LEAVE_BOARD',
  CURSOR_MOVE: 'CURSOR_MOVE',
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  CLEAR_BOARD: 'CLEAR_BOARD',
  ACTIVITY_EVENT: 'ACTIVITY_EVENT',
  HEARTBEAT: 'HEARTBEAT',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  BOARD_STATE: 'BOARD_STATE',
  BOARD_DELETED: 'BOARD_DELETED',
  CURSORS_UPDATE: 'CURSORS_UPDATE',
  PRESENCE_UPDATE: 'PRESENCE_UPDATE',
} as const

/* ── API Response ── */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface CreateBoardResponse {
  boardId: string
  roomId: string
  shareUrl: string
}
