import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

const THEMES = {
  darkSlate: {
    name: 'Dark Slate',
    bg: '#0f172a',
    surface: '#1e293b',
    accent: '#06b6d4',
    text: '#e2e8f0',
    secondary: '#94a3b8',
    border: '#334155',
    hover: '#334155',
    emoji: '🌙',
  },
  oceanBlue: {
    name: 'Ocean Blue',
    bg: '#0c1929',
    surface: '#132d51',
    accent: '#0ea5e9',
    text: '#e0f2fe',
    secondary: '#7dd3fc',
    border: '#1e3a8a',
    hover: '#1e3a8a',
    emoji: '🌊',
  },
  forestGreen: {
    name: 'Forest Green',
    bg: '#0f2818',
    surface: '#164e3b',
    accent: '#10b981',
    text: '#d1fae5',
    secondary: '#6ee7b7',
    border: '#047857',
    hover: '#047857',
    emoji: '🌲',
  },
  purpleZen: {
    name: 'Purple Zen',
    bg: '#1a0f2e',
    surface: '#312e81',
    accent: '#a78bfa',
    text: '#e9d5ff',
    secondary: '#c4b5fd',
    border: '#6d28d9',
    hover: '#6d28d9',
    emoji: '🟣',
  },
  roseGold: {
    name: 'Rose Gold',
    bg: '#1f1419',
    surface: '#3d2e33',
    accent: '#f472b6',
    text: '#fce7f3',
    secondary: '#f9a8d4',
    border: '#be185d',
    hover: '#be185d',
    emoji: '🌹',
  },
  cream: {
    name: 'Cream',
    bg: '#faf9f6',
    surface: '#f3ede5',
    accent: '#d97706',
    text: '#1f2937',
    secondary: '#78716c',
    border: '#e7d5c8',
    hover: '#ede5d9',
    emoji: '☕',
  },
}

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('verto-theme')
    return saved || 'darkSlate'
  })

  const theme = THEMES[currentTheme]

  useEffect(() => {
    localStorage.setItem('verto-theme', currentTheme)
  }, [currentTheme])

  const switchTheme = (themeName) => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, switchTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}