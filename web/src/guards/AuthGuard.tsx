// packages
import { Navigate, useLocation } from 'react-router-dom'

// store
import { useAuthStore } from '@/store'

// guards
import { useAuth } from '@/guards/useAuth'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/guards/AuthGuard'

/** Rotas permitidas no modo CME-only (login pela aba CME) */
const CME_ONLY_ALLOWED_PATHS = ['/home', '/dashboard-cme']

type AuthGuardProps = {
  children: React.ReactNode
  metadata?: RouteMetadataProps
}

export function AuthGuard({ children, metadata }: AuthGuardProps) {
  const { loading } = useAuth()
  const { isAuthenticated, user, cme } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isCmeOnly = !user && !!cme

  // CME-only mode: restringir a rotas permitidas
  if (isCmeOnly) {
    const isAllowedPath = CME_ONLY_ALLOWED_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))
    if (!isAllowedPath) {
      return <Navigate to="/home" replace />
    }
  }

  // /dashboard-cme so pode ser acessado em CME-only mode
  if (location.pathname.startsWith('/dashboard-cme') && !isCmeOnly) {
    return <Navigate to="/home" replace />
  }

  // Role check (apenas para login com usuario)
  if (metadata?.allowedRoles && user) {
    const hasRole = metadata.allowedRoles.includes(user.role)
    if (!hasRole) {
      return <Navigate to="/403" replace />
    }
  }

  // Module check
  if (metadata?.allowedModules && cme) {
    const hasModule = metadata.allowedModules.includes(cme.module)
    if (!hasModule) {
      return <Navigate to="/home" replace />
    }
  }

  return <>{children}</>
}
