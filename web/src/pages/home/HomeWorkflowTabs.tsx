// packages
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// store
import { useAuthStore } from '@/store'

// hooks
import { useIsMobile, useIsDesktop } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

// libs
import { cn } from '@/libs/shadcn.utils'

// utils
import { getRouteIcon } from '@/utils/routes.utils'
import { isRoleIn, isNonColab, isAdminOrAbove } from '@/utils/roles.utils'

// mock
import { mockWorkflowDescriptions } from '@/mock/data'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/pages/home/HomeWorkflowTabs'

const WORKFLOW_CARDS = [
  '/entrada-de-materiais',
  '/ciclos/desinfeccao',
  '/ciclos/esterilizacao',
  '/saida-de-materiais',
  '/conferencia'
]

const WORKFLOW_DESCRIPTIONS: Record<string, string> = {
  '/entrada-de-materiais': 'Registre a entrada de materiais na CME',
  '/ciclos/desinfeccao': 'Ciclos de desinfecção de materiais',
  '/ciclos/esterilizacao': 'Ciclos de esterilização com autoclaves',
  '/saida-de-materiais': 'Saída de materiais para setores e CMEs',
  '/conferencia': 'Conferência no centro cirúrgico'
}

function findRoute(path: string): RouteMetadataProps | undefined {
  for (const route of ROUTES) {
    if (route.path === path) return route
    if (route.children) {
      const child = route.children.find(c => c.path === path)
      if (child) return child
    }
  }
  return undefined
}

export function HomeWorkflowTabs() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, cme } = useAuthStore()
  const isDesktop = useIsDesktop()
  const isCmeOnly = !user && !!cme

  const workflowCards = useMemo(() => {
    return WORKFLOW_CARDS.map(path => {
      const route = findRoute(path)
      if (!route) return null

      // RBAC: role check
      if (user?.role && !isRoleIn(user.role, route.allowedRoles)) return null

      // Module check: conferencia requires COMPLETO
      let moduleAllowed = true
      if (cme?.module) {
        // Find parent route for module check
        const parent = ROUTES.find(r => r.children?.some(c => c.path === path)) || route
        if (!parent.allowedModules.includes(cme.module)) {
          moduleAllowed = false
        }
      }

      return { route, path, moduleAllowed }
    }).filter(Boolean) as { route: RouteMetadataProps; path: string; moduleAllowed: boolean }[]
  }, [user, cme])

  const showDashboard = !isCmeOnly && isNonColab(user?.role)
  const showDashboardCme = isCmeOnly
  const showCadastros = !isCmeOnly && isNonColab(user?.role)
  const showRelatorios = !isCmeOnly && isAdminOrAbove(user?.role)

  const hasQuickActions = showDashboard || showDashboardCme || showCadastros || showRelatorios

  if (isCmeOnly) return null

  return (
    <div className="flex flex-col gap-md h-full">
      {/* Quick action buttons (subtopbar style) */}
      {hasQuickActions && (
        <div className="flex items-center gap-sm flex-wrap">
          {showDashboard && (
            <QuickActionButton
              icon="Chart"
              label="Dashboard"
              onClick={() => navigate('/dashboard')}
            />
          )}
          {showDashboardCme && (
            <QuickActionButton
              icon="Chart"
              label="Dashboard CME"
              onClick={() => navigate('/dashboard-cme')}
            />
          )}
          {showCadastros && (
            <QuickActionButton
              icon="AddSquare"
              label="Cadastros"
              onClick={() => navigate('/cadastros')}
            />
          )}
          {showRelatorios && (
            <QuickActionButton
              icon="DocumentText"
              label="Relatórios"
              onClick={() => navigate('/relatorios')}
            />
          )}
        </div>
      )}

      {/* Workflow cards grid */}
      <div className={`grid gap-md flex-1 min-h-0 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lgAndUp:grid-cols-5'}`}>
        {workflowCards.map(({ route, path, moduleAllowed }) => (
          <WorkflowCard
            key={path}
            route={route}
            path={path}
            description={WORKFLOW_DESCRIPTIONS[path] || mockWorkflowDescriptions[path]?.description || ''}
            disabled={!moduleAllowed}
            fillHeight={isDesktop}
            onClick={() => {
              if (moduleAllowed) navigate(path)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function QuickActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-sm cursor-pointer rounded-pill bg-elevated text-foreground text-xs font-medium transition-all duration-150 ease-in-out"
      style={{
        padding: '6px 14px',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary-8)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-20)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--primary)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--elevated)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
      }}
    >
      <span className="flex items-center">
        {getRouteIcon(icon, 14, false)}
      </span>
      {label}
    </button>
  )
}

const CARD_IMAGES: Record<string, string> = {
  '/entrada-de-materiais': '/images/home/entrada.svg',
  '/ciclos/desinfeccao': '/images/home/desinfeccao.svg',
  '/ciclos/esterilizacao': '/images/home/esterilizacao.svg',
  '/saida-de-materiais': '/images/home/saida.svg',
  '/conferencia': '/images/home/conferencia.svg'
}

function WorkflowCard({
  route,
  description,
  disabled,
  fillHeight,
  path,
  onClick
}: {
  route: RouteMetadataProps
  description: string
  disabled: boolean
  fillHeight: boolean
  path: string
  onClick: () => void
}) {
  if (fillHeight) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'group flex flex-col rounded-[14px] border overflow-hidden transition-all duration-300 h-full',
          disabled
            ? 'bg-muted opacity-50 cursor-not-allowed border-border'
            : 'bg-card cursor-pointer border-border hover:border-primary-20 hover:shadow-lg hover:-translate-y-[2px] hover:border-primary hover:border-4 hover:shadow-2xl'
        )}
      >
        {/* Image — top half */}
        <div className="relative h-1/2 shrink-0 overflow-hidden bg-gradient-to-br from-primary-8 to-primary-15">
          {CARD_IMAGES[path] ? (
            <img
              src={CARD_IMAGES[path]}
              alt={route.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full" />
          )}
          {/* Bottom fade into card */}
          <div className="absolute inset-x-0 bottom-0 h-[40%]" style={{ background: 'linear-gradient(to top, hsl(var(--card)), transparent)' }} />
        </div>

        {/* Content — bottom half, centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-md px-lg py-lg w-full">
          {/* Large icon */}
          <div
            className="flex items-center justify-center rounded-[16px] transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            style={{
              width: 104,
              height: 104,
              background: disabled ? 'var(--elevated)' : 'var(--primary-10)',
              border: disabled ? 'none' : '1px solid var(--primary-12)'
            }}
          >
            <span style={{ color: disabled ? 'var(--muted-foreground)' : 'var(--primary)' }}>
              {getRouteIcon(route.icon || 'Chart', 48, !disabled)}
            </span>
          </div>

          {/* Name — large and bold */}
          <span className={cn('text-3xl font-bold truncate w-full transition-colors duration-200', disabled ? 'text-muted-foreground' : 'text-foreground group-hover:text-primary')}>
            {route.name}
          </span>

          {/* Description */}
          <span className="text-md leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </span>

          {/* Disabled badge */}
          {disabled && (
            <span className="text-xs font-medium rounded-pill" style={{ padding: '2px 8px', backgroundColor: 'var(--warning-10)', color: 'var(--warning)', fontSize: 10 }}>
              Módulo Completo
            </span>
          )}
        </div>
      </button>
    )
  }

  // Mobile/tablet: compact card (no image)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center text-center rounded-[14px] border border-border transition-all gap-[10px]',
        disabled ? 'bg-muted opacity-50 cursor-not-allowed' : 'bg-card cursor-pointer'
      )}
      style={{ padding: '20px 14px' }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-20)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }
      }}
    >
      <div
        className="flex items-center justify-center rounded-[12px]"
        style={{ width: 48, height: 48, background: disabled ? 'var(--elevated)' : 'var(--primary-10)' }}
      >
        <span style={{ color: disabled ? 'var(--muted-foreground)' : 'var(--primary)' }}>
          {getRouteIcon(route.icon || 'Chart', 24, !disabled)}
        </span>
      </div>
      <span className={cn('text-sm font-semibold truncate w-full', disabled ? 'text-muted-foreground' : 'text-foreground')}>
        {route.name}
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{description}</span>
      {disabled && (
        <span className="text-xs font-medium rounded-pill" style={{ padding: '2px 8px', backgroundColor: 'var(--warning-10)', color: 'var(--warning)', fontSize: 10 }}>
          Módulo Completo
        </span>
      )}
    </button>
  )
}
