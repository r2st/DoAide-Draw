import type { Store } from '../store/useStore'

const COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b', '#78716c',
]

const STICKY_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa',
]

interface SettingsBarProps {
  store: Store
}

export function SettingsBar({ store }: SettingsBarProps) {
  const { state, dispatch } = store
  const dark = state.darkMode
  const isShape = ['rectangle', 'circle', 'triangle', 'star', 'diamond'].includes(state.tool)

  return (
    <div
      className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg border
        ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      {/* Stroke Color */}
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Stroke</span>
        <div className="flex gap-0.5">
          {COLORS.map((c) => (
            <button
              key={`s-${c}`}
              onClick={() => dispatch({ type: 'SET_STROKE_COLOR', color: c })}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                state.strokeColor === c ? 'scale-125 border-indigo-500' : dark ? 'border-gray-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={state.strokeColor}
            onChange={(e) => dispatch({ type: 'SET_STROKE_COLOR', color: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 p-0"
          />
        </div>
      </div>

      {/* Fill Color (shapes only) */}
      {isShape && (
        <>
          <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Fill</span>
            <button
              onClick={() => dispatch({ type: 'SET_FILL_COLOR', color: 'transparent' })}
              className={`w-5 h-5 rounded-full border-2 relative overflow-hidden ${
                state.fillColor === 'transparent' ? 'border-indigo-500' : dark ? 'border-gray-600' : 'border-gray-300'
              }`}
            >
              <div className="absolute inset-0 bg-white" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-red-500 rotate-45 origin-center" />
            </button>
            {COLORS.slice(0, 8).map((c) => (
              <button
                key={`f-${c}`}
                onClick={() => dispatch({ type: 'SET_FILL_COLOR', color: c })}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  state.fillColor === c ? 'scale-125 border-indigo-500' : dark ? 'border-gray-600' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={state.fillColor === 'transparent' ? '#ffffff' : state.fillColor}
              onChange={(e) => dispatch({ type: 'SET_FILL_COLOR', color: e.target.value })}
              className="w-5 h-5 rounded cursor-pointer border-0 p-0"
            />
          </div>
        </>
      )}

      {/* Sticky colors */}
      {state.tool === 'sticky' && (
        <>
          <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Color</span>
            {STICKY_COLORS.map((c) => (
              <button
                key={`st-${c}`}
                onClick={() => dispatch({ type: 'SET_FILL_COLOR', color: c })}
                className={`w-5 h-5 rounded border-2 transition-transform ${
                  state.fillColor === c ? 'scale-125 border-indigo-500' : dark ? 'border-gray-600' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </>
      )}

      <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />

      {/* Stroke Width */}
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Size</span>
        <input
          type="range"
          min="1"
          max="20"
          value={state.strokeWidth}
          onChange={(e) => dispatch({ type: 'SET_STROKE_WIDTH', width: Number(e.target.value) })}
          className="w-20 accent-indigo-500"
        />
        <span className={`text-xs w-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{state.strokeWidth}</span>
      </div>

      <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />

      {/* Opacity */}
      <div className="flex items-center gap-1.5">
        <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Opacity</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={state.opacity}
          onChange={(e) => dispatch({ type: 'SET_OPACITY', opacity: Number(e.target.value) })}
          className="w-16 accent-indigo-500"
        />
      </div>

      {/* Font size for text */}
      {(state.tool === 'text' || state.tool === 'sticky') && (
        <>
          <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-1.5">
            <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Font</span>
            <input
              type="range"
              min="10"
              max="72"
              value={state.fontSize}
              onChange={(e) => dispatch({ type: 'SET_FONT_SIZE', size: Number(e.target.value) })}
              className="w-16 accent-indigo-500"
            />
            <span className={`text-xs w-5 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{state.fontSize}</span>
          </div>
        </>
      )}

      {/* Zoom */}
      <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
      <div className="flex items-center gap-1">
        <button
          onClick={() => dispatch({ type: 'SET_SCALE', scale: Math.max(0.1, state.canvas.scale - 0.1) })}
          className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          −
        </button>
        <span className={`text-xs w-10 text-center ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          {Math.round(state.canvas.scale * 100)}%
        </span>
        <button
          onClick={() => dispatch({ type: 'SET_SCALE', scale: Math.min(5, state.canvas.scale + 0.1) })}
          className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
