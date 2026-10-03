import { useCallback, useReducer, useRef } from 'react'
import type { BackgroundStyle, CanvasState, DrawElement, Layer, Tool } from '../types'
import { v4 as uuid } from 'uuid'

interface AppState {
  tool: Tool
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  fontSize: number
  darkMode: boolean
  background: BackgroundStyle
  canvas: CanvasState
  selectedIds: string[]
}

type Action =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SET_STROKE_COLOR'; color: string }
  | { type: 'SET_FILL_COLOR'; color: string }
  | { type: 'SET_STROKE_WIDTH'; width: number }
  | { type: 'SET_OPACITY'; opacity: number }
  | { type: 'SET_FONT_SIZE'; size: number }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_BACKGROUND'; bg: BackgroundStyle }
  | { type: 'ADD_ELEMENT'; element: DrawElement }
  | { type: 'UPDATE_ELEMENT'; id: string; changes: Partial<DrawElement> }
  | { type: 'DELETE_ELEMENTS'; ids: string[] }
  | { type: 'SET_ELEMENTS'; elements: DrawElement[] }
  | { type: 'SET_SELECTED'; ids: string[] }
  | { type: 'SET_SCALE'; scale: number }
  | { type: 'SET_POSITION'; x: number; y: number }
  | { type: 'ADD_LAYER'; layer: Layer }
  | { type: 'REMOVE_LAYER'; id: string }
  | { type: 'SET_ACTIVE_LAYER'; id: string }
  | { type: 'TOGGLE_LAYER_VISIBLE'; id: string }
  | { type: 'TOGGLE_LAYER_LOCKED'; id: string }
  | { type: 'RENAME_LAYER'; id: string; name: string }
  | { type: 'LOAD_STATE'; state: CanvasState }

const defaultLayer: Layer = { id: 'default', name: 'Layer 1', visible: true, locked: false }

const initialState: AppState = {
  tool: 'pen',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 3,
  opacity: 1,
  fontSize: 18,
  darkMode: false,
  background: 'none',
  canvas: {
    elements: [],
    layers: [defaultLayer],
    activeLayerId: 'default',
    scale: 1,
    position: { x: 0, y: 0 },
  },
  selectedIds: [],
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, tool: action.tool, selectedIds: action.tool !== 'select' ? [] : state.selectedIds }
    case 'SET_STROKE_COLOR':
      return { ...state, strokeColor: action.color }
    case 'SET_FILL_COLOR':
      return { ...state, fillColor: action.color }
    case 'SET_STROKE_WIDTH':
      return { ...state, strokeWidth: action.width }
    case 'SET_OPACITY':
      return { ...state, opacity: action.opacity }
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.size }
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode }
    case 'SET_BACKGROUND':
      return { ...state, background: action.bg }
    case 'ADD_ELEMENT':
      return { ...state, canvas: { ...state.canvas, elements: [...state.canvas.elements, action.element] } }
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.map((el) =>
            el.id === action.id ? { ...el, ...action.changes } : el,
          ),
        },
      }
    case 'DELETE_ELEMENTS':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          elements: state.canvas.elements.filter((el) => !action.ids.includes(el.id)),
        },
        selectedIds: [],
      }
    case 'SET_ELEMENTS':
      return { ...state, canvas: { ...state.canvas, elements: action.elements } }
    case 'SET_SELECTED':
      return { ...state, selectedIds: action.ids }
    case 'SET_SCALE':
      return { ...state, canvas: { ...state.canvas, scale: action.scale } }
    case 'SET_POSITION':
      return { ...state, canvas: { ...state.canvas, position: { x: action.x, y: action.y } } }
    case 'ADD_LAYER': {
      return {
        ...state,
        canvas: {
          ...state.canvas,
          layers: [...state.canvas.layers, action.layer],
          activeLayerId: action.layer.id,
        },
      }
    }
    case 'REMOVE_LAYER': {
      if (state.canvas.layers.length <= 1) return state
      const remaining = state.canvas.layers.filter((l) => l.id !== action.id)
      return {
        ...state,
        canvas: {
          ...state.canvas,
          layers: remaining,
          activeLayerId:
            state.canvas.activeLayerId === action.id ? remaining[0].id : state.canvas.activeLayerId,
          elements: state.canvas.elements.filter((el) => el.layerId !== action.id),
        },
      }
    }
    case 'SET_ACTIVE_LAYER':
      return { ...state, canvas: { ...state.canvas, activeLayerId: action.id } }
    case 'TOGGLE_LAYER_VISIBLE':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          layers: state.canvas.layers.map((l) =>
            l.id === action.id ? { ...l, visible: !l.visible } : l,
          ),
        },
      }
    case 'TOGGLE_LAYER_LOCKED':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          layers: state.canvas.layers.map((l) =>
            l.id === action.id ? { ...l, locked: !l.locked } : l,
          ),
        },
      }
    case 'RENAME_LAYER':
      return {
        ...state,
        canvas: {
          ...state.canvas,
          layers: state.canvas.layers.map((l) =>
            l.id === action.id ? { ...l, name: action.name } : l,
          ),
        },
      }
    case 'LOAD_STATE':
      return { ...state, canvas: action.state, selectedIds: [] }
    default:
      return state
  }
}

export function useStore() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const historyRef = useRef<DrawElement[][]>([])
  const futureRef = useRef<DrawElement[][]>([])

  const pushHistory = useCallback(() => {
    historyRef.current = [...historyRef.current, state.canvas.elements.map((e) => ({ ...e }))]
    if (historyRef.current.length > 100) historyRef.current = historyRef.current.slice(-100)
    futureRef.current = []
  }, [state.canvas.elements])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    futureRef.current = [...futureRef.current, state.canvas.elements.map((e) => ({ ...e }))]
    const prev = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    dispatch({ type: 'SET_ELEMENTS', elements: prev })
  }, [state.canvas.elements])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return
    historyRef.current = [...historyRef.current, state.canvas.elements.map((e) => ({ ...e }))]
    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    dispatch({ type: 'SET_ELEMENTS', elements: next })
  }, [state.canvas.elements])

  const addElement = useCallback(
    (partial: Omit<DrawElement, 'id' | 'layerId'>) => {
      pushHistory()
      const el: DrawElement = { ...partial, id: uuid(), layerId: state.canvas.activeLayerId }
      dispatch({ type: 'ADD_ELEMENT', element: el })
      return el.id
    },
    [pushHistory, state.canvas.activeLayerId],
  )

  const updateElement = useCallback((id: string, changes: Partial<DrawElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, changes })
  }, [])

  const deleteSelected = useCallback(() => {
    if (state.selectedIds.length === 0) return
    pushHistory()
    dispatch({ type: 'DELETE_ELEMENTS', ids: state.selectedIds })
  }, [state.selectedIds, pushHistory])

  const addLayer = useCallback(() => {
    const layer: Layer = {
      id: uuid(),
      name: `Layer ${state.canvas.layers.length + 1}`,
      visible: true,
      locked: false,
    }
    dispatch({ type: 'ADD_LAYER', layer })
  }, [state.canvas.layers.length])

  return {
    state,
    dispatch,
    undo,
    redo,
    addElement,
    updateElement,
    deleteSelected,
    addLayer,
    pushHistory,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  }
}

export type Store = ReturnType<typeof useStore>
