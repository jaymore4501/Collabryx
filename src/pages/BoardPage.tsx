import { useEffect, useCallback, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoardStore } from '@/stores/boardStore'
import { socketService } from '@/services/socket'
import { api } from '@/services/api'
import { toast } from 'sonner'
import ToolSidebar from '@/components/board/ToolSidebar'
import CanvasArea from '@/components/board/CanvasArea'
import RightSidebar from '@/components/board/RightSidebar'
import BoardNavbar from '@/components/board/BoardNavbar'
import type { ToolType } from '@/types'

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBoard, setElements, setLoading, setError, isLoading, error, board } = useBoardStore()
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const loadedRef = useRef<string | null>(null)

  // Load board — only runs when `id` actually changes
  useEffect(() => {
    if (!id) return
    // Prevent double-loading the same board
    if (loadedRef.current === id) return
    loadedRef.current = id

    let cancelled = false

    const loadBoard = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await api.getBoard(id)
        if (cancelled) return

        if (res.success && res.data) {
          setBoard(res.data.board)
          setElements(res.data.elements)
          setError(null)

          // Connect socket & join
          socketService.connect()
          socketService.joinBoard(id)
        } else {
          // Board doesn't exist — but don't redirect immediately,
          // give a small retry window in case it's still being created
          await new Promise(r => setTimeout(r, 500))
          if (cancelled) return

          const retry = await api.getBoard(id)
          if (retry.success && retry.data) {
            setBoard(retry.data.board)
            setElements(retry.data.elements)
            setError(null)
            socketService.connect()
            socketService.joinBoard(id)
          } else {
            navigate('/', { replace: true })
          }
        }
      } catch {
        if (!cancelled) navigate('/', { replace: true })
      }
      if (!cancelled) setLoading(false)
    }

    loadBoard()

    return () => {
      cancelled = true
      if (id) {
        socketService.leaveBoard(id)
      }
      loadedRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip shortcuts when typing in inputs/textareas
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

    const store = useBoardStore.getState()

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (store.selectedElementIds.length > 0) {
        store.selectedElementIds.forEach((eid) => {
          store.deleteElement(eid)
          if (id) socketService.emitDeleteElement(id, eid)
        })
      }
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          store.redo()
        } else {
          store.undo()
        }
        if (id) syncFullState(id)
      }
      if (e.key === 'y') {
        e.preventDefault()
        store.redo()
        if (id) syncFullState(id)
      }
      if (e.key === 'v') { e.preventDefault(); store.duplicateSelected() }
      if (e.key === 'a') { e.preventDefault(); store.selectAll() }
    }

    if (e.key === 'Escape') store.clearSelection()

    // Tool shortcuts
    const toolMap: Record<string, ToolType> = {
      v: 'select', p: 'pen', r: 'rectangle', c: 'circle',
      l: 'line', a: 'arrow', t: 'text', s: 'sticky', e: 'eraser',
    }
    if (!e.ctrlKey && !e.metaKey && toolMap[e.key]) {
      store.setActiveTool(toolMap[e.key])
    }
  }, [id])

  const syncFullState = useCallback((boardId: string) => {
    const elements = useBoardStore.getState().elements
    socketService.emitSyncState(boardId, elements)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (id) socketService.leaveBoard(id)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <div className="absolute inset-2 animate-spin rounded-full border-2 border-purple-400 border-b-transparent" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <BoardNavbar
        boardTitle={board?.title || 'Untitled Board'}
        boardId={id || ''}
        onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
        rightSidebarOpen={rightSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <ToolSidebar />
        <CanvasArea boardId={id || ''} />
        <AnimatePresence>
          {rightSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden shrink-0"
            >
              <RightSidebar boardId={id || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
