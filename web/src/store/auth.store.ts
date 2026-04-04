// packages
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// entities
import type { UserProps, CmeProps } from '@/entities'

// configs
import { VITE_APP_NAME, VITE_NODE_ENV } from '@/configs'

type AuthState = {
  user: UserProps | null
  cme: CmeProps | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProps, token: string) => void
  loginCme: (cme: CmeProps, token: string) => void
  setUser: (user: UserProps) => void
  setCme: (cme: CmeProps) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      cme: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      loginCme: (cme, token) => set({ cme, token, isAuthenticated: true }),
      setUser: user => set({ user }),
      setCme: cme => set({ cme }),
      logout: () => {
        set({ user: null, cme: null, token: null, isAuthenticated: false })
        window.location.href = '/login'
      }
    }),
    { name: `${VITE_APP_NAME}-${VITE_NODE_ENV}-auth-storage` }
  )
)
