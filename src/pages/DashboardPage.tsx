import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Copy, Trash2, ExternalLink, Sparkles, LayoutGrid } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { formatTimeAgo } from '@/lib/utils'

interface RecentBoard {
  id: string
  title: string
  createdAt: string
  activeUsers: number
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [joinId, setJoinId] = useState('')
  const [recentBoards] = useState<RecentBoard[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreate = async () => {
    const res = await api.createBoard()
    if (res.success && res.data) {
      toast.success('Board created!')
      navigate(`/board/${res.data.boardId}`)
    } else {
      toast.error('Failed to create board')
    }
  }

  const handleJoin = () => {
    const input = joinId.trim()
    if (!input) {
      toast.error('Please enter a board ID or link')
      return
    }

    // Handle full URL paste
    if (input.includes('/board/')) {
      const id = input.split('/board/').pop()?.split('?')[0].split('#')[0]
      if (id) {
        navigate(`/board/${id}`)
        return
      }
    }

    // Handle direct ID
    navigate(`/board/${input}`)
  }

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/board/${id}`)
    toast.success('Link copied!')
  }

  const filtered = recentBoards.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="mb-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-4">
            <Sparkles className="h-3 w-3" />
            Workspace
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="shiny-text">Your Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The space where your ideas come to life. Start a new canvas or join your team.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/10"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
              <Plus className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">New Canvas</h3>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Create a fresh whiteboard and start collaborating with your team in real-time.
              </p>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                className="glow-btn w-full flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create New Board
              </motion.button>
            </div>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/10"
          >
            <div className="relative z-10">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ExternalLink className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Join by ID</h3>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Enter a board ID or paste a share link to jump straight into an existing session.
              </p>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter Board ID or Link..."
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    className="h-12 w-full rounded-2xl border border-border bg-surface-1 pl-11 pr-4 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoin}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-6 py-3.5 text-sm font-bold hover:bg-surface-2 hover:border-accent/50 transition-all cursor-pointer"
                >
                  Join via ID
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Boards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-accent" />
              </div>
              Recent Canvases
            </h2>
            {recentBoards.length > 0 && (
              <div className="relative min-w-[300px]">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search your boards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all"
                />
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            /* Empty State */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-border bg-surface-1 dot-grid py-24 px-6 text-center"
            >
              <div className="mb-8 relative">
                <div className="absolute -inset-4 rounded-full bg-accent/20 blur-2xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-accent/10 shadow-2xl">
                  <Sparkles className="h-12 w-12 text-accent" />
                </div>
              </div>
              <h3 className="mb-3 text-2xl font-bold">No active boards found</h3>
              <p className="mb-10 text-muted-foreground max-w-md mx-auto">
                Your workspace is empty. Create your first board to start collaborating with others in real-time.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreate}
                className="flex items-center gap-3 rounded-2xl bg-accent px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-accent/20 hover:bg-accent-hover transition-all cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                Start Your First Canvas
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((board, i) => (
                <motion.div key={board.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                  className="group relative rounded-3xl border border-border bg-card p-6 transition-all hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1.5"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg truncate group-hover:text-accent transition-colors mb-1">{board.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                        {formatTimeAgo(board.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-success/10 text-[10px] font-bold text-success uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                      {board.activeUsers} Live
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <button onClick={() => navigate(`/board/${board.id}`)}
                      className="flex-[2] rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-hover shadow-lg shadow-accent/10 transition-all cursor-pointer">
                      Open Canvas
                    </button>
                    <button onClick={() => copyLink(board.id)}
                      className="flex-1 flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-all cursor-pointer">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex-1 flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
