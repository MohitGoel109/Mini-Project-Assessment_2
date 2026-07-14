import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeSwitcher() {
  const { theme, themes, setThemeId } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-theme text-sm card-surface"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex -space-x-1">
          {theme.swatch.map((c, i) => (
            <span key={i} className="w-3 h-3 rounded-full border" style={{ background: c, borderColor: 'var(--color-bg)' }} />
          ))}
        </span>
        <span className="hidden md:inline">{theme.name}</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-72 max-h-96 overflow-auto card-surface p-2 shadow-xl"
        >
          {themes.map((t) => (
            <button
              key={t.id}
              role="option"
              aria-selected={t.id === theme.id}
              onClick={() => { setThemeId(t.id); setOpen(false) }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-theme text-left hover:opacity-90"
              style={{ background: t.id === theme.id ? 'var(--color-bg-alt)' : 'transparent' }}
            >
              <span className="flex -space-x-1 shrink-0">
                {t.swatch.map((c, i) => (
                  <span key={i} className="w-4 h-4 rounded-full border" style={{ background: c, borderColor: 'var(--color-bg)' }} />
                ))}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{t.name}</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.tagline}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
