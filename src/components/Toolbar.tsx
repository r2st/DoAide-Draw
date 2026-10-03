import type { Tool } from '../types'
import type { Store } from '../store/useStore'

const tools: { id: Tool; label: string; icon: string; shortcut?: string }[] = [
  { id: 'select', label: 'Select', icon: 'M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z', shortcut: 'V' },
  { id: 'pan', label: 'Pan', icon: 'M12 2L12 22M2 12L22 12M7 7L3 3M17 7L21 3M7 17L3 21M17 17L21 21', shortcut: 'H' },
  { id: 'pen', label: 'Pen', icon: 'M12 19l7-7 3 3-7 7-3-3z M18 12l-1.5-1.5M2 22l1-6 13-13 5 5-13 13-6 1z', shortcut: 'P' },
  { id: 'eraser', label: 'Eraser', icon: 'M20 20H7L3 16l10-10 7 7-4 4M14 4l3-3 5 5-3 3', shortcut: 'E' },
  { id: 'line', label: 'Line', icon: 'M5 19L19 5', shortcut: 'L' },
  { id: 'arrow', label: 'Arrow', icon: 'M5 19L19 5M19 5L13 5M19 5L19 11', shortcut: 'A' },
  { id: 'rectangle', label: 'Rectangle', icon: 'M3 5h18v14H3z', shortcut: 'R' },
  { id: 'circle', label: 'Circle', icon: 'M12 3a9 9 0 100 18 9 9 0 000-18z', shortcut: 'C' },
  { id: 'triangle', label: 'Triangle', icon: 'M12 3L22 21H2z', shortcut: 'T' },
  { id: 'star', label: 'Star', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z', shortcut: 'S' },
  { id: 'diamond', label: 'Diamond', icon: 'M12 2l10 10-10 10L2 12z', shortcut: 'D' },
  { id: 'text', label: 'Text', icon: 'M6 4h12M12 4v16M8 20h8', shortcut: 'X' },
  { id: 'sticky', label: 'Sticky Note', icon: 'M4 4h16v12l-4 4H4V4z M16 16v4', shortcut: 'N' },
]

interface ToolbarProps {
  store: Store
}

export function Toolbar({ store }: ToolbarProps) {
  const { state, dispatch } = store
  const dark = state.darkMode

  return (
    <div
      className={`absolute left-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1 p-2 rounded-xl shadow-lg border
        ${dark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => dispatch({ type: 'SET_TOOL', tool: t.id })}
          title={`${t.label}${t.shortcut ? ` (${t.shortcut})` : ''}`}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors
            ${state.tool === t.id
              ? 'bg-indigo-500 text-white'
              : dark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={t.icon} />
          </svg>
        </button>
      ))}
    </div>
  )
}
