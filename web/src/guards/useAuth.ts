// packages
import { useContext } from 'react'

// guards
import { AuthContext } from '@/guards/auth.context'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
