import { useMemo } from 'react'

// Renders a fixed, pointer-events-none ambient layer behind the app.
// The visual variant is selected by theme.effect (see themeConfig.js).
// Each variant is intentionally lightweight (CSS animation, not JS loops).
export default function BackgroundEffect({ effect }) {
  const items = useMemo(() => buildItems(effect), [effect])

  return (
    <div className="bg-effect-layer fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {effect === 'embers' && items.map((i) => (
        <span
          key={i.key}
          className="absolute rounded-full"
          style={{
            left: `${i.left}%`,
            bottom: '-5%',
            width: i.size,
            height: i.size,
            background: 'var(--color-accent)',
            filter: 'blur(1px)',
            animation: `drift-embers ${i.duration}s linear ${i.delay}s infinite`,
          }}
        />
      ))}

      {effect === 'bamboo' && items.map((i) => (
        <span
          key={i.key}
          className="absolute bottom-0 origin-bottom"
          style={{
            left: `${i.left}%`,
            width: 10,
            height: '70%',
            background: 'linear-gradient(to top, var(--color-primary), transparent)',
            borderRadius: 6,
            animation: `sway-bamboo ${i.duration}s ease-in-out ${i.delay}s infinite`,
            opacity: 0.35,
          }}
        />
      ))}

      {effect === 'moon' && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              top: '8%', right: '12%', width: 90, height: 90,
              background: 'radial-gradient(circle, var(--color-accent), transparent 70%)',
              opacity: 0.5,
            }}
          />
          {items.map((i) => (
            <span
              key={i.key}
              className="absolute rounded-full"
              style={{
                top: `${i.top}%`, left: `${i.left}%`,
                width: i.size * 4, height: i.size,
                background: 'var(--color-surface)',
                opacity: 0.4,
                animation: `drift-clouds ${i.duration}s ease-in-out ${i.delay}s infinite alternate`,
              }}
            />
          ))}
        </>
      )}

      {effect === 'sakura' && items.map((i) => (
        <span
          key={i.key}
          className="absolute rounded-full"
          style={{
            left: `${i.left}%`,
            top: '-5%',
            width: i.size,
            height: i.size,
            background: 'var(--color-primary)',
            animation: `fall-petal ${i.duration}s linear ${i.delay}s infinite`,
          }}
        />
      ))}

      {effect === 'inkwash' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, var(--color-text) 0%, transparent 45%)',
            animation: 'ink-bleed 8s ease-in-out infinite',
          }}
        />
      )}

      {effect === 'glow' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 30%, var(--color-accent) 0%, transparent 55%)',
            animation: 'temple-glow 5s ease-in-out infinite',
          }}
        />
      )}

      {effect === 'storm' && (
        <>
          <div
            className="absolute inset-0 bg-white"
            style={{ animation: 'lightning-flash 7s linear infinite' }}
          />
          {items.map((i) => (
            <span
              key={i.key}
              className="absolute"
              style={{
                left: `${i.left}%`, top: '-10%',
                width: 1.5, height: 60,
                background: 'var(--color-accent)',
                opacity: 0.5,
                animation: `rain-fall ${i.duration}s linear ${i.delay}s infinite`,
              }}
            />
          ))}
        </>
      )}

      {effect === 'dust' && items.map((i) => (
        <span
          key={i.key}
          className="absolute rounded-full"
          style={{
            left: `${i.left}%`,
            bottom: `${i.top}%`,
            width: i.size,
            height: i.size,
            background: 'var(--color-accent)',
            filter: 'blur(2px)',
            animation: `drift-dust ${i.duration}s ease-in ${i.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

function buildItems(effect) {
  const count = { embers: 24, bamboo: 10, moon: 5, sakura: 22, storm: 40, dust: 18 }[effect] || 0
  return Array.from({ length: count }).map((_, idx) => ({
    key: `${effect}-${idx}`,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 3 + Math.random() * 6,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 6,
  }))
}
