// packages
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scan } from 'iconsax-react'

// store
import { useAuthStore } from '@/store'

// mock
import { mockUsers, mockCmes } from '@/mock/data'

const _loc = '@/pages/Login'

export function Login() {
  const navigate = useNavigate()
  const { isAuthenticated, login, setCme } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleQuickLogin = () => {
    const fullLoc = `${_loc}.handleQuickLogin`
    try {
      const user = mockUsers[0]
      const cme = mockCmes[0]
      if (user && cme) {
        login(user, `mock-jwt-token-${user.id}`)
        setCme(cme)
        navigate('/home', { replace: true })
      }
    } catch (err) {
      console.error(`Unhandled rejection at ${fullLoc}. Details:`, err)
    }
  }

  if (isAuthenticated) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-lg" style={{ backgroundColor: 'var(--bg)' }}>
      <div
        className="flex items-center justify-center rounded-md"
        style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #2155FC, #4B7BFF)' }}
      >
        <span className="text-title font-bold" style={{ color: '#ffffff' }}>M</span>
      </div>
      <h1 className="text-display font-bold" style={{ color: 'var(--foreground)' }}>Medtracker Etiquetagem</h1>
      <p className="text-body" style={{ color: 'var(--muted-foreground)' }}>Login — placeholder (Task 10)</p>

      {/* Quick login for dev */}
      <button
        onClick={handleQuickLogin}
        className="px-xl py-md rounded-sm text-sm font-medium cursor-pointer"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-fg)',
          border: 'none',
          transition: 'opacity 150ms ease'
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        Login rapido (Gustavo — Admin)
      </button>

      {/* Login facial placeholder */}
      <button
        className="flex items-center gap-sm px-xl py-md rounded-sm text-sm font-medium cursor-pointer"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--muted-foreground)',
          border: '1px solid var(--border)',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--primary)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
        }}
        onClick={() => {
          // TODO: Implementar login por reconhecimento facial
          alert('Login facial — funcionalidade futura')
        }}
      >
        <Scan size={18} color="currentColor" />
        Login por reconhecimento facial
      </button>

      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>CME: Medtracker LTDA — Modulo Completo</p>
    </div>
  )
}
