// packages
import { useEffect, useState } from 'react'

// hooks
import { useTheme } from '@/hooks'

// components
import { Progress } from '@/components/ui/progress'

const _loc = '@/components/loaders/Preloader'

type PreloaderVariant = 'navigation-auth' | 'navigation-public' | 'component'

type PreloaderProps = {
  variant?: PreloaderVariant
}

/**
 * Preloader system with 3 variants:
 *
 * 1. `navigation-auth` — Full-screen, subtle background blur, for navigation in authenticated areas.
 *    Shows full logo (gradient, large) + animated progress bar.
 *
 * 2. `navigation-public` — Full-screen, solid background, for navigation in public areas (login, etc).
 *    Shows full logo (gradient, large) + animated progress bar.
 *
 * 3. `component` — Overlay on container, for interaction loaders (button clicks, form submits).
 *    Shows icon-only logo with slow spin (3s). No progress bar. Subtle blur.
 *    NOTE: For initial page/component loads, use <Skeleton /> instead.
 */
export function Preloader({ variant = 'navigation-auth' }: PreloaderProps) {
  const { theme } = useTheme()
  const [progress, setProgress] = useState(0)

  const isNavigation = variant === 'navigation-auth' || variant === 'navigation-public'

  useEffect(() => {
    if (!isNavigation) return

    const timer1 = setTimeout(() => setProgress(30), 100)
    const timer2 = setTimeout(() => setProgress(60), 400)
    const timer3 = setTimeout(() => setProgress(80), 800)
    const timer4 = setTimeout(() => setProgress(95), 1500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [isNavigation])

  const fullLogoSrc = theme === 'dark' ? '/images/logo/logo-white-full-gradient.svg' : '/images/logo/logo-full-gradient.svg'
  const iconLogoSrc = theme === 'dark' ? '/icons/logo/logo-icon-white.svg' : '/icons/logo/logo-icon.svg'

  if (variant === 'component') {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 50,
          borderRadius: 'inherit'
        }}
      >
        <img
          src={iconLogoSrc}
          alt="Carregando..."
          className="animate-spin"
          style={{ width: 32, height: 32, animationDuration: '3s' }}
        />
      </div>
    )
  }

  const isAuth = variant === 'navigation-auth'

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-xl"
      style={{
        zIndex: 200,
        ...(isAuth
          ? {
              backgroundColor: 'rgba(0,0,0,0.15)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)'
            }
          : {
              backgroundColor: 'var(--bg)'
            }
        )
      }}
    >
      <img
        src={fullLogoSrc}
        alt="Medtracker Etiquetagem"
        style={{ height: 56, objectFit: 'contain' }}
      />
      <Progress
        value={progress}
        className="w-56"
        indicatorColor={theme === 'dark' ? '#ffffff' : undefined}
        trackColor={theme === 'dark' ? 'rgba(255,255,255,0.12)' : undefined}
      />
    </div>
  )
}
