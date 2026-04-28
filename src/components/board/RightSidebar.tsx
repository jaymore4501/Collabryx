import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Users, Layers, Timer, Download, Image, Trash2, AlertTriangle,
  ChevronDown, ChevronUp, MessageSquare, Send,
} from 'lucide-react'
import { useBoardStore } from '@/stores/boardStore'
import { socketService } from '@/services/socket'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { formatTimeAgo } from '@/lib/utils'

interface Props {
  boardId: string
}

export default function RightSidebar({ boardId }: Props) {
  const { activityFeed, activeUsers, elements, clearBoard, chatMessages } = useBoardStore()
  const [sessionStart] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [expandedSections, setExpandedSections] = useState({
    chat: true,
    activity: false,
    metrics: true,
    exportClear: false,
  })

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000)
    return () => clearInterval(timer)
  }, [sessionStart])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, expandedSections.chat])

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    const msg = chatMessage.trim()
    if (!msg) return
    socketService.emitChatMessage(boardId, msg)
    setChatMessage('')
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const handleExportJson = async () => {
    const res = await api.exportJson(boardId)
    if (res.success && res.data) {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `collabryx-${boardId}.json`; a.click()
      URL.revokeObjectURL(url)
      toast.success('JSON exported!')
    } else toast.error('Export failed')
  }

  const handleExportPng = () => {
    const stageContainer = document.querySelector('.konvajs-content')
    if (!stageContainer) { toast.error('Canvas not found'); return }
    const canvases = stageContainer.querySelectorAll('canvas')
    if (canvases.length === 0) { toast.error('Canvas not found'); return }
    const firstCanvas = canvases[0] as HTMLCanvasElement

    // Export at 2x resolution for high quality
    const scale = 2
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = firstCanvas.width * scale
    exportCanvas.height = firstCanvas.height * scale
    const ctx = exportCanvas.getContext('2d')
    if (!ctx) return

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Fill background
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? '#0F0F14' : '#F8FAFC'
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // Draw all canvas layers scaled up
    ctx.scale(scale, scale)
    canvases.forEach((c) => ctx.drawImage(c as HTMLCanvasElement, 0, 0))

    exportCanvas.toBlob((blob) => {
      if (!blob) { toast.error('Export failed'); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `collabryx-${boardId}.png`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('High quality PNG exported!')
    }, 'image/png', 1.0)
  }

  const handleClearBoard = () => {
    clearBoard()
    socketService.emitClearBoard(boardId)
    toast.success('Board cleared')
    setShowClearConfirm(false)
  }

  const metrics = [
    { icon: Users, label: 'Active Users', value: activeUsers.length, color: '#3B82F6' },
    { icon: Layers, label: 'Elements', value: elements.length, color: '#22C55E' },
    { icon: Timer, label: 'Duration', value: formatDuration(elapsed), color: '#F59E0B' },
  ]

  const sectionHeader = (key: keyof typeof expandedSections, icon: any, label: string) => (
    <button onClick={() => toggleSection(key)}
      style={{
        display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none',
        color: 'var(--color-foreground)', cursor: 'pointer', transition: 'background 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-muted)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {(() => { const I = icon; return <I style={{ width: 15, height: 15, color: 'var(--color-accent)' }} /> })()}
        {label}
      </span>
      {expandedSections[key]
        ? <ChevronUp style={{ width: 14, height: 14, color: 'var(--color-muted-foreground)' }} />
        : <ChevronDown style={{ width: 14, height: 14, color: 'var(--color-muted-foreground)' }} />
      }
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 320, height: '100%', borderLeft: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-card) 50%, transparent)', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>

      {/* ── Live Chat ── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        {sectionHeader('chat', MessageSquare, 'Live Chat')}
        {expandedSections.chat && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 350 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, gap: 8 }}>
                  <MessageSquare style={{ width: 24, height: 24 }} />
                  <p style={{ fontSize: 11 }}>No messages yet</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.sessionId === socketService.sessionId
                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {!isMe && <span style={{ fontSize: 10, fontWeight: 700, color: msg.color }}>{msg.username}</span>}
                        <span style={{ fontSize: 9, color: 'var(--color-muted-foreground)' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{
                        maxWidth: '85%', padding: '8px 12px', borderRadius: 14, fontSize: 12, lineHeight: 1.4,
                        background: isMe ? 'var(--color-accent)' : 'var(--color-surface-1)',
                        color: isMe ? 'white' : 'var(--color-foreground)',
                        borderTopRightRadius: isMe ? 2 : 14,
                        borderTopLeftRadius: isMe ? 14 : 2,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}>
                        {msg.message}
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                style={{
                  flex: 1, height: 36, borderRadius: 10, border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-1)', padding: '0 12px', fontSize: 12, outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
                style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send style={{ width: 14, height: 14 }} />
              </motion.button>
            </form>
          </div>
        )}
      </div>

      {/* ── Activity Feed ── */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        {sectionHeader('activity', Activity, 'Activity Feed')}
        {expandedSections.activity && (
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '0 16px 16px' }}>
            {activityFeed.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '16px 0' }}>No activity yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activityFeed.slice(0, 20).map((event) => (
                  <motion.div key={event.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, borderRadius: 12, background: 'var(--color-surface-1)', padding: 12, transition: 'background 0.2s' }}>
                    <div style={{ marginTop: 2, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'white', backgroundColor: event.color, flexShrink: 0 }}>
                      {event.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 12, lineHeight: 1.4 }}>{event.message}</p>
                      <p style={{ fontSize: 10, color: 'var(--color-muted-foreground)', marginTop: 2 }}>{formatTimeAgo(event.timestamp)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Metrics ── */}
      <div style={{ borderBottom: '1px solid var(--color-border)' }}>
        {sectionHeader('metrics', Activity, 'Metrics')}
        {expandedSections.metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 16px 16px' }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 14, background: 'var(--color-surface-1)', padding: '14px 8px', transition: 'background 0.2s' }}>
                <m.icon style={{ width: 16, height: 16, marginBottom: 6, color: m.color }} />
                <span style={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{m.value}</span>
                <span style={{ fontSize: 10, color: 'var(--color-muted-foreground)', marginTop: 4 }}>{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Online Users ── */}
      <div style={{ borderBottom: '1px solid var(--color-border)', padding: '14px 20px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users style={{ width: 15, height: 15, color: 'var(--color-accent)' }} />
          Online ({activeUsers.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {activeUsers.map((u) => (
            <div key={u.sessionId} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, background: 'var(--color-surface-1)', padding: '10px 14px', transition: 'background 0.2s' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', backgroundColor: u.color }}>
                {u.username.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
            </div>
          ))}
          {activeUsers.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', textAlign: 'center', padding: '8px 0' }}>No users online</p>
          )}
        </div>
      </div>

      {/* ── Export & Clear ── */}
      <div>
        {sectionHeader('exportClear', Download, 'Export & Clear')}
        {expandedSections.exportClear && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px 20px' }}>
            {/* Export JSON */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleExportJson}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, borderRadius: 12, background: 'var(--color-surface-1)', padding: '14px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', color: 'var(--color-foreground)', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-1)')}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download style={{ width: 15, height: 15, color: 'var(--color-accent)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>Export JSON</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>Download board data</div>
              </div>
            </motion.button>

            {/* Export PNG */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleExportPng}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, borderRadius: 12, background: 'var(--color-surface-1)', padding: '14px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', color: 'var(--color-foreground)', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-1)')}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image style={{ width: 15, height: 15, color: '#22C55E' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>Export PNG</div>
                <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>Save as image</div>
              </div>
            </motion.button>

            {/* Clear Board with confirmation */}
            <AnimatePresence mode="wait">
              {!showClearConfirm ? (
                <motion.button key="clear-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearConfirm(true)}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, borderRadius: 12, background: 'var(--color-surface-1)', padding: '14px 16px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', color: 'var(--color-foreground)', transition: 'all 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-1)')}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 style={{ width: 15, height: 15, color: '#EF4444' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, color: '#EF4444' }}>Clear Board</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>Remove all elements</div>
                  </div>
                </motion.button>
              ) : (
                <motion.div key="clear-confirm" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  style={{ borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <AlertTriangle style={{ width: 18, height: 18, color: '#EF4444' }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#EF4444' }}>Are you sure?</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', marginBottom: 14, lineHeight: 1.5 }}>
                    This will permanently delete all elements from the canvas. This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleClearBoard}
                      style={{ flex: 1, height: 36, borderRadius: 10, border: 'none', background: '#EF4444', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      Yes, Clear All
                    </button>
                    <button onClick={() => setShowClearConfirm(false)}
                      style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-1)', color: 'var(--color-foreground)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
