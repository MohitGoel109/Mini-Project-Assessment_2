import { useEffect, useRef, useState } from 'react'

// Lightweight mouse-following trail. Spawns a small fading dot roughly
// every 40ms while the cursor moves, capped in count to stay cheap.
export default function CursorTrail({ variant = 'ink-trail' }) {
  const [dots, setDots] = useState([])
  const idRef = useRef(0)
  const lastRef = useRef(0)

  useEffect(() => {
    function onMove(e) {
      const now = Date.now()
      if (now - lastRef.current < 40) return
      lastRef.current = now

      const id = idRef.current++
      setDots((prev) => {
        const next = [...prev, { id, x: e.clientX, y: e.clientY }]
        return next.length > 14 ? next.slice(next.length - 14) : next
      })
      window.setTimeout(() => {
        setDots((prev) => prev.filter((d) => d.id !== id))
      }, 500)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {dots.map((d, i) => (
        <span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: d.x,
            top: d.y,
            width: 6 - i * 0.2,
            height: 6 - i * 0.2,
            transform: 'translate(-50%, -50%)',
            background: 'var(--color-primary)',
            opacity: (i + 1) / dots.length * 0.45,
            transition: 'opacity 0.5s ease',
          }}
        />
      ))}
    </div>
  )
}
