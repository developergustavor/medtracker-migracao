// packages
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Moon,
  Sun1,
  LogoutCurve,
  Lock1,
  Building,
  ArrowLeft2
} from 'iconsax-react'

// store
import { useAuthStore } from '@/store'

// hooks
import { useTheme } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

// entities
import { formatted_user_role, formatted_cme_module, cme_module } from '@/entities'

// mock
import { mockCmes } from '@/mock/data'

// utils
import { getRouteIcon, canToggleTheme as checkCanToggleTheme, isNonColab as checkIsNonColab } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'
import type { CmeProps } from '@/entities'

const _loc = '@/components/layout/ProfileDialog'

type ProfileDialogProps = {
  open: boolean
  onClose: () => void
}

type DialogView = 'main' | 'cme-selector' | 'change-password'

const ADMIN_ROUTES = ['/gerenciamento', '/configuracoes']

const DIALOG_HEIGHT = 420

function getVisibleAdminRoutes(routes: RouteMetadataProps[], userRole: user_role | undefined, cmeModule: cme_module | undefined): RouteMetadataProps[] {
  return routes.filter(route => {
    if (!route.showInSidebar) return false
    if (!ADMIN_ROUTES.includes(route.path)) return false
    if (userRole && !route.allowedRoles.includes(userRole)) return false
    if (cmeModule && !route.allowedModules.includes(cmeModule)) return false
    return true
  })
}

function MenuButton({ onClick, children, destructive = false }: { onClick: () => void; children: React.ReactNode; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-md w-full cursor-pointer"
      style={{
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'transparent',
        border: 'none',
        color: destructive ? 'var(--destructive)' : 'var(--foreground)',
        fontSize: 'var(--text-sm)',
        fontWeight: destructive ? 500 : 400,
        transition: 'background-color 150ms ease',
        textAlign: 'left'
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = destructive ? 'var(--destructive-8)' : 'var(--nav-hover-bg)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
    >
      {children}
    </button>
  )
}

function ViewHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      className="flex items-center gap-sm"
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-separator)'
      }}
    >
      <button
        onClick={onBack}
        className="flex items-center justify-center cursor-pointer"
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--foreground)',
          transition: 'background-color 150ms ease'
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        <ArrowLeft2 size={18} color="currentColor" />
      </button>
      <span style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--foreground)' }}>
        {title}
      </span>
    </div>
  )
}

export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const navigate = useNavigate()
  const { user, cme, setCme, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const [dialogView, setDialogView] = useState<DialogView>('main')
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [isAnimating, setIsAnimating] = useState(false)
  const [secondaryView, setSecondaryView] = useState<DialogView | null>(null)
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const adminRoutes = getVisibleAdminRoutes(ROUTES, user?.role, undefined)
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'
  const showAdminItems = checkIsNonColab(user?.role)
  const showThemeToggle = checkCanToggleTheme(user?.role)

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current)
    }
  }, [])

  const goToView = (target: DialogView) => {
    if (isAnimating) return
    setSlideDirection('left')
    setSecondaryView(target)
    setIsAnimating(true)

    animationRef.current = setTimeout(() => {
      setDialogView(target)
      setSecondaryView(null)
      setIsAnimating(false)
    }, 250)
  }

  const goBack = () => {
    if (isAnimating) return
    setSlideDirection('right')
    setSecondaryView('main')
    setIsAnimating(true)

    animationRef.current = setTimeout(() => {
      setDialogView('main')
      setSecondaryView(null)
      setIsAnimating(false)
    }, 250)
  }

  const handleCmeSelect = (selectedCme: CmeProps) => {
    setCme(selectedCme)
    goBack()
  }

  const renderMainView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* User info header */}
      <div
        className="flex items-center gap-md"
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-separator)',
          flexShrink: 0
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-pill)',
            background: 'linear-gradient(135deg, #2155FC, #4B7BFF)',
            fontSize: 'var(--text-body)',
            fontWeight: 700,
            color: '#ffffff'
          }}
        >
          {userInitial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="truncate"
            style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--foreground)' }}
          >
            {user?.name || 'Usuario'}
          </div>
          <div
            className="truncate"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}
          >
            {user?.role ? formatted_user_role[user.role] : ''} &bull; {user?.email || ''}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
        {/* Theme toggle - only for DEV and ADMINISTRADOR */}
        {showThemeToggle && (
          <MenuButton onClick={toggleTheme}>
            {theme === 'light'
              ? <Moon size={18} color="currentColor" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              : <Sun1 size={18} color="currentColor" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            }
            {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          </MenuButton>
        )}

        {/* Alterar CME */}
        <MenuButton onClick={() => goToView('cme-selector')}>
          <Building size={18} color="currentColor" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          Alterar CME
        </MenuButton>

        {/* Alterar Senha */}
        <MenuButton onClick={() => goToView('change-password')}>
          <Lock1 size={18} color="currentColor" style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          Alterar Senha
        </MenuButton>

        {/* Admin-only items */}
        {adminRoutes.length > 0 && showAdminItems && (
          <>
            <div
              style={{
                height: 1,
                backgroundColor: 'var(--border-separator)',
                margin: '4px 12px'
              }}
            />

            {adminRoutes.map(route => (
              <MenuButton
                key={route.path}
                onClick={() => {
                  onClose()
                  navigate(route.path)
                }}
              >
                {route.icon && getRouteIcon(route.icon, 18, false)}
                {route.name}
              </MenuButton>
            ))}
          </>
        )}

        {/* Separator */}
        <div
          style={{
            height: 1,
            backgroundColor: 'var(--border-separator)',
            margin: '4px 12px'
          }}
        />

        {/* Logout */}
        <MenuButton
          destructive
          onClick={() => {
            onClose()
            logout()
          }}
        >
          <LogoutCurve size={18} color="currentColor" style={{ flexShrink: 0 }} />
          Sair
        </MenuButton>
      </div>
    </div>
  )

  const renderCmeSelectorView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ViewHeader title="Alterar CME" onBack={goBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {mockCmes.map(item => {
          const isCurrentCme = cme?.id === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleCmeSelect(item)}
              className="flex flex-col w-full cursor-pointer"
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isCurrentCme ? 'var(--primary-8)' : 'transparent',
                border: isCurrentCme ? '1px solid var(--primary-20)' : '1px solid transparent',
                color: 'var(--foreground)',
                fontSize: 'var(--text-sm)',
                transition: 'background-color 150ms ease',
                textAlign: 'left',
                marginBottom: 2
              }}
              onMouseEnter={e => {
                if (!isCurrentCme) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)'
              }}
              onMouseLeave={e => {
                if (!isCurrentCme) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }}
            >
              <div className="flex items-center gap-sm w-full">
                <span style={{ fontWeight: isCurrentCme ? 600 : 400, flex: 1, minWidth: 0 }} className="truncate">
                  {item.corporateName}
                </span>
                {isCurrentCme && (
                  <span
                    style={{
                      fontSize: 'var(--text-xxs)',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary-8)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-xs)',
                      flexShrink: 0
                    }}
                  >
                    Atual
                  </span>
                )}
              </div>
              <div className="flex items-center gap-sm" style={{ marginTop: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: item.module === cme_module.COMPLETO
                      ? 'var(--primary)'
                      : item.module === cme_module.IMPRESSAO
                        ? 'var(--info)'
                        : 'var(--warning)',
                    backgroundColor: item.module === cme_module.COMPLETO
                      ? 'var(--primary-10)'
                      : item.module === cme_module.IMPRESSAO
                        ? 'var(--info-10)'
                        : 'var(--warning-10)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    letterSpacing: '0.02em'
                  }}
                >
                  {formatted_cme_module[item.module]}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xxs)',
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {item.city}/{item.uf}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderChangePasswordView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ViewHeader title="Alterar Senha" onBack={goBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: 16 }}>
          Formulario de alteracao de senha (placeholder)
        </p>

        <div className="flex flex-col gap-sm">
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--foreground)',
                marginBottom: 4
              }}
            >
              Senha atual
            </label>
            <input
              type="password"
              disabled
              placeholder="********"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--muted-8)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-sm)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--foreground)',
                marginBottom: 4
              }}
            >
              Nova senha
            </label>
            <input
              type="password"
              disabled
              placeholder="********"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--muted-8)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-sm)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                color: 'var(--foreground)',
                marginBottom: 4
              }}
            >
              Confirmar senha
            </label>
            <input
              type="password"
              disabled
              placeholder="********"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--muted-8)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-sm)',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecondaryContent = () => {
    const view = secondaryView || dialogView
    if (view === 'cme-selector') return renderCmeSelectorView()
    if (view === 'change-password') return renderChangePasswordView()
    return renderMainView()
  }

  if (!open) return null

  const slidingForward = isAnimating && slideDirection === 'left'
  const slidingBack = isAnimating && slideDirection === 'right'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 101,
          width: 320,
          height: DIALOG_HEIGHT,
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-popover)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '100%'
          }}
        >
          {!isAnimating ? (
            // Static: render only the current view
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {dialogView === 'main' && renderMainView()}
              {dialogView === 'cme-selector' && renderCmeSelectorView()}
              {dialogView === 'change-password' && renderChangePasswordView()}
            </div>
          ) : (
            // Animating: render both views side by side
            <div
              style={{
                display: 'flex',
                width: '200%',
                height: '100%',
                transform: slidingForward
                  ? 'translateX(-50%)'
                  : slidingBack
                    ? 'translateX(0%)'
                    : 'translateX(0%)',
                transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              ref={el => {
                if (el && isAnimating) {
                  // Force initial position before transition
                  if (slideDirection === 'left') {
                    el.style.transform = 'translateX(0%)'
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    el.offsetHeight // force reflow
                    el.style.transform = 'translateX(-50%)'
                  } else {
                    el.style.transform = 'translateX(-50%)'
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    el.offsetHeight // force reflow
                    el.style.transform = 'translateX(0%)'
                  }
                }
              }}
            >
              <div style={{ width: '50%', flexShrink: 0, height: '100%' }}>
                {slideDirection === 'left' ? renderMainView() : renderSecondaryContent()}
              </div>
              <div style={{ width: '50%', flexShrink: 0, height: '100%' }}>
                {slideDirection === 'left' ? renderSecondaryContent() : (
                  dialogView === 'cme-selector' ? renderCmeSelectorView() :
                  dialogView === 'change-password' ? renderChangePasswordView() :
                  renderMainView()
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
