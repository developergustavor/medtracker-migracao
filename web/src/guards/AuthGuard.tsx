// packages
import { Navigate, useLocation } from 'react-router-dom'

// store
import { useAuthStore } from '@/store'

// guards
import { useAuth } from '@/guards/useAuth'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/guards/AuthGuard'

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

  if (metadata?.allowedRoles && user) {
    const hasRole = metadata.allowedRoles.includes(user.role)
    if (!hasRole) {
      return <Navigate to="/403" replace />
    }
  }

  if (metadata?.allowedModules && cme) {
    const hasModule = metadata.allowedModules.includes(cme.module)
    if (!hasModule) {
      return <Navigate to="/home" replace />
    }
  }

  return <>{children}</>
}
