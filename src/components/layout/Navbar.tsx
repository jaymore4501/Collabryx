import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (creating) return
    setCreating(true)
    const res = await api.createBoard()
    setCreating(false)
    if (res.success && res.data) {
      toast.success('Board created!')
      navigate(`/board/${res.data.boardId}`)
    } else {
      toast.error('Failed to create board')
    }
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: '16px 24px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '960px',
          height: '56px',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'color-mix(in srgb, var(--color-card) 75%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '0 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
        >
          <div
            style={{
              display: 'flex',
              width: '32px',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}
          >
            <Sparkles style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Collabryx
          </span>
        </button>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          {!isLanding && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={creating}
              style={{
                display: 'flex',
                height: '36px',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent)',
                padding: '0 20px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(99,102,241,0.25)',
              }}
            >
              {creating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Plus style={{ width: 16, height: 16 }} />
                  New Board
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
