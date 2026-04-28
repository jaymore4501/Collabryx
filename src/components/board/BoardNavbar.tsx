import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PanelRightClose, PanelRightOpen, Share2, Sparkles, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useBoardStore } from '@/stores/boardStore'
import { socketService } from '@/services/socket'
import { useNavigate } from 'react-router-dom'
import { generateId } from '@/lib/utils'

interface Props {
  boardTitle: string
  boardId: string
  onToggleRightSidebar: () => void
  rightSidebarOpen: boolean
}

export default function BoardNavbar({ boardTitle, boardId, onToggleRightSidebar, rightSidebarOpen }: Props) {
  const activeUsers = useBoardStore((s) => s.activeUsers)
  const board = useBoardStore((s) => s.board)
  const setBoard = useBoardStore((s) => s.setBoard)
  const addActivityEvent = useBoardStore((s) => s.addActivityEvent)
  const navigate = useNavigate()

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(boardTitle)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [editingUsername, setEditingUsername] = useState(false)
  const [usernameValue, setUsernameValue] = useState(socketService.username)
  const usernameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTitleValue(boardTitle) }, [boardTitle])
  useEffect(() => { if (editingTitle && titleInputRef.current) { titleInputRef.current.focus(); titleInputRef.current.select() } }, [editingTitle])
  useEffect(() => { if (editingUsername && usernameInputRef.current) { usernameInputRef.current.focus(); usernameInputRef.current.select() } }, [editingUsername])

  const saveTitle = () => {
    const newTitle = titleValue.trim() || 'Untitled Board'
    setTitleValue(newTitle)
    setEditingTitle(false)
    if (board) setBoard({ ...board, title: newTitle })
    fetch(`/api/board/${boardId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) }).catch(() => {})
    toast.success('Board renamed')
  }

  const saveUsername = () => {
    const oldName = socketService.username
    const newName = usernameValue.trim() || oldName
    setUsernameValue(newName)
    setEditingUsername(false)
    socketService.username = newName

    // Emit activity event for username change
    if (newName !== oldName) {
      const event = {
        id: generateId(),
        message: `${oldName} changed name to ${newName}`,
        username: newName,
        color: socketService.color,
        timestamp: new Date().toISOString(),
        type: 'rename' as const,
      }
      addActivityEvent(event)
      socketService.emitActivityEvent(boardId, event)
      // Update session on server so active users list shows new name
      socketService.emitUpdateUsername(boardId, newName)
      toast.success(`Username changed to ${newName}`)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/board/${boardId}`)
    toast.success('Board link copied!')
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 52, flexShrink: 0,
      borderBottom: '1px solid var(--color-border)',
      background: 'color-mix(in srgb, var(--color-card) 80%, transparent)',
      backdropFilter: 'blur(12px)',
      padding: '0 20px',
    }}>
      {/* ── Left: Logo + Board Name ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <button onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-foreground)', padding: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles style={{ width: 14, height: 14, color: 'white' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Collabryx</span>
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />

        {editingTitle ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input ref={titleInputRef} value={titleValue}
              onChange={e => setTitleValue(e.target.value)} onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(boardTitle) } }}
              style={{ height: 30, width: 180, borderRadius: 8, border: '1px solid var(--color-accent)', background: 'var(--color-surface-1)', padding: '0 10px', fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', outline: 'none' }}
            />
            <button onClick={saveTitle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', padding: 0, display: 'flex' }}>
              <Check style={{ width: 16, height: 16 }} />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingTitle(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--color-foreground)', padding: '4px 8px', borderRadius: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-muted)'; e.currentTarget.style.color = 'var(--color-accent)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-foreground)' }}
          >
            {titleValue}
            <Pencil style={{ width: 12, height: 12, opacity: 0.4 }} />
          </button>
        )}
      </div>

      {/* ── Center: Active Users ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: -4, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {activeUsers.slice(0, 8).map((u, i) => (
          <div key={u.sessionId} title={u.username}
            style={{
              width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, color: 'white', backgroundColor: u.color,
              border: '2px solid var(--color-card)',
              marginLeft: i > 0 ? -6 : 0,
              zIndex: activeUsers.length - i,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            {u.username.slice(0, 2).toUpperCase()}
          </div>
        ))}
        {activeUsers.length > 8 && (
          <div style={{ height: 30, borderRadius: 999, background: 'var(--color-muted)', padding: '0 10px', fontSize: 10, fontWeight: 600, color: 'var(--color-muted-foreground)', display: 'flex', alignItems: 'center', marginLeft: -6 }}>
            +{activeUsers.length - 8}
          </div>
        )}
      </div>

      {/* ── Right: Username + Share + Theme + Sidebar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Editable username */}
        {editingUsername ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input ref={usernameInputRef} value={usernameValue} maxLength={20}
              onChange={e => setUsernameValue(e.target.value)} onBlur={saveUsername}
              onKeyDown={e => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') { setEditingUsername(false); setUsernameValue(socketService.username) } }}
              style={{ height: 32, width: 120, borderRadius: 8, border: '1px solid var(--color-accent)', background: 'var(--color-surface-1)', padding: '0 10px', fontSize: 12, fontWeight: 500, color: 'var(--color-foreground)', outline: 'none' }}
            />
            <button onClick={saveUsername} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent)', padding: 0, display: 'flex' }}>
              <Check style={{ width: 14, height: 14 }} />
            </button>
            <button onClick={() => { setEditingUsername(false); setUsernameValue(socketService.username) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted-foreground)', padding: 0, display: 'flex' }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ) : (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setEditingUsername(true)} title="Click to change username"
            style={{
              display: 'flex', height: 34, alignItems: 'center', gap: 8,
              borderRadius: 10, border: '1px solid var(--color-border)', padding: '0 12px',
              background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              color: 'var(--color-muted-foreground)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = 'var(--color-foreground)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-foreground)' }}
          >
            <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'white', backgroundColor: socketService.color }}>
              {usernameValue.slice(0, 2).toUpperCase()}
            </div>
            {usernameValue}
          </motion.button>
        )}

        {/* Share */}
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={copyLink}
          style={{
            display: 'flex', height: 34, alignItems: 'center', gap: 6,
            borderRadius: 10, background: 'rgba(99,102,241,0.1)', padding: '0 14px',
            border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            color: 'var(--color-accent)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
        >
          <Share2 style={{ width: 14, height: 14 }} />
          Share
        </motion.button>

        <ThemeToggle />

        {/* Sidebar toggle */}
        <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={onToggleRightSidebar}
          style={{
            display: 'flex', width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
            borderRadius: 10, border: '1px solid var(--color-border)', background: 'none',
            cursor: 'pointer', color: 'var(--color-muted-foreground)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = 'var(--color-foreground)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-foreground)' }}
        >
          {rightSidebarOpen ? <PanelRightClose style={{ width: 16, height: 16 }} /> : <PanelRightOpen style={{ width: 16, height: 16 }} />}
        </motion.button>
      </div>
    </div>
  )
}
