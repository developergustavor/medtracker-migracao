// packages
import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'

// components
import { ProfileDialog } from '@/components/layout'

// store
import { useAuthStore } from '@/store'

// hooks
import { useTheme } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

// entities
import { user_role, cme_module } from '@/entities'

// utils
import { getRouteIcon } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/Sidebar'

type SidebarProps = {
  onRouteWithChildren?: (route: RouteMetadataProps) => void
}

const SIDEBAR_ROUTES = ['/home', '/dashboard', '/dashboard-cme', '/cadastros', '/entrada-de-materiais', '/ciclos', '/saida-de-materiais', '/conferencia', '/impressao-de-etiquetas', '/relatorios']

function getVisibleRoutes(routes: RouteMetadataProps[], userRole: user_role | undefined, cmeModule: cme_module | undefined): RouteMetadataProps[] {
  return routes.filter(route => {
    if (!route.showInSidebar) return false
    if (userRole && !route.allowedRoles.includes(userRole)) return false
    if (cmeModule && !route.allowedModules.includes(cmeModule)) return false
    return true
  })
}

function getPageRoutes(routes: RouteMetadataProps[]) {
  return routes.filter(r => SIDEBAR_ROUTES.includes(r.path))
}

type TooltipState = {
  visible: boolean
  text: string
  top: number
  left: number
}

function PortalTooltip({ state }: { state: TooltipState }) {
  if (!state.visible) return null

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: state.top,
        left: state.left,
        padding: '6px 10px',
        borderRadius: 'var(--radius-xs)',
        backgroundColor: 'var(--popover)',
        border: '1px solid var(--popover-border)',
        boxShadow: 'var(--shadow-popover)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        color: 'var(--foreground)',
        whiteSpace: 'nowrap',
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'translateY(-50%)'
      }}
    >
      {state.text}
    </div>,
    document.body
  )
}

export function Sidebar({ onRouteWithChildren }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, cme } = useAuthStore()
  const { theme } = useTheme()
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, text: '', top: 0, left: 0 })

  const isCmeOnly = !user && !!cme

  const CME_ONLY_PATHS = ['/home', '/dashboard-cme']
  const visibleRoutes = isCmeOnly
    ? ROUTES.filter(r => CME_ONLY_PATHS.includes(r.path) && r.showInSidebar)
    : getVisibleRoutes(ROUTES, user?.role, undefined).filter(r => r.path !== '/dashboard-cme')
  const pageRoutes = getPageRoutes(visibleRoutes)

  const isActive = (route: RouteMetadataProps): boolean => {
    if (location.pathname === route.path) return true
    if (route.children?.some(c => location.pathname.startsWith(c.path))) return true
    if (location.pathname.startsWith(route.path) && route.path !== '/home') return true
    return false
  }

  const displayName = isCmeOnly ? cme.corporateName : (user?.name || 'Perfil')
  const userInitial = displayName.charAt(0)?.toUpperCase() || 'U'


  const handleNavClick = (route: RouteMetadataProps) => {
    const hasChildren = route.children && route.children.length > 0
    if (hasChildren && onRouteWithChildren) {
      onRouteWithChildren(route)
    } else {
      navigate(route.path)
    }
  }

  const showTooltip = useCallback((e: React.MouseEvent<HTMLButtonElement>, text: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      visible: true,
      text,
      top: rect.top + rect.height / 2,
      left: rect.right + 8
    })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  const renderNavItem = (route: RouteMetadataProps) => {
    const active = isActive(route)
    const hasChildren = route.children && route.children.length > 0
    const isHovered = hoveredItem === route.path

    return (
      <div key={route.path} className="relative">
        <button
          onClick={() => handleNavClick(route)}
          onMouseEnter={e => {
            setHoveredItem(route.path)
            showTooltip(e, route.name)
          }}
          onMouseLeave={() => {
            setHoveredItem(null)
            hideTooltip()
          }}
          className="flex items-center justify-center w-full cursor-pointer"
          style={{
            width: 44,
            height: 44,
            margin: '0 auto 2px auto',
            borderRadius: 'var(--radius-md)',
            backgroundColor: active ? 'var(--primary-8)' : isHovered ? 'var(--nav-hover-bg)' : 'transparent',
            border: 'none',
            position: 'relative',
            color: active ? 'var(--primary)' : 'var(--sidebar-foreground)',
            transition: 'background-color 150ms ease'
          }}
        >
          {active && (
            <div
              style={{
                position: 'absolute',
                left: -2,
                top: 10,
                bottom: 10,
                width: 2.5,
                backgroundColor: 'var(--primary)',
                borderRadius: 2
              }}
            />
          )}
          {route.icon && getRouteIcon(route.icon, 20, active)}
          {hasChildren && (
            <div
              style={{
                position: 'absolute',
                right: 2,
                top: 2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                opacity: 0.6
              }}
            />
          )}
        </button>
      </div>
    )
  }

  return (
    <>
      <aside
        className="flex flex-col h-full shrink-0 overflow-hidden"
        style={{
          width: 68,
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center shrink-0" style={{ height: 56 }}>
          <img
            src={theme === 'dark' ? '/icons/logo/logo-icon-white.svg' : '/icons/logo/logo-icon.svg'}
            alt="Medtracker Etiquetagem"
            style={{ width: 32, height: 32 }}
          />
        </div>

        {/* Separator */}
        <div className="mx-md" style={{ height: 1, backgroundColor: 'var(--border-separator)' }} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-sm px-sm" style={{ scrollbarWidth: 'thin' }}>
          {pageRoutes.length > 0 && (
            <div>
              {pageRoutes.map(renderNavItem)}
            </div>
          )}
        </nav>

        {/* Separator */}
        <div className="mx-md" style={{ height: 1, backgroundColor: 'var(--border-separator)' }} />

        {/* Footer */}
        <div className="shrink-0 flex flex-col items-center gap-sm py-sm px-sm">
          {/* Avatar */}
          <button
            onClick={() => setShowProfileDialog(true)}
            onMouseEnter={e => {
              setHoveredItem('avatar')
              showTooltip(e, displayName)
            }}
            onMouseLeave={() => {
              setHoveredItem(null)
              hideTooltip()
            }}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-pill)',
              background: 'linear-gradient(135deg, #2155FC, #4B7BFF)',
              border: hoveredItem === 'avatar' ? '2px solid var(--primary)' : '2px solid transparent',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: '#ffffff',
              transition: 'border-color 150ms ease'
            }}

          >
            {userInitial}
          </button>
        </div>
      </aside>

      {/* Portal Tooltip */}
      <PortalTooltip state={tooltip} />

      {/* Profile Dialog */}
      {showProfileDialog && <ProfileDialog open={showProfileDialog} onClose={() => setShowProfileDialog(false)} />}
    </>
  )
}
