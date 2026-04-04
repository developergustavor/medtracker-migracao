// packages
import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { SearchNormal1, ArrowRight2, ArrowDown2 } from 'iconsax-react'

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

  const breadcrumbs = useMemo(() => buildBreadcrumbs(location.pathname), [location.pathname])

  return (
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

      {/* Right: Search + CME */}
      <div className="flex items-center gap-md shrink-0">
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
  )
}
