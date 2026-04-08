// packages
import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchNormal1, CloseCircle } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'

// pages
import { CadastroTab, getTabColumns } from './CadastroTab'

// constants
import { ROUTES } from '@/constants'

// store
import { useAuthStore } from '@/store'

// utils
import { isRoleIn } from '@/utils'
import { getRouteIcon } from '@/utils/routes.utils'

// libs
import { cn } from '@/libs/shadcn.utils'

// hooks
import { useIsMobile } from '@/hooks'

// mock
import {
  mockMaterials,
  mockCollaborators,
  mockEquipments,
  mockPackages,
  mockCycleTypes,
  mockOccurrenceTypes,
  mockIndicators,
  mockSupplies,
  mockOwners,
  mockDepartments,
  mockDoctors,
  mockPatients,
  mockChecklists,
  mockTemplates
} from '@/mock/data'

// entities
import type { cme_module } from '@/entities'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/pages/cadastros/Cadastros'

const ENTITY_COUNTS: Record<string, number> = {
  materiais: mockMaterials.length,
  colaboradores: mockCollaborators.length,
  equipamentos: mockEquipments.length,
  embalagens: mockPackages.length,
  'tipos-de-ciclo': mockCycleTypes.length,
  'tipos-de-ocorrencia': mockOccurrenceTypes.length,
  indicadores: mockIndicators.length,
  insumos: mockSupplies.length,
  terceiros: mockOwners.length,
  setores: mockDepartments.length,
  medicos: mockDoctors.length,
  pacientes: mockPatients.length,
  checklists: mockChecklists.length,
  modelos: mockTemplates.length
}

function extractTabKey(path: string): string {
  const segments = path.split('/')
  return segments[segments.length - 1] || ''
}

function filterChildrenByAccess(
  children: RouteMetadataProps[],
  userRole: string | undefined,
  cmeModule: string | undefined
): RouteMetadataProps[] {
  return children.filter(child => {
    const roleAllowed = userRole ? isRoleIn(userRole as Parameters<typeof isRoleIn>[0], child.allowedRoles) : false
    const moduleAllowed = cmeModule ? child.allowedModules.includes(cmeModule as cme_module) : false
    return roleAllowed && moduleAllowed
  })
}

function Cadastros() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { user, cme } = useAuthStore()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [noData, setNoData] = useState(false)
  const [showColumnFilter, setShowColumnFilter] = useState(false)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for contextual-action events (from ContextualBar)
  useEffect(() => {
    const handler = (e: Event) => {
      const actionId = (e as CustomEvent).detail as string
      if (actionId === 'filters') setShowColumnFilter(prev => !prev)
    }
    window.addEventListener('contextual-action', handler)
    return () => window.removeEventListener('contextual-action', handler)
  }, [])

  const cadastrosRoute = useMemo(() => ROUTES.find(r => r.path === '/cadastros'), [])

  const visibleTabs = useMemo(() => {
    if (!cadastrosRoute?.children) return []
    return filterChildrenByAccess(cadastrosRoute.children, user?.role, cme?.module)
  }, [cadastrosRoute, user?.role, cme?.module])

  const activeTab = useMemo(() => {
    const currentPath = location.pathname
    const matched = visibleTabs.find(tab => currentPath === tab.path || currentPath.startsWith(tab.path + '/'))
    if (matched) return extractTabKey(matched.path)
    return visibleTabs.length > 0 ? extractTabKey(visibleTabs[0].path) : ''
  }, [location.pathname, visibleTabs])

  const handleTabChange = useCallback((value: string) => {
    const tab = visibleTabs.find(t => extractTabKey(t.path) === value)
    if (tab) navigate(tab.path)
  }, [visibleTabs, navigate])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 300)
  }, [])

  const handleToggleColumn = useCallback((key: string) => {
    setHiddenColumns(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearch('')
    setDebouncedSearch('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const activeTabMeta = visibleTabs.find(t => extractTabKey(t.path) === activeTab)

  if (visibleTabs.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full" style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-body)' }}>
        Nenhuma aba disponível para o seu perfil.
      </div>
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Entity pills */}
        <div className="flex gap-1.5 overflow-x-auto shrink-0 px-md py-sm" style={{ scrollBehavior: 'smooth' }}>
          {visibleTabs.map(tab => {
            const tabKey = extractTabKey(tab.path)
            const isActive = tabKey === activeTab
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => handleTabChange(tabKey)}
                className="flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer border-none outline-none"
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 'var(--text-xs)',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--primary-8)' : 'var(--muted)',
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                  transition: 'all 150ms ease'
                }}
              >
                {tab.icon && getRouteIcon(tab.icon, 14, isActive)}
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Search input */}
        <div className="px-md pb-sm shrink-0">
          <div className="relative flex items-center pt-1">
            <SearchNormal1 size={14} color="var(--fg-muted)" className="absolute left-2.5 pointer-events-none" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Filtrar..."
              className="pl-8 pr-7 !text-[14px]"
              style={{
                height: 32,
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--card)',
                borderColor: 'var(--input-border)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer border-none outline-none bg-transparent"
                style={{ color: 'var(--fg-muted)' }}
              >
                <CloseCircle size={14} color="currentColor" />
              </button>
            )}
          </div>
        </div>

        {/* Table — fills rest */}
        <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
          {activeTabMeta && (
            <CadastroTab tabKey={activeTab} tabName={activeTabMeta.name} externalSearch={debouncedSearch} hideHeader fullHeight loading={isLoading} forceEmpty={noData} hiddenColumns={hiddenColumns} />
          )}
        </div>
      </div>
    )
  }

  // Desktop layout: master-detail, full height
  return (
    <div className="flex h-full overflow-hidden">
      {/* Entity sidebar — bg background, no card */}
      <div
        className="flex flex-col shrink-0 h-full"
        style={{ width: 200, borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}
      >
        {/* Filter input */}
        <div className="shrink-0" style={{ padding: '10px 10px 6px' }}>
          <div className="relative flex items-center">
            <SearchNormal1 size={14} color="var(--fg-muted)" className="absolute left-2.5 pointer-events-none" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Filtrar..."
              className="pl-8 pr-7"
              style={{
                height: 32,
                fontSize: 'var(--text-xs)',
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer border-none outline-none bg-transparent"
                style={{ color: 'var(--fg-muted)' }}
              >
                <CloseCircle size={14} color="currentColor" />
              </button>
            )}
          </div>
        </div>

        {/* Entity list */}
        <div className="flex flex-col flex-1 overflow-y-auto" style={{ padding: '4px 8px 8px' }}>
          {visibleTabs.map(tab => {
            const tabKey = extractTabKey(tab.path)
            const isActive = tabKey === activeTab
            const count = ENTITY_COUNTS[tabKey]
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => handleTabChange(tabKey)}
                className={cn('flex items-center gap-2 w-full text-left cursor-pointer border-none outline-none transition-colors duration-150')}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--primary-8)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--foreground)',
                  borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                {tab.icon && <span className="flex items-center shrink-0">{getRouteIcon(tab.icon, 16, isActive)}</span>}
                <span className="truncate flex-1">{tab.name}</span>
                {count !== undefined && (
                  <span
                    className="shrink-0"
                    style={{
                      backgroundColor: isActive ? 'var(--primary-15)' : 'var(--elevated)',
                      color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                      fontSize: 10,
                      padding: '1px 7px',
                      borderRadius: 9999
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* DEV: Toggle loading & no data */}
        <div className="shrink-0 flex flex-col gap-1" style={{ padding: '6px 8px', borderTop: '1px solid var(--border-separator)' }}>
          <button
            type="button"
            onClick={() => setIsLoading(prev => !prev)}
            className="w-full cursor-pointer border-none outline-none"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              backgroundColor: isLoading ? 'var(--destructive)' : 'var(--elevated)',
              color: isLoading ? 'var(--primary-fg)' : 'var(--muted-foreground)',
              transition: 'all 150ms ease'
            }}
          >
            {isLoading ? 'Stop Loading' : 'Toggle Loading'}
          </button>
          <button
            type="button"
            onClick={() => setNoData(prev => !prev)}
            className="w-full cursor-pointer border-none outline-none"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              backgroundColor: noData ? 'var(--destructive)' : 'var(--elevated)',
              color: noData ? 'var(--primary-fg)' : 'var(--muted-foreground)',
              transition: 'all 150ms ease'
            }}
          >
            {noData ? 'Stop No Data' : 'Toggle No Data'}
          </button>
        </div>
      </div>

      {/* Table card — full height, internal scroll */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--card)' }}>
        {activeTabMeta && (
          <CadastroTab
            tabKey={activeTab}
            tabName={activeTabMeta.name}
            externalSearch={debouncedSearch}
            hideHeader
            fullHeight
            loading={isLoading}
            forceEmpty={noData}
            hiddenColumns={hiddenColumns}
          />
        )}
      </div>

      {/* Column filter sidebar overlay */}
      {showColumnFilter && <ColumnFilterSidebar tabKey={activeTab} hiddenColumns={hiddenColumns} onToggleColumn={handleToggleColumn} onClose={() => setShowColumnFilter(false)} />}
    </div>
  )
}

function ColumnFilterSidebar({ tabKey, hiddenColumns, onToggleColumn, onClose }: {
  tabKey: string
  hiddenColumns: Set<string>
  onToggleColumn: (key: string) => void
  onClose: () => void
}) {
  const columns = useMemo(() => getTabColumns(tabKey), [tabKey])
  const visibleCount = columns.length - hiddenColumns.size

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.15)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 280,
          zIndex: 51,
          backgroundColor: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: 'var(--shadow-popover)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide-in-right 200ms ease-out'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-separator)' }}
        >
          <div className="flex items-center gap-sm">
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--foreground)' }}>Colunas</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '1px 7px',
                borderRadius: 9999,
                backgroundColor: 'var(--primary-15)',
                color: 'var(--primary)'
              }}
            >
              {visibleCount}/{columns.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer border-none outline-none"
            style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', backgroundColor: 'transparent', color: 'var(--foreground)', transition: 'background-color 150ms ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <CloseCircle size={16} color="currentColor" />
          </button>
        </div>

        {/* Column list */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '8px 12px' }}>
          {columns.map(col => {
            const isVisible = !hiddenColumns.has(col.key)
            return (
              <label
                key={col.key}
                className="flex items-center gap-md cursor-pointer"
                style={{ padding: '8px 8px', borderRadius: 'var(--radius-sm)', transition: 'background-color 150ms ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleColumn(col.key)}
                  className="w-4 h-4 cursor-pointer accent-[#2155FC]"
                  style={{ borderRadius: 'var(--radius-xs)' }}
                />
                <span style={{ fontSize: 'var(--text-sm)', color: isVisible ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: isVisible ? 500 : 400 }}>
                  {col.header}
                </span>
              </label>
            )
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex gap-sm" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-separator)' }}>
          <button
            type="button"
            onClick={() => {
              columns.forEach(col => {
                if (hiddenColumns.has(col.key)) onToggleColumn(col.key)
              })
            }}
            className="flex-1 cursor-pointer border-none outline-none"
            style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--elevated)', color: 'var(--foreground)', fontSize: 'var(--text-xs)', fontWeight: 500, transition: 'background-color 150ms ease' }}
          >
            Mostrar todas
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer border-none outline-none"
            style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary)', color: 'var(--primary-fg)', fontSize: 'var(--text-xs)', fontWeight: 500 }}
          >
            Aplicar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}

export { Cadastros }
