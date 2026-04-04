// packages
import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { SearchNormal1, ArrowRight2, ArrowDown2 } from 'iconsax-react'

// hooks
import { useTheme } from '@/hooks'

// store
import { useAuthStore } from '@/store'

// constants
import { ROUTES } from '@/constants'

// entities
import { formatted_cme_module, cme_module } from '@/entities'

// mock
import { mockCmes } from '@/mock/data'

// types
import type { CmeProps } from '@/entities'
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/Topbar'

type BreadcrumbSegment = {
  label: string
  path: string
  isLast: boolean
}

function findRouteByPath(routes: RouteMetadataProps[], path: string): RouteMetadataProps | undefined {
  for (const route of routes) {
    if (route.path === path) return route
    if (route.children) {
      const child = findRouteByPath(route.children, path)
      if (child) return child
    }
  }
  return undefined
}

function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = []

  // Always add Home
  segments.push({ label: 'Home', path: '/home', isLast: pathname === '/home' || pathname === '/' })

  if (pathname === '/home' || pathname === '/') return segments

  const parts = pathname.split('/').filter(Boolean)
  let currentPath = ''

  for (let i = 0; i < parts.length; i++) {
    currentPath += `/${parts[i]}`
    const route = findRouteByPath(ROUTES, currentPath)
    const label = route?.name || parts[i].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    const isLast = i === parts.length - 1

    segments.push({ label, path: currentPath, isLast })
  }

  return segments
}

function CmeSelector() {
  const { cme, setCme } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect())
    }
    setOpen(prev => !prev)
  }

  const handleCmeSelect = (selected: CmeProps) => {
    setCme(selected)
    setOpen(false)
  }

  const getModuleDotColor = (mod: cme_module): string => {
    switch (mod) {
      case cme_module.COMPLETO: return 'var(--primary)'
      case cme_module.IMPRESSAO: return 'var(--info)'
      case cme_module.ETIQUETAGEM: return 'var(--warning)'
      default: return 'var(--muted-foreground)'
    }
  }

  const getModuleColors = (mod: cme_module): { color: string; bg: string } => {
    switch (mod) {
      case cme_module.COMPLETO: return { color: 'var(--primary)', bg: 'var(--primary-10)' }
      case cme_module.IMPRESSAO: return { color: 'var(--info)', bg: 'var(--info-10)' }
      case cme_module.ETIQUETAGEM: return { color: 'var(--warning)', bg: 'var(--warning-10)' }
      default: return { color: 'var(--muted-foreground)', bg: 'var(--muted)' }
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-sm cursor-pointer"
        style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: open ? 'var(--elevated)' : 'var(--nav-hover-bg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--foreground)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          transition: 'background-color 150ms ease',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--elevated)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: cme ? getModuleDotColor(cme.module) : 'var(--muted-foreground)',
            flexShrink: 0
          }}
        />
        <span className="truncate" style={{ maxWidth: 140 }}>
          {cme?.corporateName || 'Selecionar CME'}
        </span>
        <ArrowDown2
          size={14}
          color="currentColor"
          style={{
            color: 'var(--muted-foreground)',
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease'
          }}
        />
      </button>

      {open && buttonRect && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 8,
            right: window.innerWidth - buttonRect.right,
            zIndex: 200,
            width: 280,
            maxHeight: 320,
            overflowY: 'auto',
            backgroundColor: 'var(--popover)',
            border: '1px solid var(--popover-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-popover)',
            padding: 6
          }}
        >
          {mockCmes.map(item => {
            const isCurrentCme = cme?.id === item.id
            const moduleColors = getModuleColors(item.module)

            return (
              <button
                key={item.id}
                onClick={() => handleCmeSelect(item)}
                className="flex flex-col w-full cursor-pointer"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCurrentCme ? 'var(--primary-8)' : 'transparent',
                  border: isCurrentCme ? '1px solid var(--primary-20)' : '1px solid transparent',
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-sm)',
                  transition: 'background-color 150ms ease',
                  textAlign: 'left',
                  marginBottom: 2
                }}
                onMouseEnter={e => {
                  if (!isCurrentCme) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)'
                }}
                onMouseLeave={e => {
                  if (!isCurrentCme) (e.currentTarget as HTMLElement).style.backgroundColor = isCurrentCme ? 'var(--primary-8)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-sm w-full">
                  <span style={{ fontWeight: isCurrentCme ? 600 : 400, flex: 1, minWidth: 0 }} className="truncate">
                    {item.corporateName}
                  </span>
                  {isCurrentCme && (
                    <span
                      style={{
                        fontSize: 'var(--text-xxs)',
                        fontWeight: 600,
                        color: 'var(--primary)',
                        backgroundColor: 'var(--primary-8)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-xs)',
                        flexShrink: 0
                      }}
                    >
                      Atual
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-sm" style={{ marginTop: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: moduleColors.color,
                      backgroundColor: moduleColors.bg,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      letterSpacing: '0.02em'
                    }}
                  >
                    {formatted_cme_module[item.module]}
                  </span>
                  <span style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}>
                    {item.city}/{item.uf}
                  </span>
                </div>
              </button>
            )
          })}
        </div>,
        document.body
      )}
    </>
  )
}

export function Topbar() {
  const location = useLocation()
  const [testPreloader, setTestPreloader] = useState<'navigation-auth' | 'navigation-public' | 'component' | null>(null)

  const breadcrumbs = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname])

  return (
    <>
      <div
        className="h-14 shrink-0 flex items-center px-xl"
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--background-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 5
        }}
      >
        {/* Left: Breadcrumb */}
        <nav className="flex items-center gap-xs flex-1 min-w-0">
          {breadcrumbs.map((segment, index) => (
            <div key={segment.path} className="flex items-center gap-xs min-w-0">
              {index > 0 && (
                <ArrowRight2
                  size={14}
                  color="currentColor"
                  style={{ color: 'var(--fg-muted)', flexShrink: 0 }}
                />
              )}
              {segment.isLast ? (
                <span
                  className="truncate"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--foreground)',
                    minWidth: 0
                  }}
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  to={segment.path}
                  className="truncate"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 400,
                    color: 'var(--muted-foreground)',
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                    minWidth: 0
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)' }}
                >
                  {segment.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right: Preloader test buttons + Search + CME */}
        <div className="flex items-center gap-md shrink-0">
          {/* DEV: Preloader test buttons (temporary) */}
          <div className="flex items-center gap-xs">
            {(['navigation-auth', 'navigation-public', 'component'] as const).map(v => (
              <button
                key={v}
                onClick={() => {
                  setTestPreloader(v)
                  if (v !== 'component') setTimeout(() => setTestPreloader(null), 3000)
                }}
                className="cursor-pointer"
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--destructive-8)',
                  border: '1px solid var(--destructive-10)',
                  color: 'var(--destructive)',
                  fontSize: 9,
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {v === 'navigation-auth' ? 'Auth' : v === 'navigation-public' ? 'Public' : 'Component'}
              </button>
            ))}
          </div>

          {/* Search trigger */}
          <div
            className="flex items-center gap-sm cursor-pointer"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--input)',
              border: '1px solid var(--input-border)',
              color: 'var(--fg-muted)',
              fontSize: 'var(--text-xs)',
              minWidth: 160,
              transition: 'border-color 150ms ease'
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)' }}
          >
            <SearchNormal1 size={14} color="currentColor" style={{ flexShrink: 0 }} />
            <span>Buscar...</span>
          </div>

          {/* CME Selector */}
          <CmeSelector />
        </div>
      </div>

      {/* Preloader test overlay */}
      {testPreloader === 'navigation-auth' && (
        <PreloaderTest variant="navigation-auth" onClose={() => setTestPreloader(null)} />
      )}
      {testPreloader === 'navigation-public' && (
        <PreloaderTest variant="navigation-public" onClose={() => setTestPreloader(null)} />
      )}
      {testPreloader === 'component' && (
        <div style={{ position: 'relative', height: 200, margin: 20, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Conteudo atras do loader</span>
          </div>
          <PreloaderTest variant="component" onClose={() => setTestPreloader(null)} />
        </div>
      )}
    </>
  )
}

/** Temporary test wrapper for preloaders */
function PreloaderTest({ variant, onClose }: { variant: 'navigation-auth' | 'navigation-public' | 'component'; onClose: () => void }) {
  const { theme } = useTheme()
  const [progress, setProgress] = useState(0)

  const isNavigation = variant === 'navigation-auth' || variant === 'navigation-public'

  useEffect(() => {
    if (!isNavigation) return
    const t1 = setTimeout(() => setProgress(30), 100)
    const t2 = setTimeout(() => setProgress(60), 400)
    const t3 = setTimeout(() => setProgress(80), 800)
    const t4 = setTimeout(() => setProgress(95), 1500)
    const t5 = setTimeout(() => { setProgress(100); setTimeout(onClose, 300) }, 2500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5) }
  }, [isNavigation, onClose])

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
        <img src={iconLogoSrc} alt="Carregando..." className="animate-spin" style={{ width: 32, height: 32, animationDuration: '3s' }} />
      </div>
    )
  }

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-xl"
      style={{
        zIndex: 200,
        ...(variant === 'navigation-auth'
          ? { backgroundColor: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }
          : { backgroundColor: 'var(--bg)' }
        )
      }}
    >
      <img src={fullLogoSrc} alt="Medtracker Etiquetagem" style={{ height: 56, objectFit: 'contain' }} />
      <div style={{ width: 220, height: 6, borderRadius: 9999, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'var(--elevated)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: theme === 'dark' ? '#ffffff' : 'var(--primary)', borderRadius: 9999, transition: 'width 500ms ease-out' }} />
      </div>
    </div>,
    document.body
  )
}
