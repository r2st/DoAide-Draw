import { useState } from 'react'
import type { Store } from '../store/useStore'

interface LayerPanelProps {
  store: Store
}

export function LayerPanel({ store }: LayerPanelProps) {
  const { state, dispatch, addLayer } = store
  const dark = state.darkMode
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Layers"
        className={`absolute right-3 top-16 z-20 w-9 h-9 flex items-center justify-center rounded-xl shadow-lg border transition-colors
          ${dark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </button>
    )
  }

  return (
    <div
      className={`absolute right-3 top-16 z-20 w-56 rounded-xl shadow-lg border overflow-hidden
        ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className={`flex items-center justify-between px-3 py-2 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
        <span className={`text-xs font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>Layers</span>
        <div className="flex items-center gap-1">
          <button
            onClick={addLayer}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs ${dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            +
          </button>
          <button
            onClick={() => setOpen(false)}
            className={`w-6 h-6 flex items-center justify-center rounded text-xs ${dark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {[...state.canvas.layers].reverse().map((layer) => (
          <div
            key={layer.id}
            onClick={() => dispatch({ type: 'SET_ACTIVE_LAYER', id: layer.id })}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors text-xs
              ${state.canvas.activeLayerId === layer.id
                ? dark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                : dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_LAYER_VISIBLE', id: layer.id }) }}
              className="shrink-0"
              title={layer.visible ? 'Hide' : 'Show'}
            >
              {layer.visible ? '👁' : '🚫'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_LAYER_LOCKED', id: layer.id }) }}
              className="shrink-0"
              title={layer.locked ? 'Unlock' : 'Lock'}
            >
              {layer.locked ? '🔒' : '🔓'}
            </button>
            <span className="flex-1 truncate">{layer.name}</span>
            {state.canvas.layers.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_LAYER', id: layer.id }) }}
                className={`shrink-0 ${dark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
