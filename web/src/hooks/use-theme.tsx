// packages
import { useEffect } from 'react'

// store
import { useUIStore } from '@/store'

const _loc = '@/hooks/use-theme'

export function useTheme() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return { theme, setTheme, toggleTheme }
}
