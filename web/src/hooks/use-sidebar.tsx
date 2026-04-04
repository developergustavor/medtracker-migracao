// packages
import { useEffect } from 'react'

// store
import { useUIStore } from '@/store'

// hooks
import { useIsTablet, useIsDesktop } from '@/hooks/use-media-query'

const _loc = '@/hooks/use-sidebar'

export function useSidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (isTablet) {
      setSidebarCollapsed(true)
    } else if (isDesktop) {
      setSidebarCollapsed(false)
    }
  }, [isTablet, isDesktop, setSidebarCollapsed])

  return {
    collapsed: sidebarCollapsed,
    toggle: toggleSidebar,
    setCollapsed: setSidebarCollapsed
  }
}
