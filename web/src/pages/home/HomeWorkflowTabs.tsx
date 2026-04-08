// packages
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// store
import { useAuthStore } from '@/store'

// hooks
import { useIsMobile } from '@/hooks'

// constants
import { ROUTES } from '@/constants'

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
    <div className="flex flex-col gap-md">
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
      <div className={`grid gap-md ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lgAndUp:grid-cols-5'}`}>
        {workflowCards.map(({ route, path, moduleAllowed }) => (
          <WorkflowCard
            key={path}
            route={route}
            description={WORKFLOW_DESCRIPTIONS[path] || mockWorkflowDescriptions[path]?.description || ''}
            disabled={!moduleAllowed}
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
      className="flex items-center gap-sm cursor-pointer"
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-pill)',
        backgroundColor: 'var(--elevated)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--foreground)',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        transition: 'all 150ms ease'
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
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {getRouteIcon(icon, 14, false)}
      </span>
      {label}
    </button>
  )
}

function WorkflowCard({
  route,
  description,
  disabled,
  onClick
}: {
  route: RouteMetadataProps
  description: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center text-center rounded-[14px] border transition-all"
      style={{
        padding: '20px 14px',
        backgroundColor: disabled ? 'var(--muted)' : 'var(--card)',
        borderColor: disabled ? 'var(--border)' : 'var(--border)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        gap: 10
      }}
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
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-[12px]"
        style={{
          width: 48,
          height: 48,
          background: disabled ? 'var(--elevated)' : 'var(--primary-10)'
        }}
      >
        <span style={{ color: disabled ? 'var(--muted-foreground)' : 'var(--primary)' }}>
          {getRouteIcon(route.icon || 'Chart', 24, !disabled)}
        </span>
      </div>

      {/* Name */}
      <span
        className="text-sm font-semibold truncate w-full"
        style={{ color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)' }}
      >
        {route.name}
      </span>

      {/* Description */}
      <span
        className="text-xs leading-relaxed"
        style={{
          color: 'var(--muted-foreground)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
      >
        {description}
      </span>

      {/* Disabled badge */}
      {disabled && (
        <span
          className="text-xs font-medium"
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--warning-10)',
            color: 'var(--warning)',
            fontSize: 10
          }}
        >
          Módulo Completo
        </span>
      )}
    </button>
  )
}
