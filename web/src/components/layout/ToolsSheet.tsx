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
  onOpenSpotlight: () => void
}

type SheetView = 'main' | 'cme-selector'

/** Routes shown in the navigation grid: workflow routes + others not in tab bar */
const TAB_BAR_PATHS = ['/home', '/dashboard', '/cadastros', '/ciclos', '/entrada-de-materiais', '/saida-de-materiais']
const ACCOUNT_SECTION_PATHS = ['/gerenciamento', '/configuracoes']

function getNavGridRoutes(routes: RouteMetadataProps[], userRole: user_role | undefined, cmeModule: cme_module | undefined): RouteMetadataProps[] {
  return routes.filter(route => {
    if (TAB_BAR_PATHS.includes(route.path)) return false
    if (ACCOUNT_SECTION_PATHS.includes(route.path)) return false
    if (route.path === '/dashboard-cme') return false
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

export function ToolsSheet({ open, onClose, onOpenSubroutes, onOpenSpotlight }: ToolsSheetProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, cme, setCme, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const [view, setView] = useState<SheetView>('main')

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  const isCmeOnly = !user && !!cme
  const showThemeToggle = isCmeOnly ? false : checkCanToggleTheme(user?.role)
  const navGridRoutes = isCmeOnly
    ? ROUTES.filter(r => r.path === '/dashboard-cme' && r.showInSidebar)
    : getNavGridRoutes(ROUTES, user?.role, cme?.module)
  const accountAdminRoutes = isCmeOnly ? [] : getAccountAdminRoutes(ROUTES, user?.role, cme?.module)
  const showAccountAdminRoutes = isCmeOnly ? false : checkIsNonColab(user?.role) && accountAdminRoutes.length > 0
  const displayName = isCmeOnly ? cme.corporateName : (user?.name || 'Usuário')
  const displayRole = isCmeOnly ? 'CME' : (user?.role ? formatted_user_role[user.role] : '')
  const userInitial = displayName.charAt(0)?.toUpperCase() || 'U'

  // Touch gesture: drag sheet up/down, release to close or snap back
  const touchStartY = useRef(0)
  const touchMovedRef = useRef(false)
  const [dragY, setDragY] = useState(0)
  const [activeDrag, setActiveDrag] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchMovedRef.current = false
    setActiveDrag(true)
    setDragY(0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!activeDrag) return
    touchMovedRef.current = true
    const deltaY = e.touches[0].clientY - touchStartY.current
    setDragY(deltaY > 0 ? deltaY : deltaY * 0.2)
  }, [activeDrag])

  const handleTouchEnd = useCallback(() => {
    if (!activeDrag) return
    setActiveDrag(false)
    if (!touchMovedRef.current) {
      // No movement — it was a click, not a drag. Reset and let onClick handle it.
      setDragY(0)
      return
    }
    if (dragY > 80) {
      // Close with exit animation
      setDragY(window.innerHeight)
      setTimeout(() => {
        onClose()
        setDragY(0)
      }, 200)
    } else {
      // Snap back
      setDragY(0)
    }
  }, [activeDrag, dragY, onClose])

  // Reset view when sheet closes
  const prevOpenRef = useRef(open)
  useEffect(() => {
    if (prevOpenRef.current && !open) {
      const t = setTimeout(() => setView('main'), 300)
      return () => clearTimeout(t)
    }
    prevOpenRef.current = open
  }, [open])

  const goToCmeSelector = useCallback(() => setView('cme-selector'), [])
  const goBackToMain = useCallback(() => setView('main'), [])

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
    onClose()
    onOpenSpotlight()
  }, [onClose, onOpenSpotlight])

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
      <div
        className="flex items-center justify-center shrink-0"
        style={{ padding: '10px 0 6px' }}
        onTouchStart={handleTouchStart}
      >
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
      <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 24px', touchAction: 'pan-y' }}>
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
          <span className="flex-1" style={{ textAlign: 'left' }}>Buscar...</span>
          <kbd
            style={{
              fontSize: 10,
              fontWeight: 500,
              fontFamily: 'inherit',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--elevated)',
              color: 'var(--fg-muted)',
              border: '1px solid var(--border-subtle)',
              lineHeight: 1.4,
              flexShrink: 0
            }}
          >
            {typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </button>

        {/* CME Selector card — clickable (hidden in CME-only mode) */}
        {cme && !isCmeOnly && (
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
              <Building size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
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
              {displayName}
            </div>
            <div
              className="truncate"
              style={{ fontSize: 'var(--text-xxs)', color: 'var(--muted-foreground)' }}
            >
              {displayRole}
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div className="flex flex-col" style={{ gap: 2 }}>
          {/* Gerenciamento / Configurações — before Alterar Senha */}
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
              {route.icon && <span style={{ color: 'var(--foreground)', display: 'flex', flexShrink: 0 }}>{getRouteIcon(route.icon, 18, false)}</span>}
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
            <Lock1 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
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
                ? <Moon size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
                : <Sun1 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
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
        className="shrink-0"
        style={{
          padding: '6px 8px',
          borderBottom: '1px solid var(--border-separator)'
        }}
      >
        <button
          onClick={goBackToMain}
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
          Alterar CME
        </button>
      </div>

      {/* CME list */}
      <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 12px 24px', touchAction: 'pan-y' }}>
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

  return createPortal(
    <>
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

      <div
        style={{ position: 'fixed', inset: 0, zIndex: 200, touchAction: 'none', overscrollBehavior: 'contain' }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          onTouchStart={handleTouchStart}
          onClick={() => { if (!touchMovedRef.current) handleClose() }}
          style={{
            ...backdropStyle,
            opacity: dragY > 0 ? Math.max(0, 1 - dragY / 300) : undefined
          }}
        />

        <div style={{
          ...sheetStyle,
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: activeDrag ? 'none' : 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          animation: dragY === 0 && !activeDrag ? sheetStyle.animation : 'none'
        }}>
          <div
            style={{
              display: 'flex',
              width: '200%',
              height: '100%',
              transform: view === 'main' ? 'translateX(0%)' : 'translateX(-50%)',
              transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              overflowX: 'hidden'
            }}
          >
            <div style={{ width: '50%', flexShrink: 0, height: '100%', overflowX: 'hidden', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {renderMainView()}
            </div>
            <div style={{ width: '50%', flexShrink: 0, height: '100%', overflowX: 'hidden', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {renderCmeSelectorView()}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
