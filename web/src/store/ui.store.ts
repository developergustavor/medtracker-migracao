// packages
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// configs
import { VITE_APP_NAME, VITE_NODE_ENV } from '@/configs'

type Theme = 'light' | 'dark'
type LayoutMode = 'auto' | 'touch' | 'desktop'

type UIState = {
  sidebarCollapsed: boolean
  theme: Theme
  layoutMode: LayoutMode
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: Theme) => void
  setLayoutMode: (mode: LayoutMode) => void
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      sidebarCollapsed: false,
      theme: 'light',
      layoutMode: 'auto',
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),
      setTheme: theme => {
        if (theme === 'dark') {
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.add('light')
        }
        set({ theme })
      },
      setLayoutMode: mode => set({ layoutMode: mode })
    }),
    { name: `${VITE_APP_NAME}-${VITE_NODE_ENV}-ui-storage` }
  )
)
