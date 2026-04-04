// packages
import { useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  SearchNormal1,
  Moon,
  Sun1,
  LogoutCurve,
  Lock1,
  Building,
  Book1
} from 'iconsax-react'

// store
import { useAuthStore } from '@/store'

// hooks
import { useTheme } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

// entities
import { user_role, formatted_user_role, formatted_cme_module, cme_module } from '@/entities'

// utils
import { getRouteIcon, canToggleTheme as checkCanToggleTheme, isRoleIn } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/components/layout/ToolsSheet'

type ToolsSheetProps = {
  open: boolean
  onClose: () => void
}

const NAV_GRID_ROUTES = ['/dashboard', '/cadastros', '/relatorios', '/configuracoes', '/gerenciamento']

function getNavGridRoutes(routes: RouteMetadataProps[], userRole: user_role | undefined): RouteMetadataProps[] {
  return routes.filter(route => {
    if (!NAV_GRID_ROUTES.includes(route.path)) return false
    if (userRole && !isRoleIn(userRole, route.allowedRoles)) return false
    return true
  })
}

function getModuleBadgeColors(mod: cme_module): { color: string; bg: string } {
  switch (mod) {
    case cme_module.COMPLETO:
      return { color: 'var(--primary)', bg: 'var(--primary-10)' }
    case cme_module.IMPRESSAO:
      return { color: 'var(--info)', bg: 'var(--info-10)' }
    case cme_module.ETIQUETAGEM:
      return { color: 'var(--warning)', bg: 'var(--warning-10)' }
    default:
      return { color: 'var(--muted-foreground)', bg: 'var(--muted-8)' }
  }
}

const backdropStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  animation: 'tools-sheet-backdrop-in 200ms ease forwards'
}

const sheetStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  maxHeight: '88vh',
  backgroundColor: 'var(--card)',
  borderTopLeftRadius: 'var(--radius-xl)',
  borderTopRightRadius: 'var(--radius-xl)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'tools-sheet-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
}

export function ToolsSheet({ open, onClose }: ToolsSheetProps) {
  const navigate = useNavigate()
  const { user, cme, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const showThemeToggle = checkCanToggleTheme(user?.role)
  const navGridRoutes = getNavGridRoutes(ROUTES, user?.role)
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path)
      onClose()
    },
    [navigate, onClose]
  )

  const handleLogout = useCallback(() => {
    onClose()
    logout()
  }, [onClose, logout])

  const handleSearchClick = useCallback(() => {
    const fullLoc = `${_loc}.handleSearchClick`
    console.log(`[${fullLoc}] Spotlight search triggered (placeholder)`)
  }, [])

  if (!open) return null

  const moduleBadge = cme?.module ? getModuleBadgeColors(cme.module) : null

  return createPortal(
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes tools-sheet-slide-in {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes tools-sheet-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
        {/* Backdrop */}
        <div onClick={handleClose} style={backdropStyle} />

        {/* Sheet */}
        <div style={sheetStyle}>
          {/* Handle bar */}
          <div className="flex items-center justify-center shrink-0" style={{ padding: '10px 0 6px' }}>
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'var(--muted-foreground)',
                opacity: 0.3
              }}
            />
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
            {/* Search input */}
            <button
              onClick={handleSearchClick}
              className="flex items-center gap-sm w-full cursor-pointer"
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--muted-8)',
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-sm)',
                textAlign: 'left',
                marginBottom: 16
              }}
            >
              <SearchNormal1 size={18} color="currentColor" />
              <span>Buscar...</span>
            </button>

            {/* CME Selector card */}
            {cme && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  marginBottom: 16
                }}
              >
                <div className="flex items-center gap-sm">
                  <Building size={18} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                  <span
                    className="truncate"
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--foreground)', flex: 1 }}
                  >
                    {cme.corporateName}
                  </span>
                </div>
                <div className="flex items-center gap-sm" style={{ marginTop: 6, marginLeft: 26 }}>
                  {moduleBadge && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: moduleBadge.color,
                        backgroundColor: moduleBadge.bg,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-pill)',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {formatted_cme_module[cme.module]}
                    </span>
                  )}
                  <span style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}>
                    {cme.status}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation grid */}
            {navGridRoutes.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginBottom: 16
                }}
              >
                {navGridRoutes.map(route => (
                  <button
                    key={route.path}
                    onClick={() => handleNavigate(route.path)}
                    className="flex flex-col items-center justify-center cursor-pointer"
                    style={{
                      padding: '14px 8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      fontSize: 'var(--text-xxs)',
                      fontWeight: 500,
                      gap: 6,
                      transition: 'background-color 150ms ease'
                    }}
                  >
                    {route.icon && getRouteIcon(route.icon, 22, false)}
                    <span className="truncate" style={{ maxWidth: '100%' }}>{route.name}</span>
                  </button>
                ))}

                {/* Manual button (static) */}
                <button
                  onClick={() => {
                    console.log(`[${_loc}] Manual clicked (placeholder)`)
                    onClose()
                  }}
                  className="flex flex-col items-center justify-center cursor-pointer"
                  style={{
                    padding: '14px 8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontSize: 'var(--text-xxs)',
                    fontWeight: 500,
                    gap: 6,
                    transition: 'background-color 150ms ease'
                  }}
                >
                  <Book1 size={22} variant="Linear" color="currentColor" />
                  <span>Manual</span>
                </button>
              </div>
            )}

            {/* Separator */}
            <div style={{ height: 1, backgroundColor: 'var(--border-separator)', marginBottom: 12 }} />

            {/* Account section */}
            <div
              className="flex items-center gap-md"
              style={{
                padding: '10px 4px',
                marginBottom: 8
              }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9999,
                  background: 'linear-gradient(135deg, #2155FC, #4B7BFF)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: '#ffffff'
                }}
              >
                {userInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="truncate"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--foreground)' }}
                >
                  {user?.name || 'Usuario'}
                </div>
                <div
                  className="truncate"
                  style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}
                >
                  {user?.role ? formatted_user_role[user.role] : ''}
                </div>
              </div>
            </div>

            {/* Account actions */}
            <div className="flex flex-col" style={{ gap: 2 }}>
              {/* Alterar Senha */}
              <button
                onClick={() => {
                  console.log(`[${_loc}] Alterar Senha clicked (placeholder)`)
                  onClose()
                }}
                className="flex items-center gap-md w-full cursor-pointer"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-sm)',
                  textAlign: 'left',
                  transition: 'background-color 150ms ease'
                }}
              >
                <Lock1 size={18} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                Alterar Senha
              </button>

              {/* Theme toggle */}
              {showThemeToggle && (
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-md w-full cursor-pointer"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--foreground)',
                    fontSize: 'var(--text-sm)',
                    textAlign: 'left',
                    transition: 'background-color 150ms ease'
                  }}
                >
                  {theme === 'light'
                    ? <Moon size={18} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                    : <Sun1 size={18} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
                  }
                  {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
                </button>
              )}

              {/* Separator */}
              <div style={{ height: 1, backgroundColor: 'var(--border-separator)', margin: '4px 12px' }} />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-md w-full cursor-pointer"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--destructive)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'background-color 150ms ease'
                }}
              >
                <LogoutCurve size={18} color="currentColor" style={{ flexShrink: 0 }} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
