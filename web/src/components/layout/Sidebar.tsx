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

// libs
import { cn } from '@/libs/shadcn.utils'

// utils
import { getRouteIcon } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/Sidebar'

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
      className="fixed z-tooltip rounded-xs bg-popover border border-popover shadow-popover px-[10px] py-[6px] text-xs text-foreground font-medium whitespace-nowrap pointer-events-none -translate-y-1/2"
      style={{ top: state.top, left: state.left }}
    >
      {state.text}
    </div>,
    document.body
  )
}

export function Sidebar() {
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
    if (hasChildren) {
      navigate(route.children![0].path)
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
          className={cn(
            'relative flex items-center justify-center w-[44px] h-[44px] mx-auto mb-[2px] border-none cursor-pointer rounded-md transition-colors duration-150',
            active ? 'bg-primary-8 text-primary' : isHovered ? 'bg-nav-hover text-sidebar-foreground' : 'bg-transparent text-sidebar-foreground'
          )}
        >
          {active && <div className="indicator-left" />}
          {route.icon && getRouteIcon(route.icon, 20, active)}
          {hasChildren && <div className="dot-primary" />}
        </button>
      </div>
    )
  }

  return (
    <>
      <aside className="flex flex-col h-full w-[68px] shrink-0 overflow-hidden bg-sidebar border-r border-sidebar">
        {/* Logo */}
        <div className="flex items-center justify-center shrink-0 h-[56px]">
          <img
            src={theme === 'dark' ? '/icons/logo/logo-icon-white.svg' : '/icons/logo/logo-icon.svg'}
            alt="Medtracker Etiquetagem"
            className="w-[32px] h-[32px]"
          />
        </div>

        {/* Separator */}
        <div className="mx-md separator-h" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-sm px-sm">
          {pageRoutes.length > 0 && (
            <div>
              {pageRoutes.map(renderNavItem)}
            </div>
          )}
        </nav>

        {/* Separator */}
        <div className="mx-md separator-h" />

        {/* Footer */}
        <div className="shrink-0 flex flex-col items-center gap-sm py-sm px-sm">
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
            className={cn(
              'flex items-center justify-center w-[36px] h-[36px] rounded-pill text-sm font-bold text-on-solid gradient-primary cursor-pointer border-2 transition-colors duration-150',
              hoveredItem === 'avatar' ? 'border-primary' : 'border-transparent'
            )}
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
