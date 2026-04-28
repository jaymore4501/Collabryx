import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Pencil, Square, Circle, Minus, ArrowUpRight,
  Type, StickyNote, Eraser, Bold, Italic, Underline,
} from 'lucide-react'
import { useBoardStore } from '@/stores/boardStore'
import type { ToolType } from '@/types'

const tools: { type: ToolType; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { type: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { type: 'pen', icon: Pencil, label: 'Pen', shortcut: 'P' },
  { type: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { type: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { type: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { type: 'arrow', icon: ArrowUpRight, label: 'Arrow', shortcut: 'A' },
  { type: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { type: 'sticky', icon: StickyNote, label: 'Sticky Note', shortcut: 'S' },
  { type: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
]

const colors = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#FFFFFF',
]

const strokeWidths = [1, 2, 3, 5, 8]

export default function ToolSidebar() {
  const {
    activeTool, setActiveTool, toolColor, setToolColor, toolStrokeWidth, setToolStrokeWidth,
    textFontSize, setTextFontSize, textFontFamily, setTextFontFamily,
    textBold, setTextBold, textItalic, setTextItalic, textUnderline, setTextUnderline,
  } = useBoardStore()
  const [showStrokePanel, setShowStrokePanel] = useState(false)
  const [showTextPanel, setShowTextPanel] = useState(false)

  const needsStroke = ['pen', 'line', 'arrow', 'rectangle', 'circle'].includes(activeTool)
  const needsText = ['text', 'sticky'].includes(activeTool)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 56, flexShrink: 0, borderRight: '1px solid var(--color-border)', background: 'color-mix(in srgb, var(--color-card) 60%, transparent)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 20 }}>
      {/* Tools */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '12px 0' }}>
        {tools.map((tool) => {
          const isActive = activeTool === tool.type
          return (
            <motion.button
              key={tool.type}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { setActiveTool(tool.type); setShowStrokePanel(false); setShowTextPanel(false) }}
              title={`${tool.label} (${tool.shortcut})`}
              style={{
                display: 'flex', width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
                borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-muted-foreground)',
                boxShadow: isActive ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <tool.icon style={{ width: 16, height: 16 }} />
            </motion.button>
          )
        })}
      </div>

      <div style={{ width: 28, height: 1, background: 'var(--color-border)', margin: '4px auto' }} />

      {/* Colors */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 0' }}>
        {colors.map((color) => (
          <motion.button key={color} whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }} onClick={() => setToolColor(color)}
            style={{ width: 20, height: 20, borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: color, outline: toolColor === color ? '2px solid var(--color-foreground)' : 'none', outlineOffset: 2 }}
          />
        ))}
      </div>

      <div style={{ width: 28, height: 1, background: 'var(--color-border)', margin: '4px auto' }} />

      {/* Stroke width */}
      {needsStroke && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
          <button onClick={() => { setShowStrokePanel(!showStrokePanel); setShowTextPanel(false) }} title="Stroke Width"
            style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: showStrokePanel ? 'var(--color-muted)' : 'transparent', color: 'var(--color-muted-foreground)' }}>
            {[1, 2, 4].map(w => <div key={w} style={{ width: 16, height: w, borderRadius: 2, background: 'currentColor' }} />)}
          </button>
          <AnimatePresence>
            {showStrokePanel && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                style={{ position: 'fixed', left: 68, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 4, borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: 160 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, padding: '0 4px' }}>Stroke Width</p>
                {strokeWidths.map(w => (
                  <button key={w} onClick={() => { setToolStrokeWidth(w); setShowStrokePanel(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, padding: '8px 12px', border: 'none', cursor: 'pointer', background: toolStrokeWidth === w ? 'rgba(99,102,241,0.15)' : 'transparent', color: toolStrokeWidth === w ? 'var(--color-accent)' : 'var(--color-foreground)' }}>
                    <div style={{ width: 48, display: 'flex', alignItems: 'center' }}><div style={{ width: '100%', height: w, borderRadius: 999, background: 'currentColor' }} /></div>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}>{w}px</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Text options */}
      {needsText && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
          <button onClick={() => { setShowTextPanel(!showTextPanel); setShowStrokePanel(false) }} title="Text Options"
            style={{ width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: showTextPanel ? 'var(--color-muted)' : 'transparent', color: 'var(--color-muted-foreground)' }}>
            Aa
          </button>
          <AnimatePresence>
            {showTextPanel && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                style={{ position: 'fixed', left: 68, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-card)', padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: 220 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Text Options</p>

                {/* Font Size */}
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-muted-foreground)', display: 'block', marginBottom: 6 }}>Font Size</label>
                  <select title="Font Size" value={textFontSize} onChange={e => setTextFontSize(Number(e.target.value))}
                    style={{ width: '100%', height: 36, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-1)', padding: '0 10px', fontSize: 13, color: 'var(--color-foreground)', outline: 'none', cursor: 'pointer' }}>
                    {[12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </div>

                {/* Style Buttons */}
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-muted-foreground)', display: 'block', marginBottom: 6 }}>Style</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[
                      { icon: Bold, label: 'Bold', active: textBold, toggle: () => setTextBold(!textBold) },
                      { icon: Italic, label: 'Italic', active: textItalic, toggle: () => setTextItalic(!textItalic) },
                      { icon: Underline, label: 'Underline', active: textUnderline, toggle: () => setTextUnderline(!textUnderline) },
                    ].map(s => (
                      <button key={s.label} title={s.label} onClick={s.toggle}
                        style={{ width: 40, height: 40, borderRadius: 10, border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', background: s.active ? 'var(--color-accent)' : 'transparent', color: s.active ? 'white' : 'var(--color-foreground)' }}>
                        <s.icon style={{ width: 16, height: 16 }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label style={{ fontSize: 11, color: 'var(--color-muted-foreground)', display: 'block', marginBottom: 6 }}>Font</label>
                  <select title="Font Family" value={textFontFamily} onChange={e => setTextFontFamily(e.target.value)}
                    style={{ width: '100%', height: 36, borderRadius: 10, border: '1px solid var(--color-border)', background: 'var(--color-surface-1)', padding: '0 10px', fontSize: 13, color: 'var(--color-foreground)', outline: 'none', cursor: 'pointer' }}>
                    {['Inter', 'Arial', 'Georgia', 'Courier New', 'Comic Sans MS'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
