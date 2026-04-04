// packages
import { useState, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  SearchNormal1,
  Moon,
  Sun1,
  LogoutCurve,
  Lock1,
  Building,
  Book1,
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
import { getRouteIcon, canToggleTheme as checkCanToggleTheme, isNonColab as checkIsNonColab, isRoleIn } from '@/utils'

// types
import type { RouteMetadataProps } from '@/types'
import type { CmeProps } from '@/entities'

const _loc = '@/components/layout/ToolsSheet'

type ToolsSheetProps = {
  open: boolean
  onClose: () => void
  onOpenSubroutes: (route: RouteMetadataProps) => void
}

type SheetView = 'main' | 'cme-selector'

/** Routes shown in the navigation grid: workflow routes + others not in tab bar */
const TAB_BAR_PATHS = ['/home', '/dashboard', '/cadastros', '/ciclos', '/entrada-de-materiais', '/saida-de-materiais']
const ACCOUNT_SECTION_PATHS = ['/gerenciamento', '/configuracoes']

function getNavGridRoutes(routes: RouteMetadataProps[], userRole: user_role | undefined, cmeModule: cme_module | undefined): RouteMetadataProps[] {
  return routes.filter(route => {
    if (TAB_BAR_PATHS.includes(route.path)) return false
    if (ACCOUNT_SECTION_PATHS.includes(route.path)) return false
    if (!route.showInSidebar) return false
    if (userRole && !isRoleIn(userRole, route.allowedRoles)) return false
    if (cmeModule && !route.allowedModules.includes(cmeModule)) return false
    return true
  })
}

function getAccountAdminRoutes(routes: RouteMetadataProps[], userRole: user_role | undefined, cmeModule: cme_module | undefined): RouteMetadataProps[] {
  return routes.filter(route => {
    if (!ACCOUNT_SECTION_PATHS.includes(route.path)) return false
    if (userRole && !isRoleIn(userRole, route.allowedRoles)) return false
    if (cmeModule && !route.allowedModules.includes(cmeModule)) return false
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
  overflowX: 'hidden',
  animation: 'tools-sheet-slide-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
}

export function ToolsSheet({ open, onClose, onOpenSubroutes }: ToolsSheetProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, cme, setCme, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const [view, setView] = useState<SheetView>('main')
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left')
  const [secondaryView, setSecondaryView] = useState<SheetView | null>(null)
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showThemeToggle = checkCanToggleTheme(user?.role)
  const navGridRoutes = getNavGridRoutes(ROUTES, user?.role, cme?.module)
  const accountAdminRoutes = getAccountAdminRoutes(ROUTES, user?.role, cme?.module)
  const showAccountAdminRoutes = checkIsNonColab(user?.role) && accountAdminRoutes.length > 0
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current)
    }
  }, [])

  // Reset view when sheet closes — track previous open state
  const prevOpenRef = useRef(open)
  useEffect(() => {
    if (prevOpenRef.current && !open) {
      // Sheet just closed — schedule reset for next tick
      const resetTimer = setTimeout(() => {
        setView('main')
        setIsAnimating(false)
        setSecondaryView(null)
      }, 0)
      return () => clearTimeout(resetTimer)
    }
    prevOpenRef.current = open
  }, [open])

  const goToCmeSelector = useCallback(() => {
    if (isAnimating) return
    setSlideDirection('left')
    setSecondaryView('cme-selector')
    setIsAnimating(true)

    animationRef.current = setTimeout(() => {
      setView('cme-selector')
      setSecondaryView(null)
      setIsAnimating(false)
    }, 250)
  }, [isAnimating])

  const goBackToMain = useCallback(() => {
    if (isAnimating) return
    setSlideDirection('right')
    setSecondaryView('main')
    setIsAnimating(true)

    animationRef.current = setTimeout(() => {
      setView('main')
      setSecondaryView(null)
      setIsAnimating(false)
    }, 250)
  }, [isAnimating])

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

  const handleGridRouteClick = useCallback(
    (route: RouteMetadataProps) => {
      if (route.children && route.children.length > 0) {
        onClose()
        onOpenSubroutes(route)
      } else {
        navigate(route.path)
        onClose()
      }
    },
    [navigate, onClose, onOpenSubroutes]
  )

  const handleCmeSelect = useCallback(
    (selected: CmeProps) => {
      setCme(selected)
      goBackToMain()
    },
    [setCme, goBackToMain]
  )

  const handleLogout = useCallback(() => {
    onClose()
    logout()
  }, [onClose, logout])

  const handleSearchClick = useCallback(() => {
    const fullLoc = `${_loc}.handleSearchClick`
    console.log(`[${fullLoc}] Spotlight search triggered (placeholder)`)
  }, [])

  const isRouteActive = useCallback(
    (route: RouteMetadataProps): boolean => {
      if (location.pathname === route.path) return true
      if (route.children?.some(c => location.pathname.startsWith(c.path))) return true
      if (location.pathname.startsWith(route.path) && route.path !== '/home') return true
      return false
    },
    [location.pathname]
  )

  if (!open) return null

  const moduleBadge = cme?.module ? getModuleBadgeColors(cme.module) : null

  const renderMainView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
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
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 24px' }}>
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

        {/* CME Selector card — clickable */}
        {cme && (
          <button
            onClick={goToCmeSelector}
            className="flex flex-col w-full cursor-pointer"
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              marginBottom: 16,
              textAlign: 'left',
              transition: 'background-color 150ms ease'
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
                {cme.city}/{cme.uf}
              </span>
            </div>
          </button>
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
            {navGridRoutes.map(route => {
              const active = isRouteActive(route)
              return (
                <button
                  key={route.path}
                  onClick={() => handleGridRouteClick(route)}
                  className="flex flex-col items-center justify-center cursor-pointer"
                  style={{
                    padding: '14px 8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: active ? 'var(--primary-8)' : 'var(--background)',
                    border: '1px solid var(--border)',
                    color: active ? 'var(--primary)' : 'var(--foreground)',
                    fontSize: 'var(--text-xxs)',
                    fontWeight: active ? 600 : 500,
                    gap: 6,
                    transition: 'background-color 150ms ease'
                  }}
                >
                  {route.icon && getRouteIcon(route.icon, 22, active)}
                  <span className="truncate" style={{ maxWidth: '100%' }}>{route.name}</span>
                </button>
              )
            })}

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
          {/* Gerenciamento / Configuracoes — before Alterar Senha */}
          {showAccountAdminRoutes && accountAdminRoutes.map(route => (
            <button
              key={route.path}
              onClick={() => handleNavigate(route.path)}
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
              {route.icon && getRouteIcon(route.icon, 18, false)}
              {route.name}
            </button>
          ))}

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
  )

  const renderCmeSelectorView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      {/* Header with back button */}
      <div
        className="flex items-center gap-sm shrink-0"
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-separator)'
        }}
      >
        <button
          onClick={goBackToMain}
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
        >
          <ArrowLeft2 size={18} color="currentColor" />
        </button>
        <span style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--foreground)' }}>
          Alterar CME
        </span>
      </div>

      {/* CME list */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 12px 24px' }}>
        {mockCmes.map(item => {
          const isCurrentCme = cme?.id === item.id
          const moduleColors = getModuleBadgeColors(item.module)

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
                    color: moduleColors.color,
                    backgroundColor: moduleColors.bg,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    letterSpacing: '0.02em'
                  }}
                >
                  {formatted_cme_module[item.module]}
                </span>
                <span style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}>
                  {item.city}/{item.uf}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderSecondaryContent = () => {
    const target = secondaryView || view
    if (target === 'cme-selector') return renderCmeSelectorView()
    return renderMainView()
  }

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
          <div style={{ overflow: 'hidden', overflowX: 'hidden', position: 'relative', height: '100%' }}>
            {!isAnimating ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
                {view === 'main' && renderMainView()}
                {view === 'cme-selector' && renderCmeSelectorView()}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: '200%',
                  height: '100%',
                  transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                  overflowX: 'hidden'
                }}
                ref={el => {
                  if (el && isAnimating) {
                    if (slideDirection === 'left') {
                      el.style.transform = 'translateX(0%)'
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      el.offsetHeight
                      el.style.transform = 'translateX(-50%)'
                    } else {
                      el.style.transform = 'translateX(-50%)'
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      el.offsetHeight
                      el.style.transform = 'translateX(0%)'
                    }
                  }
                }}
              >
                <div style={{ width: '50%', flexShrink: 0, height: '100%', overflowX: 'hidden' }}>
                  {slideDirection === 'left' ? renderMainView() : renderSecondaryContent()}
                </div>
                <div style={{ width: '50%', flexShrink: 0, height: '100%', overflowX: 'hidden' }}>
                  {slideDirection === 'left' ? renderSecondaryContent() : (
                    view === 'cme-selector' ? renderCmeSelectorView() : renderMainView()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
