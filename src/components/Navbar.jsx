import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeSwitcher from './ThemeSwitcher'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/recorder', label: 'Recorder' },
  { to: '/recordings', label: 'Recordings' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b" style={{ borderColor: 'var(--color-border)', background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)' }}>
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div className="font-display text-xl tracking-wide" style={{ color: 'var(--color-accent)' }}>
          Ronin Capture
        </div>

        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className="px-3 py-1.5 rounded-theme text-sm font-medium transition-colors hover:opacity-80"
              style={({ isActive }) =>
                isActive
                  ? { background: 'var(--color-accent)', color: 'var(--color-bg)' }
                  : { color: 'var(--color-text-muted)' }
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {user && (
            <button onClick={signOut} className="btn-danger text-xs px-3 py-1.5">
              Sign out
            </button>
          )}
        </div>
      </div>

      <nav className="sm:hidden flex justify-around border-t px-2 py-1.5" style={{ borderColor: 'var(--color-border)' }}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className="text-xs px-2 py-1 rounded-theme"
            style={({ isActive }) =>
              isActive
                ? { background: 'var(--color-accent)', color: 'var(--color-bg)' }
                : { color: 'var(--color-text-muted)' }
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
