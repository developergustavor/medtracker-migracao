// packages
import { useRef, useLayoutEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import gsap from 'gsap'

const _loc = '@/components/layout/PageTransition'

type TransitionVariant = {
  from: gsap.TweenVars
  to: gsap.TweenVars
}

const TRANSITION_VARIANTS: TransitionVariant[] = [
  // 1. Fade + slide up suave
  {
    from: { opacity: 0, y: 16 },
    to: { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
  },
  // 2. Fade + scale sutil
  {
    from: { opacity: 0, scale: 0.97 },
    to: { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }
  },
  // 3. Fade + slide direita sutil
  {
    from: { opacity: 0, x: 20 },
    to: { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
  },
  // 4. Fade + scale + slide
  {
    from: { opacity: 0, y: 10, scale: 0.98 },
    to: { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
  },
  // 5. Fade puro com blur sutil
  {
    from: { opacity: 0, filter: 'blur(4px)' },
    to: { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }
  }
]

let lastVariantIndex = -1

function getRandomVariant(): TransitionVariant {
  let index = Math.floor(Math.random() * TRANSITION_VARIANTS.length)
  if (index === lastVariantIndex && TRANSITION_VARIANTS.length > 1) {
    index = (index + 1) % TRANSITION_VARIANTS.length
  }
  lastVariantIndex = index
  return TRANSITION_VARIANTS[index]
}

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const variant = getRandomVariant()

    gsap.fromTo(containerRef.current, { ...variant.from }, { ...variant.to, clearProps: 'all' })
  }, [location.pathname])

  return (
    <div ref={containerRef} className="h-full" style={{ willChange: 'opacity, transform' }}>
      {outlet}
    </div>
  )
}
