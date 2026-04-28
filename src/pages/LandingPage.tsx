import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Users, Shield, Layers, Clock, ChevronDown, Sparkles, Share2, Eye, MousePointerClick } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import DotGrid from '@/components/ui/DotGrid'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { useThemeStore } from '@/stores/themeStore'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const } }),
}

const features = [
  { icon: Zap, title: 'Instant Creation', desc: 'No signup. Click create, get a board, share the link.', gradient: 'linear-gradient(135deg,#F59E0B,#F97316)' },
  { icon: Users, title: 'Live Multiplayer', desc: 'See cursors, edits, and collaborators in real-time.', gradient: 'linear-gradient(135deg,#3B82F6,#06B6D4)' },
  { icon: Shield, title: 'Zero Friction', desc: 'Anonymous by design. No accounts, no tracking.', gradient: 'linear-gradient(135deg,#10B981,#14B8A6)' },
  { icon: Layers, title: 'Rich Canvas', desc: 'Shapes, sticky notes, text, freehand drawing toolkit.', gradient: 'linear-gradient(135deg,#8B5CF6,#EC4899)' },
  { icon: Clock, title: 'Ephemeral Sessions', desc: 'Boards auto-delete when everyone leaves.', gradient: 'linear-gradient(135deg,#EF4444,#F43F5E)' },
  { icon: Share2, title: 'One Link Sharing', desc: 'Share a single URL. Anyone joins instantly.', gradient: 'linear-gradient(135deg,#6366F1,#8B5CF6)' },
]

const steps = [
  { num: '01', title: 'Create a Board', desc: 'Click the button. Board ready in milliseconds.', emoji: '🚀' },
  { num: '02', title: 'Share the Link', desc: 'Copy and send the unique URL.', emoji: '🔗' },
  { num: '03', title: 'Collaborate Live', desc: 'Draw, write, brainstorm in real-time.', emoji: '✨' },
  { num: '04', title: 'Auto Cleanup', desc: 'Board disappears when everyone leaves.', emoji: '🧹' },
]

const faqs = [
  { q: 'Do I need an account?', a: 'No. Collabryx is fully anonymous. Just create and share.' },
  { q: 'How long do boards last?', a: 'Boards exist while someone is active. When everyone leaves, it\'s deleted.' },
  { q: 'Is my data stored?', a: 'No. All data is ephemeral. Nothing stored after the session.' },
  { q: 'How many people can join?', a: 'Optimized for teams of up to 20 concurrent users.' },
  { q: 'Can I export my work?', a: 'Yes! Export as JSON or PNG before the session ends.' },
]

// Shared container style for consistent centering
const section = (maxW = 960): React.CSSProperties => ({
  width: '100%', maxWidth: maxW, marginLeft: 'auto', marginRight: 'auto', padding: '0 32px', boxSizing: 'border-box' as const,
})

export default function LandingPage() {
  const navigate = useNavigate()
  const { resolved } = useThemeStore()
  const [joinId, setJoinId] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const isDark = resolved === 'dark'

  const handleCreate = async () => {
    if (creating) return
    setCreating(true)
    const res = await api.createBoard()
    setCreating(false)
    if (res.success && res.data) { toast.success('Board created!'); navigate(`/board/${res.data.boardId}`) }
    else toast.error('Failed to create board')
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', overflowX: 'hidden' }}>
      <Navbar />

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: 96 }}>
        <DotGrid dotSize={isDark ? 3 : 2} gap={isDark ? 28 : 32} baseColor={isDark ? '#1e1e30' : '#d4d4e0'} activeColor={isDark ? '#6366F1' : '#4F46E5'} proximity={140} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', ...section(700) }}>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 32 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.08)', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}>
              <Sparkles style={{ width: 16, height: 16 }} /> Real-time collaborative whiteboard
            </span>
          </motion.div>
          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="shiny-text" style={{ fontSize: 'clamp(48px, 10vw, 96px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Collabryx
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--color-muted-foreground)', marginBottom: 40, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Collaborate instantly. No login. No limits. Create an anonymous whiteboard, share the link, and brainstorm together in real-time.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={creating}
              style={{ display: 'flex', height: 56, alignItems: 'center', gap: 12, borderRadius: 16, background: 'var(--color-accent)', padding: '0 40px', fontSize: 16, fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
              {creating ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><span>Create Board</span><ArrowRight style={{ width: 20, height: 20 }} /></>}
            </motion.button>
            <div style={{ display: 'flex', height: 56, alignItems: 'center', borderRadius: 16, border: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-card) 60%, transparent)', overflow: 'hidden' }}>
              <input type="text" placeholder="Paste board ID..." value={joinId} onChange={e => setJoinId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoin()}
                style={{ height: '100%', width: 180, background: 'transparent', border: 'none', padding: '0 20px', fontSize: 14, color: 'var(--color-foreground)', outline: 'none' }} />
              <button onClick={handleJoin} style={{ height: '100%', padding: '0 20px', fontSize: 14, fontWeight: 600, color: 'var(--color-foreground)', background: 'none', borderLeft: '1px solid var(--color-border)', borderTop: 'none', borderBottom: 'none', borderRight: 'none', cursor: 'pointer' }}>Join</button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" style={{ marginTop: 64, borderRadius: 16, border: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-card) 60%, transparent)', padding: 6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', opacity: 0.6 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B', opacity: 0.6 }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E', opacity: 0.6 }} />
              <div style={{ flex: 1, marginLeft: 12, borderRadius: 8, background: 'var(--color-surface-2)', padding: '4px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--color-muted-foreground)', opacity: 0.5 }}>collabryx.app/board/abc-123</span>
              </div>
            </div>
            <div style={{ position: 'relative', height: 220, overflow: 'hidden', borderRadius: 12, background: 'var(--color-surface-1)' }}>
              <DotGrid dotSize={2} gap={20} baseColor={isDark ? '#1a1a2e' : '#e8e8f0'} activeColor="#6366F1" proximity={80} />
              <motion.div animate={{ x: [0, 8, 0], y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', left: '10%', top: '15%', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '12px 24px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>💡 Ideas</p>
              </motion.div>
              <motion.div animate={{ x: [0, -6, 0], y: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', right: '12%', top: '22%', borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '12px 24px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>📝 Notes</p>
              </motion.div>
              <motion.div animate={{ x: [100, 200, 150], y: [70, 120, 85] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute' }}>
                <MousePointerClick style={{ width: 16, height: 16, color: '#3B82F6' }} />
                <span style={{ marginLeft: 2, borderRadius: 4, background: '#3B82F6', padding: '2px 6px', fontSize: 8, fontWeight: 700, color: 'white' }}>Swift</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding: '112px 0' }}>
        <div style={{ ...section(1060), textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-accent)', marginBottom: 12 }}>Features</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Everything you need, nothing you don't</h2>
            <p style={{ color: 'var(--color-muted-foreground)', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', marginBottom: 48 }}>Built for speed, privacy, and seamless collaboration.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{ textAlign: 'left', borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: 28, transition: 'all 0.3s', cursor: 'default' }}
                className="hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20"
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: f.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <f.icon style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-muted-foreground)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding: '112px 0', background: 'var(--color-surface-1)' }}>
        <div style={{ ...section(760), textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-accent)', marginBottom: 12 }}>Process</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>How it works</h2>
            <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 48 }}>Four steps to instant collaboration.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {steps.map((s, i) => (
              <motion.div key={s.num} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 16, textAlign: 'left', borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: 24, transition: 'all 0.3s' }}
                className="hover:border-accent/20"
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Step {s.num}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REAL-TIME ══ */}
      <section style={{ padding: '112px 0' }}>
        <div style={{ ...section(860), textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-accent)', marginBottom: 12 }}>Real-time</span>
            <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Real-time, for real</h2>
            <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 48 }}>Watch cursors move, see edits appear, feel the collaboration.</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-card)', overflow: 'hidden' }}>
            {[
              { icon: Eye, label: 'Live Cursors', value: 'See everyone in real-time', gradient: 'linear-gradient(135deg,#3B82F6,#06B6D4)' },
              { icon: Zap, label: 'Instant Sync', value: 'Every change syncs <50ms', gradient: 'linear-gradient(135deg,#F59E0B,#F97316)' },
              { icon: Users, label: 'Presence', value: 'See who is on the board', gradient: 'linear-gradient(135deg,#10B981,#14B8A6)' },
            ].map((item, i) => (
              <div key={item.label} style={{ padding: 32, borderLeft: i > 0 ? '1px solid var(--color-border)' : 'none', transition: 'background 0.3s' }} className="hover:bg-muted/20">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: item.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  <item.icon style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item.label}</h3>
                <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding: '112px 0', background: 'var(--color-surface-1)' }}>
        <div style={{ ...section(600), textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-accent)', marginBottom: 12 }}>FAQ</span>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 48 }}>Questions & Answers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-card)', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: 20, fontSize: 14, fontWeight: 500, background: 'none', border: 'none', color: 'var(--color-foreground)', cursor: 'pointer', textAlign: 'left' }}>
                  <span>{faq.q}</span>
                  <ChevronDown style={{ width: 16, height: 16, color: 'var(--color-muted-foreground)', flexShrink: 0, marginLeft: 16, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                {openFaq === i && <p style={{ padding: '0 20px 20px', fontSize: 14, color: 'var(--color-muted-foreground)', lineHeight: 1.6 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '112px 0', textAlign: 'center' }}>
        <div style={section(500)}>
          <h2 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16 }}>Ready to collaborate?</h2>
          <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 32 }}>Start a board in seconds. No signup required.</p>
          <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={handleCreate}
            style={{ display: 'inline-flex', height: 56, alignItems: 'center', gap: 12, borderRadius: 16, background: 'var(--color-accent)', padding: '0 40px', fontSize: 16, fontWeight: 600, color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}>
            Create Board <ArrowRight style={{ width: 20, height: 20 }} />
          </motion.button>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '40px 0', textAlign: 'center' }}>
        <div style={section(960)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366F1,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles style={{ width: 14, height: 14, color: 'white' }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Collabryx</span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)' }}>Anonymous real-time collaboration. No accounts. No tracking.</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', opacity: 0.4, marginTop: 12 }}>© {new Date().getFullYear()} Collabryx</p>
        </div>
      </footer>
    </div>
  )
}
