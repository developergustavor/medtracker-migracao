// packages
import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { SearchNormal1, ArrowRight2, ArrowDown2, Notification, Book1 } from 'iconsax-react'

// store
import { useAuthStore } from '@/store'

// constants
import { ROUTES } from '@/constants'

// entities
import { formatted_cme_module, cme_module } from '@/entities'

// mock
import { mockCmes, mockNotifications, mockSupportLinks } from '@/mock/data'

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

/* ─── Notifications Popover ─── */

function NotificationsPopover() {
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

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative flex items-center justify-center cursor-pointer rounded-sm text-foreground"
        style={{
          width: 34,
          height: 34,
          backgroundColor: open ? 'var(--elevated)' : 'transparent',
          border: 'none',
          transition: 'background-color 150ms ease'
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        <Notification size={18} color="currentColor" variant="Linear" />
        {mockNotifications.length > 0 && (
          <span
            className="absolute flex items-center justify-center"
            style={{
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: '50%',
              background: 'var(--destructive)',
              color: '#ffffff',
              fontSize: 9,
              fontWeight: 700,
              lineHeight: 1
            }}
          >
            {mockNotifications.length}
          </span>
        )}
      </button>

      {open && buttonRect && createPortal(
        <div
          ref={popoverRef}
          className="bg-popover rounded-md shadow-popover"
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 8,
            right: window.innerWidth - buttonRect.right,
            zIndex: 200,
            width: 320,
            maxHeight: 360,
            overflowY: 'auto',
            border: '1px solid var(--popover-border)',
            padding: 8
          }}
        >
          <div style={{ padding: '8px 10px 6px', marginBottom: 4 }}>
            <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>
              Notificações
            </span>
          </div>
          {mockNotifications.map(notification => (
            <div
              key={notification.id}
              className="flex flex-col cursor-pointer rounded-sm"
              style={{
                padding: '10px 12px',
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span className="text-sm text-foreground" style={{ fontWeight: 500, lineHeight: 1.4 }}>
                {notification.title}
              </span>
              <span style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)', marginTop: 2 }}>
                {notification.time}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

/* ─── Support Popover ─── */

function SupportPopover() {
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

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center justify-center cursor-pointer rounded-sm text-foreground"
        style={{
          width: 34,
          height: 34,
          backgroundColor: open ? 'var(--elevated)' : 'transparent',
          border: 'none',
          transition: 'background-color 150ms ease'
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        <Book1 size={18} color="currentColor" variant="Linear" />
      </button>

      {open && buttonRect && createPortal(
        <div
          ref={popoverRef}
          className="bg-popover rounded-md shadow-popover"
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 8,
            right: window.innerWidth - buttonRect.right,
            zIndex: 200,
            width: 280,
            maxHeight: 320,
            overflowY: 'auto',
            border: '1px solid var(--popover-border)',
            padding: 8
          }}
        >
          <div style={{ padding: '8px 10px 6px', marginBottom: 4 }}>
            <span className="text-sm text-foreground" style={{ fontWeight: 600 }}>
              Apoio
            </span>
          </div>
          {mockSupportLinks.map(link => (
            <div
              key={link.id}
              className="flex items-center gap-sm cursor-pointer rounded-sm"
              style={{
                padding: '10px 12px',
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span className="text-sm text-foreground" style={{ fontWeight: 500 }}>
                {link.label}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

/* ─── CME Selector ─── */

function CmeSelector() {
  const { user, cme, setCme } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const isCmeOnly = !user && !!cme
  const hasSingleCme = mockCmes.length <= 1
  const canExpand = !isCmeOnly && !hasSingleCme

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
    if (!canExpand) return
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

  const currentModuleColors = cme ? getModuleColors(cme.module) : null

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center gap-sm rounded-pill text-foreground text-xs"
        style={{
          padding: '6px 12px',
          backgroundColor: open ? 'var(--elevated)' : 'var(--nav-hover-bg)',
          border: '1px solid var(--border-subtle)',
          fontWeight: 500,
          transition: 'background-color 150ms ease',
          whiteSpace: 'nowrap',
          cursor: canExpand ? 'pointer' : 'default'
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
        {cme && currentModuleColors && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: currentModuleColors.color,
              backgroundColor: currentModuleColors.bg,
              padding: '1px 6px',
              borderRadius: 'var(--radius-pill)',
              flexShrink: 0,
              lineHeight: 1.4
            }}
          >
            {formatted_cme_module[cme.module]}
          </span>
        )}
        {canExpand && (
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
        )}
      </button>

      {open && buttonRect && createPortal(
        <div
          ref={popoverRef}
          className="bg-popover rounded-md shadow-popover"
          style={{
            position: 'fixed',
            top: buttonRect.bottom + 8,
            right: window.innerWidth - buttonRect.right,
            zIndex: 200,
            width: 280,
            maxHeight: 320,
            overflowY: 'auto',
            border: '1px solid var(--popover-border)',
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
                className="flex flex-col w-full cursor-pointer rounded-sm text-foreground text-sm"
                style={{
                  padding: '10px 12px',
                  backgroundColor: isCurrentCme ? 'var(--primary-8)' : 'transparent',
                  border: isCurrentCme ? '1px solid var(--primary-20)' : '1px solid transparent',
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

/* ─── Topbar ─── */

type TopbarProps = {
  onOpenSpotlight: () => void
}

export function Topbar({ onOpenSpotlight }: TopbarProps) {
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
                className="truncate text-sm text-foreground"
                style={{
                  fontWeight: 600,
                  minWidth: 0
                }}
              >
                {segment.label}
              </span>
            ) : (
              <Link
                to={segment.path}
                className="truncate text-sm text-muted-foreground"
                style={{
                  fontWeight: 400,
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

      {/* Right: Search + Notifications + Support + CME */}
      <div className="flex items-center gap-md shrink-0">
        {/* Search trigger */}
        <div
          className="flex items-center gap-sm cursor-pointer rounded-sm bg-input text-xs"
          onClick={onOpenSpotlight}
          style={{
            padding: '6px 12px',
            border: '1px solid var(--input-border)',
            color: 'var(--fg-muted)',
            minWidth: 160,
            transition: 'border-color 150ms ease'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--input-border)' }}
        >
          <SearchNormal1 size={14} color="currentColor" style={{ flexShrink: 0 }} />
          <span className="flex-1">Buscar...</span>
          <kbd
            style={{
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'inherit',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--elevated)',
              color: 'var(--fg-muted)',
              border: '1px solid var(--border-subtle)',
              lineHeight: 1.4,
              flexShrink: 0
            }}
          >
            {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </div>

        {/* Notifications */}
        <NotificationsPopover />

        {/* Support */}
        <SupportPopover />

        {/* CME Selector */}
        <CmeSelector />
      </div>
    </div>
  )
}
