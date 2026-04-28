import { useRef, useEffect, useCallback } from 'react'

interface Props {
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
  className?: string
}

export default function DotGrid({
  dotSize = 3,
  gap = 28,
  baseColor = '#2a2a3e',
  activeColor = '#6366F1',
  proximity = 120,
  className = '',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef<number>(0)

  const hexToRgb = (hex: string) => {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (!m) return { r: 0, g: 0, b: 0 }
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = wrapper.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)

    const cell = dotSize + gap
    const cols = Math.ceil(rect.width / cell) + 1
    const rows = Math.ceil(rect.height / cell) + 1

    const baseRgb = hexToRgb(baseColor)
    const activeRgb = hexToRgb(activeColor)
    const proxSq = proximity * proximity
    const { x: mx, y: my } = mouseRef.current

    ctx.clearRect(0, 0, rect.width, rect.height)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * cell + cell / 2
        const cy = row * cell + cell / 2

        const dx = cx - mx
        const dy = cy - my
        const distSq = dx * dx + dy * dy

        let r = baseRgb.r, g = baseRgb.g, b = baseRgb.b
        let size = dotSize
        let alpha = 0.4

        if (distSq < proxSq) {
          const dist = Math.sqrt(distSq)
          const t = 1 - dist / proximity
          r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t)
          g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t)
          b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t)
          size = dotSize + t * 2
          alpha = 0.4 + t * 0.6
        }

        ctx.beginPath()
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()
      }
    }
  }, [dotSize, gap, baseColor, activeColor, proximity])

  useEffect(() => {
    const animate = () => {
      draw()
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handleResize = () => draw()
    const ro = new ResizeObserver(handleResize)
    ro.observe(wrapper)
    return () => ro.disconnect()
  }, [draw])

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const rect = wrapper.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div ref={wrapperRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} />
    </div>
  )
}
