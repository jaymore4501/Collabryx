import { io, type Socket } from 'socket.io-client'
import { SocketEvent } from '@/types'
import type { CanvasElement, CursorPosition, ActivityEvent, UserSession } from '@/types'
import { useBoardStore } from '@/stores/boardStore'
import { generateUsername, generateColor, generateId } from '@/lib/utils'

class SocketService {
  private socket: Socket | null = null
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private _sessionId: string = generateId()
  private _username: string = generateUsername()
  private _color: string = generateColor()

  get sessionId() { return this._sessionId }
  get username() { return this._username }
  set username(name: string) { this._username = name }
  get color() { return this._color }
  set color(c: string) { this._color = c }

  connect() {
    if (this.socket?.connected) return

    this.socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('[Collabryx] Connected to server')
    })

    this.socket.on('disconnect', () => {
      console.log('[Collabryx] Disconnected from server')
      this.stopHeartbeat()
    })

    this.socket.on('connect_error', (err) => {
      console.warn('[Collabryx] Connection error:', err.message)
    })

    this.setupListeners()
  }

  private setupListeners() {
    if (!this.socket) return

    this.socket.on(SocketEvent.BOARD_STATE, (data: { elements: CanvasElement[]; users: UserSession[] }) => {
      useBoardStore.getState().setElements(data.elements)
      useBoardStore.getState().setActiveUsers(data.users)
      useBoardStore.getState().setMetrics({ activeUsers: data.users.length, totalElements: data.elements.length })
    })

    this.socket.on(SocketEvent.ADD_ELEMENT, (element: CanvasElement) => {
      const store = useBoardStore.getState()
      const exists = store.elements.find((el) => el.id === element.id)
      if (!exists) {
        store.setElements([...store.elements, element])
        store.setMetrics({ totalElements: store.elements.length + 1 })
      }
    })

    this.socket.on(SocketEvent.UPDATE_ELEMENT, (data: { elementId: string; changes: Partial<CanvasElement> }) => {
      useBoardStore.getState().updateElement(data.elementId, data.changes)
    })

    this.socket.on(SocketEvent.DELETE_ELEMENT, (data: { elementId: string }) => {
      const store = useBoardStore.getState()
      store.setElements(store.elements.filter((el) => el.id !== data.elementId))
    })

    this.socket.on(SocketEvent.CLEAR_BOARD, () => {
      useBoardStore.getState().setElements([])
    })

    // Full state sync (for undo/redo)
    this.socket.on('SYNC_STATE', (data: { elements: CanvasElement[] }) => {
      useBoardStore.getState().setElements(data.elements)
      useBoardStore.getState().setMetrics({ totalElements: data.elements.length })
    })

    this.socket.on(SocketEvent.CURSORS_UPDATE, (cursors: CursorPosition[]) => {
      useBoardStore.getState().setCursors(cursors.filter((c) => c.sessionId !== this._sessionId))
    })

    this.socket.on(SocketEvent.PRESENCE_UPDATE, (users: UserSession[]) => {
      useBoardStore.getState().setActiveUsers(users)
      useBoardStore.getState().setMetrics({ activeUsers: users.length })
    })

    this.socket.on(SocketEvent.ACTIVITY_EVENT, (event: ActivityEvent) => {
      useBoardStore.getState().addActivityEvent(event)
    })

    this.socket.on(SocketEvent.USER_JOINED, (data: { username: string; color: string }) => {
      useBoardStore.getState().addActivityEvent({
        id: generateId(),
        message: `${data.username} joined the board`,
        username: data.username,
        color: data.color,
        timestamp: new Date().toISOString(),
        type: 'join',
      })
    })

    this.socket.on(SocketEvent.USER_LEFT, (data: { username: string; color: string }) => {
      useBoardStore.getState().addActivityEvent({
        id: generateId(),
        message: `${data.username} left the board`,
        username: data.username,
        color: data.color,
        timestamp: new Date().toISOString(),
        type: 'leave',
      })
    })

    this.socket.on(SocketEvent.BOARD_DELETED, () => {
      window.location.href = '/'
    })

    // Live chat
    this.socket.on('CHAT_MESSAGE', (msg: { id: string; message: string; username: string; color: string; sessionId: string; timestamp: string }) => {
      useBoardStore.getState().addChatMessage(msg)
    })
  }

  joinBoard(boardId: string) {
    this.socket?.emit(SocketEvent.JOIN_BOARD, {
      boardId,
      sessionId: this._sessionId,
      username: this._username,
      color: this._color,
    })
    this.startHeartbeat(boardId)
  }

  leaveBoard(boardId: string) {
    this.socket?.emit(SocketEvent.LEAVE_BOARD, { boardId, sessionId: this._sessionId })
    this.stopHeartbeat()
  }

  emitCursorMove(boardId: string, x: number, y: number) {
    this.socket?.volatile.emit(SocketEvent.CURSOR_MOVE, {
      boardId,
      sessionId: this._sessionId,
      username: this._username,
      color: this._color,
      x,
      y,
    })
  }

  emitAddElement(boardId: string, element: CanvasElement) {
    this.socket?.emit(SocketEvent.ADD_ELEMENT, { boardId, element })
  }

  emitUpdateElement(boardId: string, elementId: string, changes: Partial<CanvasElement>) {
    this.socket?.emit(SocketEvent.UPDATE_ELEMENT, { boardId, elementId, changes })
  }

  emitDeleteElement(boardId: string, elementId: string) {
    this.socket?.emit(SocketEvent.DELETE_ELEMENT, { boardId, elementId })
  }

  emitClearBoard(boardId: string) {
    this.socket?.emit(SocketEvent.CLEAR_BOARD, { boardId })
  }

  emitSyncState(boardId: string, elements: CanvasElement[]) {
    this.socket?.emit('SYNC_STATE', { boardId, elements })
  }

  emitActivityEvent(boardId: string, event: ActivityEvent) {
    this.socket?.emit(SocketEvent.ACTIVITY_EVENT, { boardId, event })
  }

  emitUpdateUsername(boardId: string, newUsername: string) {
    this.socket?.emit('UPDATE_USERNAME', {
      boardId,
      sessionId: this._sessionId,
      username: newUsername,
    })
  }

  emitChatMessage(boardId: string, message: string) {
    this.socket?.emit('CHAT_MESSAGE', { boardId, message })
  }

  private startHeartbeat(boardId: string) {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      this.socket?.emit(SocketEvent.HEARTBEAT, { boardId, sessionId: this._sessionId })
    }, 10000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect() {
    this.stopHeartbeat()
    this.socket?.disconnect()
    this.socket = null
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()
