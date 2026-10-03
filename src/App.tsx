import { useCallback, useEffect, useRef, useState } from 'react'
import type Konva from 'konva'
import { useStore } from './store/useStore'
import { DrawCanvas } from './components/DrawCanvas'
import { Toolbar } from './components/Toolbar'
import { TopBar } from './components/TopBar'
import { SettingsBar } from './components/SettingsBar'
import { LayerPanel } from './components/LayerPanel'
import type { Tool } from './types'

const SHORTCUT_MAP: Record<string, Tool> = {
  v: 'select',
  h: 'pan',
  p: 'pen',
  e: 'eraser',
  l: 'line',
  a: 'arrow',
  r: 'rectangle',
  c: 'circle',
  t: 'triangle',
  s: 'star',
  d: 'diamond',
  x: 'text',
  n: 'sticky',
}

export default function App() {
  const store = useStore()
  const { state, dispatch, undo, redo, deleteSelected } = store
  const stageRef = useRef<Konva.Stage>(null)
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if (ctrl && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected()
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        dispatch({ type: 'SET_TOOL', tool: 'pan' })
        return
      }

      const tool = SHORTCUT_MAP[e.key.toLowerCase()]
      if (tool && !ctrl) {
        dispatch({ type: 'SET_TOOL', tool })
      }
    },
    [undo, redo, deleteSelected, dispatch],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [state.darkMode])

  return (
    <div className={`w-screen h-screen overflow-hidden relative ${state.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <TopBar store={store} stageRef={stageRef} />
      <Toolbar store={store} />
      <DrawCanvas store={store} stageRef={stageRef} width={size.width} height={size.height} />
      <SettingsBar store={store} />
      <LayerPanel store={store} />
    </div>
  )
}
