// packages
import { useState, useEffect } from 'react'
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
import { user_role, formatted_user_role, formatted_cme_module, cme_module } from '@/entities'

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
      style={{
        padding: '6px 8px',
        borderBottom: '1px solid var(--border-separator)'
      }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-sm cursor-pointer w-full"
        style={{
          padding: '8px 8px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--foreground)',
          fontSize: 'var(--text-body)',
          fontWeight: 600,
          transition: 'background-color 150ms ease',
          textAlign: 'left'
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
      >
        <ArrowLeft2 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
        {title}
      </button>
    </div>
  )
}

export function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const navigate = useNavigate()
  const { user, cme, setCme, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const [dialogView, setDialogView] = useState<DialogView>('main')

  // Lock body scroll when dialog is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  const isCmeOnly = !user && !!cme
  const adminRoutes = isCmeOnly ? [] : getVisibleAdminRoutes(ROUTES, user?.role, undefined)
  const displayName = isCmeOnly ? cme.corporateName : (user?.name || 'Usuário')
  const displayRole = isCmeOnly ? 'CME' : (user?.role ? formatted_user_role[user.role] : '')
  const displayEmail = isCmeOnly ? (cme.email || '') : (user?.email || '')
  const userInitial = displayName.charAt(0)?.toUpperCase() || 'U'
  const showAdminItems = isCmeOnly ? false : checkIsNonColab(user?.role)
  const showThemeToggle = isCmeOnly ? false : checkCanToggleTheme(user?.role)

  const goToView = (target: DialogView) => setDialogView(target)
  const goBack = () => setDialogView('main')

  const handleCmeSelect = (selectedCme: CmeProps) => {
    setCme(selectedCme)
    goBack()
  }

  const renderMainView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
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
            {displayName}
          </div>
          <div
            className="truncate"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}
          >
            {displayRole}{displayEmail ? ` \u2022 ${displayEmail}` : ''}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
        {/* Theme toggle - only for DEV and ADMINISTRADOR */}
        {showThemeToggle && (
          <MenuButton onClick={toggleTheme}>
            {theme === 'light'
              ? <Moon size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
              : <Sun1 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
            }
            {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          </MenuButton>
        )}

        {/* Alterar CME - hidden when logged in as CME directly */}
        {!isCmeOnly && (
          <MenuButton onClick={() => goToView('cme-selector')}>
            <Building size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
            Alterar CME
          </MenuButton>
        )}

        {/* Alterar Senha */}
        <MenuButton onClick={() => goToView('change-password')}>
          <Lock1 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
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
                {route.icon && <span style={{ color: 'var(--foreground)', flexShrink: 0, display: 'flex' }}>{getRouteIcon(route.icon, 18, false)}</span>}
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
          <LogoutCurve size={18} color="var(--destructive)" style={{ flexShrink: 0 }} />
          Sair
        </MenuButton>
      </div>
    </div>
  )

  const renderCmeSelectorView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
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
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <ViewHeader title="Alterar Senha" onBack={goBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: 16 }}>
          Formulário de alteração de senha (placeholder)
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

  if (!open) return null

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
          maxHeight: '85vh',
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-popover)',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {dialogView === 'main' && renderMainView()}
        {dialogView === 'cme-selector' && renderCmeSelectorView()}
        {dialogView === 'change-password' && renderChangePasswordView()}
      </div>
    </>
  )
}
