import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_THEME_ID, getTheme, THEMES } from '../themes/themeConfig'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'samurai-theme'

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME_ID
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME_ID
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    window.localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  const theme = getTheme(themeId)

  const value = {
    themeId,
    theme,
    themes: THEMES,
    setThemeId,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
