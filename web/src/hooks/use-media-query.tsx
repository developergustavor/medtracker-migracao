// packages
import { useState, useEffect, useCallback } from 'react'

// store
import { useUIStore } from '@/store'

const _loc = '@/hooks/use-media-query'

export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches
    }
    return false
  }, [])

  const [matches, setMatches] = useState<boolean>(() => getMatches(query))

  useEffect(() => {
    const matchMedia = window.matchMedia(query)

    const handleChange = () => {
      setMatches(matchMedia.matches)
    }

    matchMedia.addEventListener('change', handleChange)

    return () => {
      matchMedia.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

export function useIsMobile(): boolean {
  const { layoutMode } = useUIStore()
  const mediaResult = useMediaQuery('(max-width: 767px)')

  if (layoutMode === 'touch') return true
  if (layoutMode === 'desktop') return false
  return mediaResult
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
