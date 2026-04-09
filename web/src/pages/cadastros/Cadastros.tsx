// packages
import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchNormal1, CloseCircle } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components'

// pages
import { CadastroTab, getTabColumns } from './CadastroTab'
import { CadastroForm } from './CadastroForm'
import { formConfigMap } from './cadastros.forms'

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
  const [showColumnFilter, setShowColumnFilter] = useState(false)
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Display mode: table or form
  const [displayType, setDisplayType] = useState<'table' | 'form'>('table')
  const [formEditData, setFormEditData] = useState<Record<string, unknown> | null>(null)

  // Disable contextual bar when form/editor is open
  useEffect(() => {
    const isFormOpen = displayType === 'form'
    window.dispatchEvent(new CustomEvent('contextual-bar-disabled', { detail: isFormOpen }))
    return () => { window.dispatchEvent(new CustomEvent('contextual-bar-disabled', { detail: false })) }
  }, [displayType])

  // Confirm delete dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null)

  const handleNew = useCallback(() => {
    setFormEditData(null)
    setDisplayType('form')
  }, [])

  const handleEdit = useCallback((row: Record<string, unknown>) => {
    setFormEditData(row)
    setDisplayType('form')
  }, [])

  const handleFormCancel = useCallback(() => {
    setDisplayType('table')
    setFormEditData(null)
  }, [])

  const handleFormSubmit = useCallback((data: Record<string, unknown>) => {
    const fullLoc = `${_loc}.handleFormSubmit`
    console.log(`[${fullLoc}] ${formEditData ? 'Edit' : 'Create'}:`, data)
    setDisplayType('table')
    setFormEditData(null)
  }, [formEditData])

  const handleDuplicate = useCallback((row: Record<string, unknown>) => {
    const clone = { ...row }
    delete clone.id
    setFormEditData(null)
    // Small delay so form resets before opening with clone data
    setTimeout(() => {
      setFormEditData(clone)
      setDisplayType('form')
    }, 0)
  }, [])

  const handleDelete = useCallback((row: Record<string, unknown>) => {
    setDeleteTarget(row)
    setConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    const fullLoc = `${_loc}.handleConfirmDelete`
    console.log(`[${fullLoc}] Delete:`, deleteTarget)
    setConfirmOpen(false)
    setDeleteTarget(null)
  }, [deleteTarget])

  // Listen for contextual-action events (from ContextualBar)
  useEffect(() => {
    const handler = (e: Event) => {
      const actionId = (e as CustomEvent).detail as string
      if (actionId === 'filters') setShowColumnFilter(prev => !prev)
      if (actionId === 'new-record') handleNew()
    }
    window.addEventListener('contextual-action', handler)
    return () => window.removeEventListener('contextual-action', handler)
  }, [handleNew])

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
    setDisplayType('table')
    setFormEditData(null)
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
  const showingForm = displayType === 'form'

  if (visibleTabs.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-body" style={{ color: 'var(--fg-muted)' }}>
        Nenhuma aba disponível para o seu perfil.
      </div>
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Entity pills — hidden when form is open */}
        {!showingForm && (
          <div className="flex gap-1.5 overflow-x-auto shrink-0 px-md py-sm" style={{ scrollBehavior: 'smooth' }}>
            {visibleTabs.map(tab => {
              const tabKey = extractTabKey(tab.path)
              const isActive = tabKey === activeTab
              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => handleTabChange(tabKey)}
                  className="flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer border-none outline-none rounded-[20px] text-xs transition-all duration-150 ease-in-out"
                  style={{
                    padding: '6px 12px',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? 'var(--primary-8)' : 'var(--muted)',
                    color: isActive ? 'var(--primary)' : 'var(--muted-foreground)'
                  }}
                >
                  {tab.icon && getRouteIcon(tab.icon, 14, isActive)}
                  {tab.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Search input — hidden when form is open */}
        {!showingForm && (
          <div className="px-md pb-sm shrink-0">
            <div className="relative flex items-center pt-1">
              <SearchNormal1 size={14} color="var(--fg-muted)" className="absolute left-2.5 pointer-events-none" />
              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder="Filtrar..."
                className="pl-8 pr-7 !text-[14px] rounded-sm"
                style={{
                  height: 32,
                  fontSize: 'var(--text-sm)',
                  borderColor: 'var(--input-border)'
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
        )}

        {/* Content area: table or form */}
        <div className="flex-1 overflow-hidden bg-card">
          {showingForm && formConfigMap[activeTab] ? (
            <CadastroForm
              config={formConfigMap[activeTab]}
              entityLabel={activeTabMeta?.name || ''}
              editData={formEditData}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
            activeTabMeta && (
              <CadastroTab tabKey={activeTab} tabName={activeTabMeta.name} externalSearch={debouncedSearch} hideHeader fullHeight hiddenColumns={hiddenColumns} onNew={handleNew} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            )
          )}
        </div>

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => { setConfirmOpen(false); setDeleteTarget(null) }}
          onConfirm={handleConfirmDelete}
          title="Excluir registro"
          description={`Tem certeza que deseja excluir "${(deleteTarget as Record<string, unknown>)?.name || 'este registro'}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="destructive"
        />
      </div>
    )
  }

  // Desktop layout: master-detail, full height
  return (
    <div className="flex h-full overflow-hidden">
      {/* Entity sidebar — disabled when form is open */}
      <div
        className={cn(
          'flex flex-col shrink-0 h-full border-r border-border transition-opacity duration-200',
          showingForm && 'opacity-40 pointer-events-none'
        )}
        style={{ width: 200, backgroundColor: 'var(--bg)' }}
      >
          {/* Filter input */}
          <div className="shrink-0" style={{ padding: '10px 10px 6px' }}>
            <div className="relative flex items-center">
              <SearchNormal1 size={14} color="var(--fg-muted)" className="absolute left-2.5 pointer-events-none" />
              <Input
                value={search}
                onChange={handleSearchChange}
                placeholder="Filtrar..."
                className="pl-8 pr-7 text-xs rounded-sm"
                style={{
                  height: 32,
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)'
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
                  className={cn('flex items-center gap-2 w-full text-left cursor-pointer border-none outline-none transition-colors duration-150 rounded-sm text-sm whitespace-nowrap')}
                  style={{
                    padding: '9px 12px',
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? 'var(--primary-8)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent'
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
      </div>

      {/* Content area: table or form */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-card">
        {showingForm && formConfigMap[activeTab] ? (
          <CadastroForm
            config={formConfigMap[activeTab]}
            entityLabel={activeTabMeta?.name || ''}
            editData={formEditData}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : (
          activeTabMeta && (
            <CadastroTab
              tabKey={activeTab}
              tabName={activeTabMeta.name}
              externalSearch={debouncedSearch}
              hideHeader
              fullHeight
              hiddenColumns={hiddenColumns}
              onNew={handleNew}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          )
        )}
      </div>

      {/* Column filter sidebar overlay */}
      {showColumnFilter && <ColumnFilterSidebar tabKey={activeTab} hiddenColumns={hiddenColumns} onToggleColumn={handleToggleColumn} onClose={() => setShowColumnFilter(false)} />}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null) }}
        onConfirm={handleConfirmDelete}
        title="Excluir registro"
        description={`Tem certeza que deseja excluir "${(deleteTarget as Record<string, unknown>)?.name || 'este registro'}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
      />
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
            <span className="text-sm font-semibold text-foreground">Colunas</span>
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
            className="flex items-center justify-center cursor-pointer border-none outline-none rounded-sm bg-transparent text-foreground transition-[background-color] duration-150 ease-in-out"
            style={{ width: 28, height: 28 }}
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
                className="flex items-center gap-md cursor-pointer rounded-sm transition-[background-color] duration-150 ease-in-out"
                style={{ padding: '8px 8px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--nav-hover-bg)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => onToggleColumn(col.key)}
                  className="w-4 h-4 cursor-pointer accent-[#2155FC] rounded-xs"
                />
                <span className={cn('text-sm', isVisible ? 'text-foreground font-medium' : 'text-muted-foreground font-normal')}>
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
            className="flex-1 cursor-pointer border-none outline-none rounded-sm bg-elevated text-foreground text-xs font-medium transition-[background-color] duration-150 ease-in-out"
            style={{ padding: '8px' }}
          >
            Mostrar todas
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer border-none outline-none rounded-sm bg-primary text-primary-foreground text-xs font-medium"
            style={{ padding: '8px' }}
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
