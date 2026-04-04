// packages
import { useState, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Category2 } from 'iconsax-react'

// components
import { ToolsSheet } from '@/components/layout/ToolsSheet'
import { SubroutesSheet } from '@/components/layout/SubroutesSheet'

// store
import { useAuthStore } from '@/store'

// constants
import { ROUTES } from '@/constants'

// entities
import { user_role } from '@/entities'

// utils
import { getRouteIcon, isRoleIn } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/BottomTabBar'

function getMobileTabItems(role: user_role | undefined): RouteMetadataProps[] {
  if (!role) return []
  return ROUTES.filter(route => route.showInMobileTab && route.mobileTabRoles && isRoleIn(role, route.mobileTabRoles))
}

export function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [showToolsSheet, setShowToolsSheet] = useState(false)
  const [subroutesSheet, setSubroutesSheet] = useState<RouteMetadataProps | null>(null)

  const tabItems = useMemo(() => getMobileTabItems(user?.role), [user?.role])

  const isActive = useCallback(
    (route: RouteMetadataProps): boolean => {
      if (location.pathname === route.path) return true
      if (route.children?.some(c => location.pathname.startsWith(c.path))) return true
      if (location.pathname.startsWith(route.path) && route.path !== '/home') return true
      return false
    },
    [location.pathname]
  )

  const handleTabClick = useCallback(
    (route: RouteMetadataProps) => {
      if (route.children && route.children.length > 0) {
        setSubroutesSheet(route)
      } else {
        navigate(route.path)
      }
    },
    [navigate]
  )

  const handleSubrouteNavigate = useCallback(
    (path: string) => {
      navigate(path)
      setSubroutesSheet(null)
    },
    [navigate]
  )

  // Split items: first 2 on left, last 2 on right (Tools in center)
  const leftItems = tabItems.slice(0, 2)
  const rightItems = tabItems.slice(2, 4)

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 flex items-end justify-around"
        style={{
          height: 64,
          backgroundColor: 'var(--card)',
          borderTop: '1px solid var(--border)',
          zIndex: 50,
          paddingBottom: 4
        }}
      >
        {/* Left items */}
        {leftItems.map(route => {
          const active = isActive(route)
          return (
            <button
              key={route.path}
              onClick={() => handleTabClick(route)}
              className="flex flex-col items-center justify-center cursor-pointer"
              style={{
                flex: 1,
                height: 56,
                backgroundColor: 'transparent',
                border: 'none',
                color: active ? 'var(--primary)' : 'var(--sidebar-foreground)',
                fontWeight: active ? 600 : 400,
                fontSize: 'var(--text-xxs)',
                gap: 2,
                transition: 'color 150ms ease'
              }}
            >
              {route.icon && getRouteIcon(route.icon, 22, active)}
              <span>{route.name}</span>
            </button>
          )
        })}

        {/* Tools center button */}
        <div className="flex items-center justify-center" style={{ flex: 1, position: 'relative' }}>
          <button
            onClick={() => setShowToolsSheet(true)}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #2155FC, #4B7BFF)',
              border: 'none',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(33,85,252,0.35)',
              position: 'absolute',
              bottom: 8,
              transition: 'transform 150ms ease'
            }}
          >
            <Category2 size={24} variant="Bold" color="#ffffff" />
          </button>
        </div>

        {/* Right items */}
        {rightItems.map(route => {
          const active = isActive(route)
          return (
            <button
              key={route.path}
              onClick={() => handleTabClick(route)}
              className="flex flex-col items-center justify-center cursor-pointer"
              style={{
                flex: 1,
                height: 56,
                backgroundColor: 'transparent',
                border: 'none',
                color: active ? 'var(--primary)' : 'var(--sidebar-foreground)',
                fontWeight: active ? 600 : 400,
                fontSize: 'var(--text-xxs)',
                gap: 2,
                transition: 'color 150ms ease'
              }}
            >
              {route.icon && getRouteIcon(route.icon, 22, active)}
              <span>{route.name}</span>
            </button>
          )
        })}
      </div>

      {/* Tools Sheet */}
      <ToolsSheet
        open={showToolsSheet}
        onClose={() => setShowToolsSheet(false)}
        onOpenSubroutes={(route) => {
          setShowToolsSheet(false)
          setSubroutesSheet(route)
        }}
      />

      {/* Subroutes Sheet */}
      <SubroutesSheet
        route={subroutesSheet}
        onClose={() => setSubroutesSheet(null)}
        onNavigate={handleSubrouteNavigate}
      />
    </>
  )
}
