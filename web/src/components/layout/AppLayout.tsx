// packages
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

// components
import { Sidebar } from '@/components/layout/Sidebar'
import { SubSidebar } from '@/components/layout/SubSidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ContextualBar } from '@/components/layout/ContextualBar'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { SpotlightSearch } from '@/components/layout/SpotlightSearch'

// hooks
import { useIsMobile } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

// types
import type { RouteMetadataProps, ContextualActionProps } from '@/types'

const _loc = '@/components/layout/AppLayout'

function findContextualActions(routes: RouteMetadataProps[], pathname: string): ContextualActionProps[] | undefined {
  for (const route of routes) {
    // Exact match
    if (route.path === pathname && route.contextualActions) return route.contextualActions
    // Child path match: if pathname starts with route.path, use parent's actions
    if (pathname.startsWith(route.path + '/') && route.contextualActions) return route.contextualActions
    // Check children
    if (route.children) {
      const childActions = findContextualActions(route.children, pathname)
      if (childActions) return childActions
    }
  }
  return undefined
}

export function AppLayout() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSubRoute, setActiveSubRoute] = useState<RouteMetadataProps | null>(null)
  const [spotlightOpen, setSpotlightOpen] = useState(false)

  // Global keybinding: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSpotlightOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleOpenSpotlight = useCallback(() => {
    setSpotlightOpen(true)
  }, [])

  const currentRouteActions = useMemo(
    () => findContextualActions(ROUTES, location.pathname),
    [location.pathname]
  )

  const handleOpenSubSidebar = useCallback((route: RouteMetadataProps) => {
    setActiveSubRoute(prev => (prev?.path === route.path ? null : route))
  }, [])

  const handleSubNavigate = useCallback((path: string) => {
    navigate(path)
    setActiveSubRoute(null)
  }, [navigate])

  const handleCloseSubSidebar = useCallback(() => {
    setActiveSubRoute(null)
  }, [])

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Sidebar + SubSidebar container */}
      {!isMobile && (
        <div className="relative flex shrink-0" style={{ zIndex: 10 }}>
          <Sidebar onRouteWithChildren={handleOpenSubSidebar} />
          {activeSubRoute && (
            <SubSidebar
              route={activeSubRoute}
              onClose={handleCloseSubSidebar}
              onNavigate={handleSubNavigate}
              isOverlay={false}
            />
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar - desktop only */}
        {!isMobile && <Topbar onOpenSpotlight={handleOpenSpotlight} />}

        {/* ContextualBar - both desktop and mobile */}
        {currentRouteActions && <ContextualBar actions={currentRouteActions} />}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={isMobile ? { paddingBottom: 64 } : undefined}>
          <Outlet />
        </main>
      </div>

      {/* BottomTabBar - mobile only */}
      {isMobile && <BottomTabBar onOpenSpotlight={handleOpenSpotlight} />}

      {/* Spotlight Search */}
      <SpotlightSearch open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
    </div>
  )
}
