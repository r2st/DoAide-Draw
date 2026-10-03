export type Tool =
  | 'select'
  | 'pen'
  | 'eraser'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'diamond'
  | 'text'
  | 'sticky'
  | 'pan'

export type BackgroundStyle = 'none' | 'grid' | 'dots'

export interface Point {
  x: number
  y: number
}

export interface DrawElement {
  id: string
  type: Tool
  layerId: string
  x: number
  y: number
  width?: number
  height?: number
  points?: number[]
  text?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  rotation?: number
  fontSize?: number
  scaleX?: number
  scaleY?: number
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
}

export interface CanvasState {
  elements: DrawElement[]
  layers: Layer[]
  activeLayerId: string
  scale: number
  position: Point
}
