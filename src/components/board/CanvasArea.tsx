import { useRef, useCallback, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Line, Arrow, Text, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import { useBoardStore } from '@/stores/boardStore'
import { socketService } from '@/services/socket'
import { generateId } from '@/lib/utils'
import type { CanvasElement, CursorPosition } from '@/types'

interface Props {
  boardId: string
}

export default function CanvasArea({ boardId }: Props) {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    elements, selectedElementIds, activeTool, toolColor, toolStrokeWidth,
    stageScale, stagePosition, cursors,
    addElement, updateElement, selectElement, clearSelection,
    setStageScale, setStagePosition, deleteElement, setActiveTool,
  } = useBoardStore()

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState<number[]>([])
  const [newShapeStart, setNewShapeStart] = useState<{ x: number; y: number } | null>(null)
  const [tempElement, setTempElement] = useState<Partial<CanvasElement> | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })

  // Inline text editing state
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingPos, setEditingPos] = useState({ x: 0, y: 0, width: 200, height: 100 })

  // Resize observer for container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(container)
    setContainerSize({ width: container.offsetWidth, height: container.offsetHeight })
    return () => observer.disconnect()
  }, [])

  const getPointerPos = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const pos = stage.getPointerPosition()
    if (!pos) return { x: 0, y: 0 }
    return {
      x: (pos.x - stagePosition.x) / stageScale,
      y: (pos.y - stagePosition.y) / stageScale,
    }
  }, [stageScale, stagePosition])

  // ── Save text being edited ──
  const finishTextEditing = useCallback(() => {
    if (!editingElementId) return
    const text = editingText.trim() || 'Text'
    updateElement(editingElementId, { text })
    socketService.emitUpdateElement(boardId, editingElementId, { text })
    setEditingElementId(null)
    setEditingText('')
  }, [editingElementId, editingText, boardId, updateElement])

  // ── Double-click to edit text/sticky ──
  const handleElementDblClick = useCallback((el: CanvasElement) => {
    if (el.type !== 'text' && el.type !== 'sticky') return

    const stage = stageRef.current
    if (!stage) return

    setEditingElementId(el.id)
    setEditingText(el.text || '')

    // Calculate screen position of the element
    const stageBox = stage.container().getBoundingClientRect()
    const elX = el.x * stageScale + stagePosition.x + stageBox.left
    const elY = el.y * stageScale + stagePosition.y + stageBox.top

    if (el.type === 'sticky') {
      setEditingPos({
        x: elX + 12 * stageScale,
        y: elY + 12 * stageScale,
        width: ((el.width || 200) - 24) * stageScale,
        height: ((el.height || 160) - 24) * stageScale,
      })
    } else {
      setEditingPos({
        x: elX,
        y: elY,
        width: 300 * stageScale,
        height: 40 * stageScale,
      })
    }

    // Focus textarea on next tick
    setTimeout(() => textareaRef.current?.focus(), 10)
  }, [stageScale, stagePosition])

  // ── Mouse down ──
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // If editing text, finish first
    if (editingElementId) {
      finishTextEditing()
      return
    }

    const pos = getPointerPos()

    // Check if clicked on empty space
    const clickedOnEmpty = e.target === e.target.getStage()

    if (activeTool === 'select') {
      if (clickedOnEmpty) clearSelection()
      return
    }

    if (activeTool === 'eraser') {
      setIsDrawing(true)
      return
    }

    // Only create text/sticky on empty space clicks
    if (activeTool === 'text' && clickedOnEmpty) {
      const { textFontSize, textFontFamily, textBold, textItalic, textUnderline } = useBoardStore.getState()
      const fontStyle = [textBold ? 'bold' : '', textItalic ? 'italic' : ''].filter(Boolean).join(' ') || 'normal'
      const el: CanvasElement = {
        id: generateId(), boardId, type: 'text',
        x: pos.x, y: pos.y, text: 'Text',
        fontSize: textFontSize, fontFamily: textFontFamily, fill: toolColor,
        fontStyle, textDecoration: textUnderline ? 'underline' : '',
        draggable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      addElement(el)
      socketService.emitAddElement(boardId, el)
      setActiveTool('select')
      setTimeout(() => handleElementDblClick(el), 50)
      return
    }

    if (activeTool === 'sticky' && clickedOnEmpty) {
      const el: CanvasElement = {
        id: generateId(), boardId, type: 'sticky',
        x: pos.x, y: pos.y, width: 200, height: 160,
        fill: '#FEF3C7', text: 'Type here...', fontSize: 14, fontFamily: 'Inter',
        cornerRadius: 12, draggable: true,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      addElement(el)
      socketService.emitAddElement(boardId, el)
      setActiveTool('select')
      setTimeout(() => handleElementDblClick(el), 50)
      return
    }

    if (activeTool === 'pen') {
      setIsDrawing(true)
      setDrawingPoints([pos.x, pos.y])
      return
    }

    if (['rectangle', 'circle', 'line', 'arrow'].includes(activeTool)) {
      setIsDrawing(true)
      setNewShapeStart(pos)
      return
    }
  }, [activeTool, boardId, toolColor, addElement, clearSelection, getPointerPos, editingElementId, finishTextEditing, setActiveTool, handleElementDblClick])

  // ── Mouse move ──
  const handleMouseMove = useCallback(() => {
    const pos = getPointerPos()
    socketService.emitCursorMove(boardId, pos.x, pos.y)

    if (!isDrawing) return

    if (activeTool === 'pen') {
      setDrawingPoints((prev) => [...prev, pos.x, pos.y])
      return
    }

    if (newShapeStart && ['rectangle', 'circle', 'line', 'arrow'].includes(activeTool)) {
      const w = pos.x - newShapeStart.x
      const h = pos.y - newShapeStart.y
      setTempElement({
        x: newShapeStart.x, y: newShapeStart.y,
        width: w, height: h,
        points: [newShapeStart.x, newShapeStart.y, pos.x, pos.y],
      })
    }
  }, [isDrawing, activeTool, boardId, newShapeStart, getPointerPos])

  // ── Mouse up ──
  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (activeTool === 'pen' && drawingPoints.length > 2) {
      const el: CanvasElement = {
        id: generateId(), boardId, type: 'pen',
        x: 0, y: 0, points: drawingPoints,
        stroke: toolColor, strokeWidth: toolStrokeWidth,
        draggable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      addElement(el)
      socketService.emitAddElement(boardId, el)
      setDrawingPoints([])
      return
    }

    if (newShapeStart && tempElement) {
      const pos = getPointerPos()
      const w = Math.abs(pos.x - newShapeStart.x)
      const h = Math.abs(pos.y - newShapeStart.y)
      if (w < 5 && h < 5) { setNewShapeStart(null); setTempElement(null); return }

      const el: CanvasElement = {
        id: generateId(), boardId,
        type: activeTool as CanvasElement['type'],
        x: Math.min(newShapeStart.x, pos.x),
        y: Math.min(newShapeStart.y, pos.y),
        width: w, height: h,
        points: activeTool === 'line' || activeTool === 'arrow'
          ? [newShapeStart.x, newShapeStart.y, pos.x, pos.y] : undefined,
        fill: activeTool === 'line' || activeTool === 'arrow' ? undefined : toolColor + '30',
        stroke: toolColor, strokeWidth: toolStrokeWidth,
        draggable: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      }
      addElement(el)
      socketService.emitAddElement(boardId, el)
      setNewShapeStart(null)
      setTempElement(null)
    }
  }, [isDrawing, activeTool, boardId, drawingPoints, newShapeStart, tempElement, toolColor, toolStrokeWidth, addElement, getPointerPos])

  // ── Zoom ──
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const oldScale = stageScale
    const pointer = stage.getPointerPosition()!
    const scaleBy = 1.08
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    const clampedScale = Math.max(0.1, Math.min(5, newScale))

    setStageScale(clampedScale)
    setStagePosition({
      x: pointer.x - (pointer.x - stagePosition.x) * (clampedScale / oldScale),
      y: pointer.y - (pointer.y - stagePosition.y) * (clampedScale / oldScale),
    })
  }, [stageScale, stagePosition, setStageScale, setStagePosition])

  // ── Element click ──
  const handleElementClick = useCallback((el: CanvasElement, e?: Konva.KonvaEventObject<MouseEvent>) => {
    if (activeTool === 'eraser') {
      e?.cancelBubble && (e.cancelBubble = true)
      deleteElement(el.id)
      socketService.emitDeleteElement(boardId, el.id)
      return
    }
    if (activeTool === 'select') {
      selectElement(el.id)
    }
  }, [activeTool, boardId, deleteElement, selectElement])

  // ── Eraser on mouse enter (continuous erasing while holding mouse) ──
  const handleElementMouseEnter = useCallback((el: CanvasElement) => {
    if (activeTool === 'eraser' && isDrawing) {
      deleteElement(el.id)
      socketService.emitDeleteElement(boardId, el.id)
    }
  }, [activeTool, isDrawing, boardId, deleteElement])

  // ── Drag end ──
  const handleDragEnd = useCallback((el: CanvasElement, e: Konva.KonvaEventObject<DragEvent>) => {
    const changes = { x: e.target.x(), y: e.target.y() }
    updateElement(el.id, changes)
    socketService.emitUpdateElement(boardId, el.id, changes)
  }, [boardId, updateElement])

  // ── Render elements ──
  const renderElement = (el: CanvasElement) => {
    const isSelected = selectedElementIds.includes(el.id)
    const isBeingEdited = editingElementId === el.id
    const commonProps = {
      draggable: activeTool === 'select' && !isBeingEdited,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) => handleElementClick(el, e),
      onTap: () => handleElementClick(el),
      onDblClick: () => handleElementDblClick(el),
      onDblTap: () => handleElementDblClick(el),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(el, e),
      onMouseEnter: () => handleElementMouseEnter(el),
    }

    switch (el.type) {
      case 'rectangle':
        return (
          <Rect key={el.id} {...commonProps}
            x={el.x} y={el.y} width={el.width || 100} height={el.height || 100}
            fill={el.fill} stroke={isSelected ? '#6366F1' : el.stroke}
            strokeWidth={isSelected ? 2 : el.strokeWidth}
            cornerRadius={8} rotation={el.rotation}
          />
        )
      case 'circle':
        return (
          <Circle key={el.id} {...commonProps}
            x={el.x + (el.width || 50) / 2} y={el.y + (el.height || 50) / 2}
            radius={Math.min(el.width || 50, el.height || 50) / 2}
            fill={el.fill} stroke={isSelected ? '#6366F1' : el.stroke}
            strokeWidth={isSelected ? 2 : el.strokeWidth}
          />
        )
      case 'line':
        return (
          <Line key={el.id} {...commonProps}
            points={el.points || []}
            stroke={isSelected ? '#6366F1' : el.stroke}
            strokeWidth={isSelected ? 2 : el.strokeWidth}
          />
        )
      case 'arrow':
        return (
          <Arrow key={el.id} {...commonProps}
            points={el.points || []}
            stroke={isSelected ? '#6366F1' : el.stroke}
            strokeWidth={isSelected ? 2 : el.strokeWidth}
            fill={el.stroke} pointerLength={10} pointerWidth={10}
          />
        )
      case 'pen':
        return (
          <Line key={el.id} {...commonProps}
            points={el.points || []}
            stroke={isSelected ? '#6366F1' : el.stroke}
            strokeWidth={el.strokeWidth || 2}
            tension={0.5} lineCap="round" lineJoin="round"
          />
        )
      case 'text':
        return (
          <Text key={el.id} {...commonProps}
            x={el.x} y={el.y}
            text={isBeingEdited ? '' : (el.text || 'Text')}
            fontSize={el.fontSize || 18}
            fontFamily={el.fontFamily || 'Inter'}
            fontStyle={el.fontStyle || 'normal'}
            textDecoration={el.textDecoration || ''}
            fill={el.fill || '#E5E7EB'}
            padding={4}
            visible={!isBeingEdited}
          />
        )
      case 'sticky':
        return (
          <Group key={el.id} {...commonProps} x={el.x} y={el.y}>
            <Rect
              width={el.width || 200} height={el.height || 160}
              fill={el.fill || '#FEF3C7'}
              cornerRadius={el.cornerRadius || 12}
              stroke={isSelected ? '#6366F1' : 'rgba(0,0,0,0.08)'}
              strokeWidth={isSelected ? 2 : 1}
              shadowColor="rgba(0,0,0,0.12)" shadowBlur={10} shadowOffsetY={4}
            />
            <Text
              x={12} y={12}
              width={(el.width || 200) - 24}
              height={(el.height || 160) - 24}
              text={isBeingEdited ? '' : (el.text || 'Type here...')}
              fontSize={el.fontSize || 14}
              fontFamily="Inter" fill="#78350F" padding={4}
              visible={!isBeingEdited}
            />
          </Group>
        )
      default:
        return null
    }
  }

  const getCursor = () => {
    if (editingElementId) return 'text'
    if (activeTool === 'select') return 'default'
    if (activeTool === 'eraser') return 'cell'
    return 'crosshair'
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-surface-1 dot-grid"
      style={{ cursor: getCursor() }}
    >
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <Layer>
          {elements.map(renderElement)}

          {/* Drawing preview - pen */}
          {isDrawing && activeTool === 'pen' && drawingPoints.length > 0 && (
            <Line points={drawingPoints} stroke={toolColor} strokeWidth={toolStrokeWidth}
              tension={0.5} lineCap="round" lineJoin="round" opacity={0.7}
            />
          )}

          {/* Drawing preview - shapes */}
          {isDrawing && tempElement && activeTool === 'rectangle' && (
            <Rect x={tempElement.x} y={tempElement.y}
              width={tempElement.width} height={tempElement.height}
              fill={toolColor + '20'} stroke={toolColor} strokeWidth={1} dash={[4, 4]}
            />
          )}
          {isDrawing && tempElement && activeTool === 'circle' && (
            <Circle
              x={(tempElement.x || 0) + (tempElement.width || 0) / 2}
              y={(tempElement.y || 0) + (tempElement.height || 0) / 2}
              radius={Math.min(Math.abs(tempElement.width || 0), Math.abs(tempElement.height || 0)) / 2}
              fill={toolColor + '20'} stroke={toolColor} strokeWidth={1} dash={[4, 4]}
            />
          )}
          {isDrawing && tempElement && activeTool === 'line' && (
            <Line points={tempElement.points || []} stroke={toolColor} strokeWidth={1} dash={[4, 4]} />
          )}
          {isDrawing && tempElement && activeTool === 'arrow' && (
            <Arrow points={tempElement.points || []} stroke={toolColor} strokeWidth={1}
              fill={toolColor} pointerLength={8} pointerWidth={8} dash={[4, 4]}
            />
          )}
        </Layer>

        {/* Cursors Layer */}
        <Layer>
          {cursors.map((cursor: CursorPosition) => (
            <Group key={cursor.sessionId} x={cursor.x} y={cursor.y}>
              <Line
                points={[0, 0, 0, 16, 4, 12, 8, 20, 12, 18, 8, 10, 14, 10]}
                fill={cursor.color} stroke={cursor.color} strokeWidth={0.5} closed
              />
              <Group x={16} y={14}>
                <Rect width={cursor.username.length * 7 + 12} height={20}
                  fill={cursor.color} cornerRadius={6}
                />
                <Text text={cursor.username} fontSize={10} fontFamily="Inter"
                  fill="#FFFFFF" x={6} y={5}
                />
              </Group>
            </Group>
          ))}
        </Layer>
      </Stage>

      {/* ── Inline text editor overlay ── */}
      {editingElementId && (
        <textarea
          ref={textareaRef}
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onBlur={finishTextEditing}
          onKeyDown={(e) => {
            if (e.key === 'Escape') finishTextEditing()
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              finishTextEditing()
            }
          }}
          className="fixed z-50 resize-none border-2 border-accent rounded-lg bg-transparent outline-none"
          style={{
            left: editingPos.x,
            top: editingPos.y,
            width: editingPos.width,
            minHeight: editingPos.height,
            fontSize: `${14 * stageScale}px`,
            fontFamily: 'Inter',
            color: (() => {
              const el = elements.find(e => e.id === editingElementId)
              return el?.type === 'sticky' ? '#78350F' : (el?.fill || '#E5E7EB')
            })(),
            padding: `${4 * stageScale}px`,
            lineHeight: 1.4,
          }}
        />
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-card/90 border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm">
        <button onClick={() => setStageScale(Math.max(0.1, stageScale / 1.2))}
          className="hover:text-foreground transition-colors cursor-pointer">−</button>
        <span className="w-10 text-center">{Math.round(stageScale * 100)}%</span>
        <button onClick={() => setStageScale(Math.min(5, stageScale * 1.2))}
          className="hover:text-foreground transition-colors cursor-pointer">+</button>
      </div>
    </div>
  )
}
