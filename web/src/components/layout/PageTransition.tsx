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
  // 1. Scale up + fade (original aprovada)
  {
    from: { opacity: 0, y: 48, scale: 0.5 },
    to: { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'power3.out' }
  },
  // 2. Slide da direita + scale
  {
    from: { opacity: 0, x: 80, scale: 0.85 },
    to: { opacity: 1, x: 0, scale: 1, duration: 1.8, ease: 'power3.out' }
  },
  // 3. Zoom in profundo + fade
  {
    from: { opacity: 0, scale: 0.3, y: 20 },
    to: { opacity: 1, scale: 1, y: 0, duration: 2.2, ease: 'power4.out' }
  },
  // 4. Slide de baixo com rotação sutil
  {
    from: { opacity: 0, y: 60, rotateX: 40, transformPerspective: 800 },
    to: { opacity: 1, y: 0, rotateX: 0, duration: 1.8, ease: 'power3.out' }
  },
  // 5. Expand do centro
  {
    from: { opacity: 0, scale: 0.4, y: 30, filter: 'blur(8px)' },
    to: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 2, ease: 'power3.out' }
  }
]

let lastVariantIndex = -1

function getRandomVariant(): TransitionVariant {
  let index = Math.floor(Math.random() * TRANSITION_VARIANTS.length)
  // Evitar repetir a mesma transição consecutiva
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
    <div ref={containerRef} style={{ willChange: 'opacity, transform' }}>
      {outlet}
    </div>
  )
}
