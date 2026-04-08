// packages
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'

const _loc = '@/hooks/use-page-transition'

export function usePageTransition() {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: 'power2.out',
        clearProps: 'all'
      }
    )
  }, [])

  return { containerRef }
}
