// packages
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// configs
import { VITE_APP_NAME, VITE_NODE_ENV } from '@/configs'

type Theme = 'light' | 'dark'
type LayoutMode = 'auto' | 'touch' | 'desktop'
type LoginTab = 'code' | 'cpf' | 'cme' | 'facial'

type UIState = {
  sidebarCollapsed: boolean
  theme: Theme
  layoutMode: LayoutMode
  defaultLoginTab: LoginTab
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: Theme) => void
  setLayoutMode: (mode: LayoutMode) => void
  setDefaultLoginTab: (tab: LoginTab) => void
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      sidebarCollapsed: false,
      theme: 'light',
      layoutMode: 'auto',
      defaultLoginTab: 'code',
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
      setLayoutMode: mode => set({ layoutMode: mode }),
      setDefaultLoginTab: tab => set({ defaultLoginTab: tab })
    }),
    { name: `${VITE_APP_NAME}-${VITE_NODE_ENV}-ui-storage` }
  )
)
