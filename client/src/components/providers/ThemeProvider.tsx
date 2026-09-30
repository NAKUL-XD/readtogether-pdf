import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useReaderStore } from '@/store'

type Theme = 'light' | 'dark' | 'sepia'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const { setReadingMode } = useReaderStore()

  useEffect(() => {
    const stored = localStorage.getItem('readtogether-theme') as Theme | null
    if (stored) {
      setThemeState(stored)
      setReadingMode(stored)
      document.documentElement.classList.remove('dark', 'sepia')
      if (stored === 'dark') document.documentElement.classList.add('dark')
      if (stored === 'sepia') document.documentElement.classList.add('sepia')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark')
      setReadingMode('dark')
      document.documentElement.classList.add('dark')
    }
  }, [setReadingMode])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setReadingMode(newTheme)
    localStorage.setItem('readtogether-theme', newTheme)
    document.documentElement.classList.remove('dark', 'sepia')
    if (newTheme === 'dark') document.documentElement.classList.add('dark')
    if (newTheme === 'sepia') document.documentElement.classList.add('sepia')
  }

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'sepia']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}