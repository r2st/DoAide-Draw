import { useCallback, useRef, useState } from 'react'
import { Stage, Layer, Line, Rect, Circle, Arrow, Text, Star, Group, Transformer } from 'react-konva'
import type Konva from 'konva'
import type { Store } from '../store/useStore'
import type { DrawElement, Point } from '../types'
import { trianglePoints, diamondPoints } from '../utils/shapes'

interface DrawCanvasProps {
  store: Store
  stageRef: React.RefObject<Konva.Stage | null>
  width: number
  height: number
}

export function DrawCanvas({ store, stageRef, width, height }: DrawCanvasProps) {
  const { state, dispatch, addElement, updateElement, pushHistory } = store
  const [drawing, setDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  const currentId = useRef<string | null>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const isPanning = useRef(false)
  const lastPanPos = useRef<Point>({ x: 0, y: 0 })

  const dark = state.darkMode
  const activeLayer = state.canvas.layers.find((l) => l.id === state.canvas.activeLayerId)
  const isLocked = activeLayer?.locked ?? false

  const getPointerPos = useCallback((): Point | null => {
    const stage = stageRef.current
    if (!stage) return null
    const pos = stage.getPointerPosition()
    if (!pos) return null
    return {
      x: (pos.x - state.canvas.position.x) / state.canvas.scale,
      y: (pos.y - state.canvas.position.y) / state.canvas.scale,
    }
  }, [state.canvas.position, state.canvas.scale, stageRef])

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (isLocked) return

      if (state.tool === 'pan') {
        isPanning.current = true
        const stage = stageRef.current
        if (!stage) return
        const pos = stage.getPointerPosition()
        if (pos) lastPanPos.current = pos
        return
      }

      if (state.tool === 'select') {
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty) {
          dispatch({ type: 'SET_SELECTED', ids: [] })
        }
        return
      }

      const pos = getPointerPos()
      if (!pos) return

      setDrawing(true)
      setDrawStart(pos)

      if (state.tool === 'pen' || state.tool === 'eraser') {
        const id = addElement({
          type: state.tool,
          x: 0,
          y: 0,
          points: [pos.x, pos.y],
          stroke: state.tool === 'eraser' ? (dark ? '#1f2937' : '#f9fafb') : state.strokeColor,
          strokeWidth: state.tool === 'eraser' ? state.strokeWidth * 3 : state.strokeWidth,
          opacity: state.opacity,
        })
        currentId.current = id
      } else if (state.tool === 'text') {
        const text = prompt('Enter text:')
        if (text) {
          addElement({
            type: 'text',
            x: pos.x,
            y: pos.y,
            text,
            fill: state.strokeColor,
            fontSize: state.fontSize,
            opacity: state.opacity,
          })
        }
        setDrawing(false)
      } else if (state.tool === 'sticky') {
        const text = prompt('Sticky note text:')
        if (text) {
          addElement({
            type: 'sticky',
            x: pos.x,
            y: pos.y,
            width: 200,
            height: 150,
            text,
            fill: state.fillColor === 'transparent' ? '#fef08a' : state.fillColor,
            fontSize: state.fontSize,
            opacity: state.opacity,
          })
        }
        setDrawing(false)
      } else {
        const id = addElement({
          type: state.tool,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          stroke: state.strokeColor,
          fill: state.fillColor,
          strokeWidth: state.strokeWidth,
          opacity: state.opacity,
        })
        currentId.current = id
      }
    },
    [state, dark, isLocked, addElement, dispatch, getPointerPos, stageRef],
  )

  const handleMouseMove = useCallback(() => {
    if (state.tool === 'pan' && isPanning.current) {
      const stage = stageRef.current
      if (!stage) return
      const pos = stage.getPointerPosition()
      if (!pos) return
      const dx = pos.x - lastPanPos.current.x
      const dy = pos.y - lastPanPos.current.y
      lastPanPos.current = pos
      dispatch({
        type: 'SET_POSITION',
        x: state.canvas.position.x + dx,
        y: state.canvas.position.y + dy,
      })
      return
    }

    if (!drawing || !currentId.current || !drawStart) return
    const pos = getPointerPos()
    if (!pos) return

    if (state.tool === 'pen' || state.tool === 'eraser') {
      const el = state.canvas.elements.find((e) => e.id === currentId.current)
      if (el?.points) {
        updateElement(currentId.current, { points: [...el.points, pos.x, pos.y] })
      }
    } else {
      const w = pos.x - drawStart.x
      const h = pos.y - drawStart.y
      updateElement(currentId.current, { width: w, height: h })
    }
  }, [drawing, drawStart, state, getPointerPos, updateElement, dispatch, stageRef])

  const handleMouseUp = useCallback(() => {
    isPanning.current = false
    if (!drawing) return
    setDrawing(false)
    currentId.current = null
    setDrawStart(null)
  }, [drawing])

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const scaleBy = 1.05
      const oldScale = state.canvas.scale
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
      const clamped = Math.max(0.1, Math.min(5, newScale))

      const stage = stageRef.current
      if (!stage) return
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - state.canvas.position.x) / oldScale,
        y: (pointer.y - state.canvas.position.y) / oldScale,
      }

      dispatch({ type: 'SET_SCALE', scale: clamped })
      dispatch({
        type: 'SET_POSITION',
        x: pointer.x - mousePointTo.x * clamped,
        y: pointer.y - mousePointTo.y * clamped,
      })
    },
    [state.canvas.scale, state.canvas.position, dispatch, stageRef],
  )

  const handleSelect = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (state.tool !== 'select') return
      const id = e.target.id()
      if (!id) return
      dispatch({ type: 'SET_SELECTED', ids: [id] })

      setTimeout(() => {
        const node = stageRef.current?.findOne(`#${id}`)
        if (node && trRef.current) {
          trRef.current.nodes([node])
          trRef.current.getLayer()?.batchDraw()
        }
      })
    },
    [state.tool, dispatch, stageRef],
  )

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const id = e.target.id()
      if (!id) return
      pushHistory()
      updateElement(id, { x: e.target.x(), y: e.target.y() })
    },
    [pushHistory, updateElement],
  )

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const id = node.id()
      if (!id) return
      pushHistory()
      updateElement(id, {
        x: node.x(),
        y: node.y(),
        width: (node.attrs.width ?? 0) * node.scaleX(),
        height: (node.attrs.height ?? 0) * node.scaleY(),
        rotation: node.rotation(),
        scaleX: 1,
        scaleY: 1,
      })
      node.scaleX(1)
      node.scaleY(1)
    },
    [pushHistory, updateElement],
  )

  const renderElement = (el: DrawElement) => {
    const layer = state.canvas.layers.find((l) => l.id === el.layerId)
    if (layer && !layer.visible) return null

    const draggable = state.tool === 'select' && !(layer?.locked)
    const common = {
      id: el.id,
      key: el.id,
      draggable,
      opacity: el.opacity ?? 1,
      rotation: el.rotation ?? 0,
      onClick: handleSelect,
      onTap: handleSelect,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
    }

    switch (el.type) {
      case 'pen':
      case 'eraser':
        return (
          <Line
            {...common}
            points={el.points ?? []}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={el.type === 'eraser' ? 'destination-out' : 'source-over'}
          />
        )

      case 'line':
        return (
          <Line
            {...common}
            x={el.x}
            y={el.y}
            points={[0, 0, el.width ?? 0, el.height ?? 0]}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            lineCap="round"
          />
        )

      case 'arrow':
        return (
          <Arrow
            {...common}
            x={el.x}
            y={el.y}
            points={[0, 0, el.width ?? 0, el.height ?? 0]}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fill={el.stroke}
            pointerLength={10}
            pointerWidth={10}
          />
        )

      case 'rectangle':
        return (
          <Rect
            {...common}
            x={el.x}
            y={el.y}
            width={el.width ?? 0}
            height={el.height ?? 0}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fill={el.fill === 'transparent' ? undefined : el.fill}
            cornerRadius={2}
          />
        )

      case 'circle': {
        const rx = Math.abs((el.width ?? 0) / 2)
        const ry = Math.abs((el.height ?? 0) / 2)
        return (
          <Circle
            {...common}
            x={el.x + (el.width ?? 0) / 2}
            y={el.y + (el.height ?? 0) / 2}
            radiusX={rx}
            radiusY={ry}
            radius={Math.max(rx, ry)}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fill={el.fill === 'transparent' ? undefined : el.fill}
          />
        )
      }

      case 'triangle': {
        const w = Math.abs(el.width ?? 0)
        const h = Math.abs(el.height ?? 0)
        const pts = trianglePoints(w, h)
        return (
          <Line
            {...common}
            x={el.width && el.width < 0 ? el.x + el.width : el.x}
            y={el.height && el.height < 0 ? el.y + el.height : el.y}
            points={pts}
            closed
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fill={el.fill === 'transparent' ? undefined : el.fill}
          />
        )
      }

      case 'star': {
        const r = Math.max(Math.abs(el.width ?? 0), Math.abs(el.height ?? 0)) / 2
        return (
          <Star
            {...common}
            x={el.x + (el.width ?? 0) / 2}
            y={el.y + (el.height ?? 0) / 2}
            numPoints={5}
            innerRadius={r * 0.4}
            outerRadius={r}
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fill={el.fill === 'transparent' ? undefined : el.fill}
          />
        )
      }

      case 'diamond': {
        const w = Math.abs(el.width ?? 0)
        const h = Math.abs(el.height ?? 0)
        const pts = diamondPoints(w, h)
        return (
          <Line
            {...common}
            x={el.width && el.width < 0 ? el.x + el.width : el.x}
            y={el.height && el.height < 0 ? el.y + el.height : el.y}
            points={pts}
            closed
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            fill={el.fill === 'transparent' ? undefined : el.fill}
          />
        )
      }

      case 'text':
        return (
          <Text
            {...common}
            x={el.x}
            y={el.y}
            text={el.text ?? ''}
            fill={el.fill ?? el.stroke}
            fontSize={el.fontSize ?? 18}
            fontFamily="Inter, system-ui, sans-serif"
          />
        )

      case 'sticky':
        return (
          <Group {...common} x={el.x} y={el.y}>
            <Rect
              width={el.width ?? 200}
              height={el.height ?? 150}
              fill={el.fill ?? '#fef08a'}
              shadowColor="rgba(0,0,0,0.15)"
              shadowBlur={8}
              shadowOffsetY={2}
              cornerRadius={4}
            />
            <Text
              x={10}
              y={10}
              width={(el.width ?? 200) - 20}
              height={(el.height ?? 150) - 20}
              text={el.text ?? ''}
              fontSize={el.fontSize ?? 14}
              fill="#1f2937"
              fontFamily="Inter, system-ui, sans-serif"
            />
          </Group>
        )

      default:
        return null
    }
  }

  const bgColor = dark ? '#111827' : '#f9fafb'

  const renderBackground = () => {
    if (state.background === 'none') return null

    const gridSize = 30
    const lines: React.ReactNode[] = []
    const startX = -Math.ceil(state.canvas.position.x / state.canvas.scale / gridSize) * gridSize - gridSize * 50
    const startY = -Math.ceil(state.canvas.position.y / state.canvas.scale / gridSize) * gridSize - gridSize * 50
    const endX = startX + (width / state.canvas.scale) + gridSize * 100
    const endY = startY + (height / state.canvas.scale) + gridSize * 100

    if (state.background === 'grid') {
      const color = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
      for (let x = startX; x < endX; x += gridSize) {
        lines.push(
          <Line key={`gv-${x}`} points={[x, startY, x, endY]} stroke={color} strokeWidth={0.5} listening={false} />
        )
      }
      for (let y = startY; y < endY; y += gridSize) {
        lines.push(
          <Line key={`gh-${y}`} points={[startX, y, endX, y]} stroke={color} strokeWidth={0.5} listening={false} />
        )
      }
    } else if (state.background === 'dots') {
      const color = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'
      for (let x = startX; x < endX; x += gridSize) {
        for (let y = startY; y < endY; y += gridSize) {
          lines.push(
            <Circle key={`d-${x}-${y}`} x={x} y={y} radius={1.5} fill={color} listening={false} />
          )
        }
      }
    }

    return lines
  }

  const cursorStyle =
    state.tool === 'pan'
      ? 'grab'
      : state.tool === 'select'
        ? 'default'
        : 'crosshair'

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onWheel={handleWheel}
      scaleX={state.canvas.scale}
      scaleY={state.canvas.scale}
      x={state.canvas.position.x}
      y={state.canvas.position.y}
      style={{ cursor: cursorStyle, background: bgColor }}
    >
      <Layer>
        {renderBackground()}
        {state.canvas.elements.map(renderElement)}
        {state.tool === 'select' && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox
              return newBox
            }}
          />
        )}
      </Layer>
    </Stage>
  )
}
