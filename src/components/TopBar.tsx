import { useRef } from 'react'
import type { Store } from '../store/useStore'
import type { BackgroundStyle } from '../types'
import { exportPNG, exportSVG, exportJSON, importJSON, shareWhatsApp, shareTwitter } from '../utils/export'
import type Konva from 'konva'

interface TopBarProps {
  store: Store
  stageRef: React.RefObject<Konva.Stage | null>
}

export function TopBar({ store, stageRef }: TopBarProps) {
  const { state, dispatch, undo, redo } = store
  const dark = state.darkMode
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = await importJSON(file)
      dispatch({ type: 'LOAD_STATE', state: data })
    } catch {
      alert('Invalid drawing file')
    }
    e.target.value = ''
  }

  const bgOptions: { value: BackgroundStyle; label: string }[] = [
    { value: 'none', label: 'No Grid' },
    { value: 'grid', label: 'Grid' },
    { value: 'dots', label: 'Dots' },
  ]

  const btnClass = `px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
    dark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
  }`

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-12 border-b
        ${dark ? 'bg-gray-800/95 border-gray-700 backdrop-blur-sm' : 'bg-white/95 border-gray-200 backdrop-blur-sm'}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg width="22" height="22" viewBox="0 0 32 32" className="shrink-0">
            <rect width="32" height="32" rx="6" fill="#6366f1" />
            <path d="M8 24 L24 8 M20 8 L24 8 L24 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="10" cy="22" r="2" fill="white" opacity="0.6" />
          </svg>
          <span className={`font-semibold text-sm ${dark ? 'text-white' : 'text-gray-900'}`}>
            DoAide Draw
          </span>
        </div>

        <div className={`h-5 w-px ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <button onClick={undo} className={btnClass} title="Undo (Ctrl+Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" />
          </svg>
        </button>
        <button onClick={redo} className={btnClass} title="Redo (Ctrl+Y)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-1">
        {bgOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => dispatch({ type: 'SET_BACKGROUND', bg: opt.value })}
            className={`${btnClass} ${state.background === opt.value ? (dark ? 'bg-gray-700' : 'bg-gray-200') : ''}`}
          >
            {opt.label}
          </button>
        ))}

        <div className={`h-5 w-px mx-1 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <button onClick={() => stageRef.current && exportPNG(stageRef.current)} className={btnClass}>
          PNG
        </button>
        <button onClick={() => stageRef.current && exportSVG(stageRef.current)} className={btnClass}>
          SVG
        </button>
        <button onClick={() => exportJSON(state.canvas)} className={btnClass}>
          JSON
        </button>
        <button onClick={() => fileRef.current?.click()} className={btnClass}>
          Import
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

        <div className={`h-5 w-px mx-1 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <button onClick={() => stageRef.current && shareWhatsApp(stageRef.current)} className={btnClass} title="Share on WhatsApp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
        <button onClick={shareTwitter} className={btnClass} title="Share on Twitter/X">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        <div className={`h-5 w-px mx-1 ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className={btnClass}
          title="Toggle Dark/Light Mode"
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
