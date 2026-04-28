import { create } from 'zustand'
import type {
  Board,
  CanvasElement,
  ToolType,
  CursorPosition,
  ActivityEvent,
  UserSession,
  BoardMetrics,
  ChatMessage,
} from '@/types'
import { generateId } from '@/lib/utils'

interface BoardState {
  /* Board */
  board: Board | null
  isLoading: boolean
  error: string | null

  /* Elements */
  elements: CanvasElement[]
  selectedElementIds: string[]

  /* Tool */
  activeTool: ToolType
  toolColor: string
  toolStrokeWidth: number

  /* Text formatting */
  textFontSize: number
  textFontFamily: string
  textBold: boolean
  textItalic: boolean
  textUnderline: boolean

  /* Canvas */
  stageScale: number
  stagePosition: { x: number; y: number }

  /* Collaboration */
  cursors: CursorPosition[]
  activeUsers: UserSession[]
  activityFeed: ActivityEvent[]
  chatMessages: ChatMessage[]
  metrics: BoardMetrics

  /* History */
  history: CanvasElement[][]
  historyIndex: number

  /* Actions */
  setBoard: (board: Board | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setActiveTool: (tool: ToolType) => void
  setToolColor: (color: string) => void
  setToolStrokeWidth: (width: number) => void
  setTextFontSize: (size: number) => void
  setTextFontFamily: (family: string) => void
  setTextBold: (bold: boolean) => void
  setTextItalic: (italic: boolean) => void
  setTextUnderline: (underline: boolean) => void
  setStageScale: (scale: number) => void
  setStagePosition: (pos: { x: number; y: number }) => void

  /* Element actions */
  setElements: (elements: CanvasElement[]) => void
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, changes: Partial<CanvasElement>) => void
  deleteElement: (id: string) => void
  deleteSelectedElements: () => void
  selectElement: (id: string, multi?: boolean) => void
  clearSelection: () => void
  selectAll: () => void
  duplicateSelected: () => void
  clearBoard: () => void

  /* Collaboration actions */
  setCursors: (cursors: CursorPosition[]) => void
  setActiveUsers: (users: UserSession[]) => void
  addActivityEvent: (event: ActivityEvent) => void
  addChatMessage: (msg: ChatMessage) => void
  setMetrics: (metrics: Partial<BoardMetrics>) => void

  /* History */
  pushHistory: () => void
  undo: () => void
  redo: () => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  isLoading: false,
  error: null,
  elements: [],
  selectedElementIds: [],
  activeTool: 'select',
  toolColor: '#6366F1',
  toolStrokeWidth: 2,
  textFontSize: 18,
  textFontFamily: 'Inter',
  textBold: false,
  textItalic: false,
  textUnderline: false,
  stageScale: 1,
  stagePosition: { x: 0, y: 0 },
  cursors: [],
  activeUsers: [],
  activityFeed: [],
  chatMessages: [],
  metrics: { activeUsers: 0, totalElements: 0, editsPerSecond: 0, sessionDuration: 0 },
  history: [],
  historyIndex: -1,

  setBoard: (board) => set({ board }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setToolColor: (toolColor) => set({ toolColor }),
  setToolStrokeWidth: (toolStrokeWidth) => set({ toolStrokeWidth }),
  setTextFontSize: (textFontSize) => set({ textFontSize }),
  setTextFontFamily: (textFontFamily) => set({ textFontFamily }),
  setTextBold: (textBold) => set({ textBold }),
  setTextItalic: (textItalic) => set({ textItalic }),
  setTextUnderline: (textUnderline) => set({ textUnderline }),
  setStageScale: (stageScale) => set({ stageScale }),
  setStagePosition: (stagePosition) => set({ stagePosition }),

  setElements: (elements) => set({ elements }),

  addElement: (element) => {
    set((state) => ({ elements: [...state.elements, element] }))
    get().pushHistory()
  },

  updateElement: (id, changes) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...changes, updatedAt: new Date().toISOString() } : el
      ),
    }))
  },

  deleteElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementIds: state.selectedElementIds.filter((sid) => sid !== id),
    }))
    get().pushHistory()
  },

  deleteSelectedElements: () => {
    const { selectedElementIds } = get()
    set((state) => ({
      elements: state.elements.filter((el) => !selectedElementIds.includes(el.id)),
      selectedElementIds: [],
    }))
    get().pushHistory()
  },

  selectElement: (id, multi = false) => {
    set((state) => {
      if (multi) {
        const exists = state.selectedElementIds.includes(id)
        return {
          selectedElementIds: exists
            ? state.selectedElementIds.filter((sid) => sid !== id)
            : [...state.selectedElementIds, id],
        }
      }
      return { selectedElementIds: [id] }
    })
  },

  clearSelection: () => set({ selectedElementIds: [] }),
  selectAll: () => set((state) => ({ selectedElementIds: state.elements.map((el) => el.id) })),

  duplicateSelected: () => {
    const { selectedElementIds, elements } = get()
    const newElements = elements
      .filter((el) => selectedElementIds.includes(el.id))
      .map((el) => ({
        ...el,
        id: generateId(),
        x: el.x + 20,
        y: el.y + 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    set((state) => ({
      elements: [...state.elements, ...newElements],
      selectedElementIds: newElements.map((el) => el.id),
    }))
    get().pushHistory()
  },

  clearBoard: () => {
    set({ elements: [], selectedElementIds: [] })
    get().pushHistory()
  },

  setCursors: (cursors) => set({ cursors }),
  setActiveUsers: (activeUsers) => set({ activeUsers }),

  addActivityEvent: (event) => {
    set((state) => ({
      activityFeed: [event, ...state.activityFeed].slice(0, 50),
    }))
  },

  addChatMessage: (msg) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, msg].slice(-100),
    }))
  },

  setMetrics: (metrics) => {
    set((state) => ({ metrics: { ...state.metrics, ...metrics } }))
  },

  pushHistory: () => {
    const { elements, history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...elements])
    set({ history: newHistory.slice(-50), historyIndex: newHistory.length - 1 })
  },

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({ elements: [...history[newIndex]], historyIndex: newIndex })
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({ elements: [...history[newIndex]], historyIndex: newIndex })
    }
  },
}))
