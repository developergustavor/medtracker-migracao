// packages
import { useState } from 'react'

// guards
import { AuthContext } from '@/guards/auth.context'

const _loc = '@/guards/AuthProvider'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading] = useState(false)

  return <AuthContext.Provider value={{ loading }}>{children}</AuthContext.Provider>
}
