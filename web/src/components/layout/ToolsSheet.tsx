// packages
import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  SearchNormal1,
  Moon,
  Sun1,
  LogoutCurve,
  Lock1,
  Building,
  Book1,
  ArrowLeft2,
  Notification
} from 'iconsax-react'

// components
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// store
import { useAuthStore } from '@/store'

// hooks
import { useTheme } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

// entities
import { user_role, formatted_user_role, formatted_cme_module, cme_module } from '@/entities'

// mock
import { mockCmes, mockNotifications, mockSupportLinks } from '@/mock/data'

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

type SheetView = 'main' | 'cme-selector' | 'notifications' | 'support'

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

export function ToolsSheet({ open, onClose, onOpenSubroutes, onOpenSpotlight }: ToolsSheetProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, cme, setCme, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()

  const [view, setView] = useState<SheetView>('main')

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

  const moduleBadge = cme?.module ? getModuleBadgeColors(cme.module) : null

  const renderMainView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      {/* Scrollable content */}
      <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 0 24px', touchAction: 'pan-y' }}>
        {/* Search input */}
        <button
          onClick={handleSearchClick}
          className="flex items-center gap-sm w-full cursor-pointer rounded-md border border-border text-muted-foreground text-sm"
          style={{
            padding: '10px 14px',
            backgroundColor: 'var(--muted-8)',
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
            className="flex flex-col w-full cursor-pointer rounded-md bg-background border border-border"
            style={{
              padding: '12px 14px',
              marginBottom: 16,
              textAlign: 'left',
              transition: 'background-color 150ms ease'
            }}
          >
            <div className="flex items-center gap-sm">
              <Building size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
              <span
                className="truncate text-sm text-foreground" style={{ fontWeight: 600, flex: 1 }}
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
                  className="flex flex-col items-center justify-center cursor-pointer rounded-md border border-border"
                  style={{
                    padding: '14px 8px',
                    backgroundColor: active ? 'var(--primary-8)' : 'var(--background)',
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

            {/* Notificações card */}
            <button
              onClick={() => setView('notifications')}
              className="flex flex-col items-center justify-center cursor-pointer rounded-md bg-background border border-border text-foreground"
              style={{
                padding: '14px 8px',
                fontSize: 'var(--text-xxs)',
                fontWeight: 500,
                gap: 6,
                transition: 'background-color 150ms ease',
                position: 'relative'
              }}
            >
              <Notification size={22} variant="Linear" color="currentColor" />
              <span>Notificações</span>
              {mockNotifications.length > 0 && (
                <span
                  className="flex items-center justify-center"
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    minWidth: 18,
                    height: 18,
                    padding: '0 5px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--destructive)',
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: 700,
                    lineHeight: 1
                  }}
                >
                  {mockNotifications.length}
                </span>
              )}
            </button>

            {/* Material de apoio card */}
            <button
              onClick={() => setView('support')}
              className="flex flex-col items-center justify-center cursor-pointer rounded-md bg-background border border-border text-foreground"
              style={{
                padding: '14px 8px',
                fontSize: 'var(--text-xxs)',
                fontWeight: 500,
                gap: 6,
                transition: 'background-color 150ms ease'
              }}
            >
              <Book1 size={22} variant="Linear" color="currentColor" />
              <span>Apoio</span>
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
            className="flex items-center justify-center shrink-0 text-sm"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: 'linear-gradient(135deg, #2155FC, #4B7BFF)',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            {userInitial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="truncate text-sm text-foreground"
              style={{ fontWeight: 600 }}
            >
              {displayName}
            </div>
            <div
              className="truncate text-muted-foreground"
              style={{ fontSize: 'var(--text-xxs)' }}
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
              className="flex items-center gap-md w-full cursor-pointer rounded-sm text-foreground text-sm"
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                transition: 'background-color 150ms ease'
              }}
            >
              {route.icon && <span className="text-foreground" style={{ display: 'flex', flexShrink: 0 }}>{getRouteIcon(route.icon, 18, false)}</span>}
              {route.name}
            </button>
          ))}

          {/* Alterar Senha */}
          <button
            onClick={() => {
              console.log(`[${_loc}] Alterar Senha clicked (placeholder)`)
              onClose()
            }}
            className="flex items-center gap-md w-full cursor-pointer rounded-sm text-foreground text-sm"
            style={{
              padding: '10px 12px',
              backgroundColor: 'transparent',
              border: 'none',
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
              className="flex items-center gap-md w-full cursor-pointer rounded-sm text-foreground text-sm"
              style={{
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
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
            className="flex items-center gap-md w-full cursor-pointer rounded-sm text-destructive text-sm"
            style={{
              padding: '10px 12px',
              backgroundColor: 'transparent',
              border: 'none',
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
          padding: '6px 0',
          borderBottom: '1px solid var(--border-separator)'
        }}
      >
        <button
          onClick={goBackToMain}
          className="flex items-center gap-sm cursor-pointer w-full rounded-sm text-foreground text-body"
          style={{
            padding: '8px 8px',
            backgroundColor: 'transparent',
            border: 'none',
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
      <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 24px', touchAction: 'pan-y' }}>
        {mockCmes.map(item => {
          const isCurrentCme = cme?.id === item.id
          const moduleColors = getModuleBadgeColors(item.module)

          return (
            <button
              key={item.id}
              onClick={() => handleCmeSelect(item)}
              className="flex flex-col w-full cursor-pointer rounded-sm text-foreground text-sm"
              style={{
                padding: '10px 12px',
                backgroundColor: isCurrentCme ? 'var(--primary-8)' : 'transparent',
                border: isCurrentCme ? '1px solid var(--primary-20)' : '1px solid transparent',
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
                    className="text-primary rounded-xs"
                    style={{
                      fontSize: 'var(--text-xxs)',
                      fontWeight: 600,
                      backgroundColor: 'var(--primary-8)',
                      padding: '2px 6px',
                      flexShrink: 0
                    }}
                  >
                    Atual
                  </span>
                )}
              </div>
              <div className="flex items-center gap-sm" style={{ marginTop: 4 }}>
                <span
                  className="rounded-pill"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: moduleColors.color,
                    backgroundColor: moduleColors.bg,
                    padding: '2px 8px',
                    letterSpacing: '0.02em'
                  }}
                >
                  {formatted_cme_module[item.module]}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xxs)' }}>
                  {item.city}/{item.uf}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderNotificationsView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      <div className="shrink-0" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-separator)' }}>
        <button
          onClick={goBackToMain}
          className="flex items-center gap-sm cursor-pointer w-full rounded-sm text-foreground text-body"
          style={{ padding: '8px 8px', backgroundColor: 'transparent', border: 'none', fontWeight: 600, transition: 'background-color 150ms ease', textAlign: 'left' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
        >
          <ArrowLeft2 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
          Notificações
        </button>
      </div>
      <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 24px', touchAction: 'pan-y' }}>
        {mockNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-xl text-muted-foreground text-sm">
            Nenhuma notificação
          </div>
        ) : (
          mockNotifications.map(notification => (
            <button
              key={notification.id}
              onClick={() => { console.log(`[${_loc}] Notification clicked:`, notification.id); onClose() }}
              className="flex flex-col w-full cursor-pointer rounded-sm text-foreground text-sm"
              style={{ padding: '10px 12px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', transition: 'background-color 150ms ease', marginBottom: 2 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
            >
              <span style={{ fontWeight: 500, lineHeight: 1.4 }}>{notification.title}</span>
              <span className="text-xs text-muted-foreground" style={{ marginTop: 2 }}>{notification.time}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )

  const renderSupportView = () => (
    <div style={{ width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      <div className="shrink-0" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-separator)' }}>
        <button
          onClick={goBackToMain}
          className="flex items-center gap-sm cursor-pointer w-full rounded-sm text-foreground text-body"
          style={{ padding: '8px 8px', backgroundColor: 'transparent', border: 'none', fontWeight: 600, transition: 'background-color 150ms ease', textAlign: 'left' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
        >
          <ArrowLeft2 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
          Material de apoio
        </button>
      </div>
      <div data-scrollable style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0 24px', touchAction: 'pan-y' }}>
        {mockSupportLinks.map(link => (
          <button
            key={link.id}
            onClick={() => { console.log(`[${_loc}] Support link clicked:`, link.id); onClose() }}
            className="flex items-center gap-md w-full cursor-pointer rounded-sm text-foreground text-sm"
            style={{ padding: '10px 12px', backgroundColor: 'transparent', border: 'none', textAlign: 'left', transition: 'background-color 150ms ease', marginBottom: 2 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <Book1 size={18} color="var(--foreground)" style={{ flexShrink: 0 }} />
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={val => { if (!val) onClose() }}>
      <SheetContent side="bottom" className="max-h-[88vh] rounded-t-[16px]">
        <SheetHeader>
          <SheetTitle>Ferramentas</SheetTitle>
        </SheetHeader>

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
            {view === 'cme-selector' && renderCmeSelectorView()}
            {view === 'notifications' && renderNotificationsView()}
            {view === 'support' && renderSupportView()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
