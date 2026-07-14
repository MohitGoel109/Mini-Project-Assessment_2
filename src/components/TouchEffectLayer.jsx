import { useCallback, useRef, useState } from 'react'

// Listens for clicks/taps anywhere in the app and spawns a short-lived,
// medium-sized (see --touch-size in themes.css) animated effect at that
// point, styled per the active theme's `touch` variant.
export default function TouchEffectLayer({ touch, children }) {
  const [ripples, setRipples] = useState([])
  const idRef = useRef(0)

  const spawn = useCallback((e) => {
    const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0
    const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0
    const id = idRef.current++
    setRipples((prev) => [...prev, { id, x, y }])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }, [])

  return (
    <div onClick={spawn} className="relative min-h-screen">
      {children}
      <div className="fixed inset-0 pointer-events-none z-50">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="touch-effect absolute"
            style={{
              left: r.x,
              top: r.y,
              width: 'var(--touch-size)',
              height: 'var(--touch-size)',
              transform: 'translate(-50%, -50%)',
              display: 'block',
              ...touchStyle(touch),
            }}
          />
        ))}
      </div>
    </div>
  )
}

function touchStyle(touch) {
  switch (touch) {
    case 'slash':
      return {
        background: 'linear-gradient(90deg, transparent, var(--color-danger), transparent)',
        height: 4,
        animation: 'touch-slash 0.5s ease-out forwards',
      }
    case 'leaf':
      return {
        background: 'var(--color-primary)',
        borderRadius: '0% 100% 0% 100%',
        animation: 'touch-leaf 0.6s ease-out forwards',
      }
    case 'mist':
      return {
        background: 'radial-gradient(circle, var(--color-accent), transparent 70%)',
        borderRadius: '9999px',
        animation: 'touch-mist 0.6s ease-out forwards',
      }
    case 'petal':
      return {
        background: 'var(--color-primary)',
        borderRadius: '0% 100% 0% 100%',
        animation: 'touch-petal 0.6s ease-out forwards',
      }
    case 'splatter':
      return {
        background: 'var(--color-text)',
        borderRadius: '40% 60% 55% 45%',
        animation: 'touch-splatter 0.55s ease-out forwards',
      }
    case 'spark':
      return {
        background: 'var(--color-accent)',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
        animation: 'touch-spark 0.55s ease-out forwards',
      }
    case 'shockwave':
      return {
        border: '2px solid var(--color-accent)',
        borderRadius: '9999px',
        background: 'transparent',
        animation: 'touch-shockwave 0.55s ease-out forwards',
      }
    case 'puff':
      return {
        background: 'var(--color-accent)',
        borderRadius: '9999px',
        filter: 'blur(2px)',
        animation: 'touch-puff 0.6s ease-out forwards',
      }
    default:
      return {}
  }
}
