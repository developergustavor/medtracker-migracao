// packages
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// components
import { LoginTabs } from './LoginTabs'
import { CodeForm } from './CodeForm'
import { CpfForm } from './CpfForm'
import { CmeForm } from './CmeForm'
import { FacialPlaceholder } from './FacialPlaceholder'
import { TwoFactorView } from './TwoFactorView'

// store
import { useAuthStore } from '@/store'
import { useUIStore } from '@/store'

// hooks
import { useTheme } from '@/hooks'

const _loc = '@/pages/login/Login'

type LoginTab = 'code' | 'cpf' | 'cme' | 'facial'

type TwoFactorState = {
  active: boolean
  userId: number
  email: string
}

export function Login() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { defaultLoginTab, setDefaultLoginTab } = useUIStore()
  const { theme } = useTheme()

  const [activeTab, setActiveTab] = useState<LoginTab>(defaultLoginTab || 'code')
  const [twoFactor, setTwoFactor] = useState<TwoFactorState>({
    active: false,
    userId: 0,
    email: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleTabChange = (tab: LoginTab) => {
    setActiveTab(tab)
    setDefaultLoginTab(tab)
    setTwoFactor({ active: false, userId: 0, email: '' })
  }

  const handleTwoFactor = (userId: number, email: string) => {
    setTwoFactor({ active: true, userId, email })
  }

  const handleTwoFactorBack = () => {
    setTwoFactor({ active: false, userId: 0, email: '' })
  }

  if (isAuthenticated) return null

  const logoSrc = theme === 'dark'
    ? '/images/logo/logo-white-full-gradient.svg'
    : '/images/logo/logo-full-gradient.svg'

  const renderTabContent = () => {
    if (twoFactor.active) {
      return (
        <TwoFactorView
          userId={twoFactor.userId}
          email={twoFactor.email}
          onBack={handleTwoFactorBack}
        />
      )
    }

    switch (activeTab) {
      case 'code':
        return <CodeForm onTwoFactor={handleTwoFactor} />
      case 'cpf':
        return <CpfForm onTwoFactor={handleTwoFactor} />
      case 'cme':
        return <CmeForm />
      case 'facial':
        return <FacialPlaceholder />
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-dvh w-full p-[24px]"
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, hsl(220 15% 8%) 0%, hsl(220 15% 12%) 50%, hsl(220 15% 8%) 100%)'
          : 'linear-gradient(135deg, hsl(220 40% 96%) 0%, hsl(220 30% 98%) 50%, hsl(230 40% 96%) 100%)'
      }}
    >
      <div
        className="flex flex-col items-center gap-[24px] w-full bg-card border border-border rounded-[16px] smAndDown:max-w-none smAndDown:rounded-none smAndDown:shadow-none smAndDown:bg-transparent smAndDown:border-0 smAndDown:p-0"
        style={{
          maxWidth: 420,
          padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}
      >
        <div className="flex flex-col items-center gap-[12px]">
          <img
            src={logoSrc}
            alt="Medtracker"
            style={{ height: 64 }}
          />
          <p className="text-xs text-center text-muted-foreground">
            Insira seus dados para acessar a plataforma
          </p>
        </div>

        {!twoFactor.active && (
          <LoginTabs activeTab={activeTab} onTabChange={handleTabChange} />
        )}

        <div className="w-full" style={{ transition: 'opacity 150ms ease' }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
