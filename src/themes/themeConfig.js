// Central registry of the 8 samurai themes.
// Each theme id maps to a data-theme attribute on <html>, which drives
// the CSS variables defined in src/styles/themes.css.
// The `effect` and `touch` keys tell BackgroundEffect / TouchEffectLayer
// which animation variant to render for that theme.

export const THEMES = [
  {
    id: 'crimson-shogun',
    name: 'Crimson Shogun',
    tagline: 'Bold. Imperial. Unforgiving.',
    swatch: ['#0d0b0c', '#8c1c22', '#d4af37'],
    effect: 'embers',
    touch: 'slash',
  },
  {
    id: 'bamboo-forest',
    name: 'Bamboo Forest',
    tagline: 'Calm focus, deep roots.',
    swatch: ['#12211a', '#3f6b4f', '#c9a35d'],
    effect: 'bamboo',
    touch: 'leaf',
  },
  {
    id: 'moonlit-ronin',
    name: 'Moonlit Ronin',
    tagline: 'Silent, watchful, alone.',
    swatch: ['#0b1120', '#26375a', '#bcd4f0'],
    effect: 'moon',
    touch: 'mist',
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    tagline: 'Soft strength, fleeting beauty.',
    swatch: ['#241b1f', '#e8a8b8', '#f6e9ec'],
    effect: 'sakura',
    touch: 'petal',
  },
  {
    id: 'ink-steel',
    name: 'Ink & Steel',
    tagline: 'Minimal. Precise. Deliberate.',
    swatch: ['#f4f1ea', '#1a1a1a', '#4c6b8a'],
    effect: 'inkwash',
    touch: 'splatter',
    cursorEffect: 'ink-trail',
  },
  {
    id: 'golden-temple',
    name: 'Golden Temple',
    tagline: 'Warm regality, quiet power.',
    swatch: ['#2b1417', '#7a2e2e', '#e0b23c'],
    effect: 'glow',
    touch: 'spark',
  },
  {
    id: 'storm-warrior',
    name: 'Storm Warrior',
    tagline: 'Electric, relentless, charged.',
    swatch: ['#12161c', '#1d2833', '#33d1c9'],
    effect: 'storm',
    touch: 'shockwave',
  },
  {
    id: 'ashen-dojo',
    name: 'Ashen Dojo',
    tagline: 'Weathered, worn, battle-tested.',
    swatch: ['#1c1815', '#7a5a3a', '#c97a3d'],
    effect: 'dust',
    touch: 'puff',
  },
]

export const DEFAULT_THEME_ID = 'crimson-shogun'

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0]
}
