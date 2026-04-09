// packages
import { useMemo, useState, useCallback } from 'react'
import { Add, Edit2, Trash } from 'iconsax-react'

// components
import { DataTable, StatusBadge } from '@/components'
import { SearchInput } from '@/components/domain/SearchInput'

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

// utils
import { getRouteIcon } from '@/utils/routes.utils'

// types
import type { ColumnDef } from '@/components/domain/DataTable'
import type {
  MockMaterial,
  MockCollaborator,
  MockEquipment,
  MockPackage,
  MockCycleType,
  MockOccurrenceType,
  MockIndicator,
  MockSupply,
  MockOwner,
  MockDepartment,
  MockDoctor,
  MockPatient,
  MockChecklist,
  MockTemplate
} from '@/mock/data'

const _loc = '@/pages/cadastros/CadastroTab'

type CadastroTabProps = {
  tabKey: string
  tabName: string
  externalSearch?: string
  hideHeader?: boolean
  fullHeight?: boolean
  hiddenColumns?: Set<string>
  onEdit?: (row: Record<string, unknown>) => void
  onDelete?: (row: Record<string, unknown>) => void
  onNew?: () => void
}

// -- Helpers

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-xs justify-end">
      <div className="relative group">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="inline-flex items-center justify-center shrink-0 cursor-pointer outline-none rounded-sm bg-transparent border border-border hover-elevated transition-colors duration-150"
          style={{ width: 28, height: 28 }}
        >
          <Edit2 size={16} color="var(--foreground)" variant="Linear" />
        </button>
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-popover text-foreground text-xs rounded-xs border border-popover"
        >
          Editar
        </span>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="inline-flex items-center justify-center shrink-0 cursor-pointer outline-none rounded-sm bg-transparent border border-destructive hover-destructive-subtle transition-colors duration-150"
          style={{ width: 28, height: 28 }}
        >
          <Trash size={16} color="var(--destructive)" variant="Linear" />
        </button>
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-destructive text-xs rounded-xs bg-destructive-10 border border-destructive"
        >
          Excluir
        </span>
      </div>
    </div>
  )
}

// -- Formatters

function formatCurrency(value: number | null): string {
  if (value === null) return '-'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function statusVariant(status: string) {
  return status === 'ATIVO' ? 'success' : 'danger' as const
}

// -- Column definitions per entity

function makeActionsColumn<T extends { id: number }>(onEdit: (row: T) => void, onDelete: (row: T) => void): ColumnDef<T> {
  return {
    key: 'actions',
    header: '',
    width: 80,
    align: 'right',
    accessorFn: (row: T) => (
      <RowActions
        onEdit={() => onEdit(row)}
        onDelete={() => onDelete(row)}
      />
    )
  }
}

function getMaterialColumns(onEdit: (r: MockMaterial) => void, onDelete: (r: MockMaterial) => void): ColumnDef<MockMaterial>[] {
  return [
    { key: 'code', header: 'Código', sortable: true, filterable: true, width: 100, accessorFn: row => row.code ?? '-' },
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 140 },
    { key: 'amount', header: 'Qtd', sortable: true, width: 70, align: 'center' },
    { key: 'consigned', header: 'Consignado', width: 100, align: 'center', accessorFn: row => row.consigned ? 'Sim' : 'Não' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getCollaboratorColumns(onEdit: (r: MockCollaborator) => void, onDelete: (r: MockCollaborator) => void): ColumnDef<MockCollaborator>[] {
  return [
    { key: 'code', header: 'Código', sortable: true, filterable: true, width: 90, accessorFn: row => row.code ?? '-' },
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'cpf', header: 'CPF', width: 140 },
    { key: 'email', header: 'E-mail', sortable: true, filterable: true },
    { key: 'role', header: 'Função', sortable: true, filterable: true, width: 160 },
    { key: 'status', header: 'Status', width: 110, accessorFn: row => <StatusBadge status={row.status} variant={row.status === 'ILIMITADO' ? 'success' : row.status === 'BLOQUEADO' ? 'danger' : 'warning'} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getEquipmentColumns(onEdit: (r: MockEquipment) => void, onDelete: (r: MockEquipment) => void): ColumnDef<MockEquipment>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 200 },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getPackageColumns(onEdit: (r: MockPackage) => void, onDelete: (r: MockPackage) => void): ColumnDef<MockPackage>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'validityDays', header: 'Validade (dias)', sortable: true, width: 130, align: 'center' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getCycleTypeColumns(onEdit: (r: MockCycleType) => void, onDelete: (r: MockCycleType) => void): ColumnDef<MockCycleType>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'category', header: 'Categoria', sortable: true, filterable: true, width: 160, accessorFn: row => row.category === 'ESTERILIZACAO' ? 'Esterilização' : 'Desinfecção' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getOccurrenceTypeColumns(onEdit: (r: MockOccurrenceType) => void, onDelete: (r: MockOccurrenceType) => void): ColumnDef<MockOccurrenceType>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 130 },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getIndicatorColumns(onEdit: (r: MockIndicator) => void, onDelete: (r: MockIndicator) => void): ColumnDef<MockIndicator>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'price', header: 'Preço', sortable: true, width: 110, align: 'right', accessorFn: row => formatCurrency(row.price) },
    { key: 'invalidatesCycle', header: 'Invalida Ciclo', width: 120, align: 'center', accessorFn: row => row.invalidatesCycle ? 'Sim' : 'Não' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getSupplyColumns(onEdit: (r: MockSupply) => void, onDelete: (r: MockSupply) => void): ColumnDef<MockSupply>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'price', header: 'Preço', sortable: true, width: 110, align: 'right', accessorFn: row => formatCurrency(row.price) },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getOwnerColumns(onEdit: (r: MockOwner) => void, onDelete: (r: MockOwner) => void): ColumnDef<MockOwner>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 120, accessorFn: row => row.type === 'MEDICO' ? 'Médico' : 'Empresa' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getDepartmentColumns(onEdit: (r: MockDepartment) => void, onDelete: (r: MockDepartment) => void): ColumnDef<MockDepartment>[] {
  return [
    { key: 'code', header: 'Código', sortable: true, filterable: true, width: 100, accessorFn: row => row.code ?? '-' },
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getDoctorColumns(onEdit: (r: MockDoctor) => void, onDelete: (r: MockDoctor) => void): ColumnDef<MockDoctor>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getPatientColumns(onEdit: (r: MockPatient) => void, onDelete: (r: MockPatient) => void): ColumnDef<MockPatient>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getChecklistColumns(onEdit: (r: MockChecklist) => void, onDelete: (r: MockChecklist) => void): ColumnDef<MockChecklist>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'itemsCount', header: 'Itens', sortable: true, width: 80, align: 'center' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

function getTemplateColumns(onEdit: (r: MockTemplate) => void, onDelete: (r: MockTemplate) => void): ColumnDef<MockTemplate>[] {
  return [
    { key: 'name', header: 'Nome', sortable: true, filterable: true },
    { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 140, accessorFn: row => row.type === 'COM_INDICADOR' ? 'Com Indicador' : 'Sem Indicador' },
    { key: 'category', header: 'Categoria', sortable: true, filterable: true, width: 140, accessorFn: row => {
      const map: Record<string, string> = { ENTRADA: 'Entrada', DESINFECCAO: 'Desinfecção', ESTERILIZACAO: 'Esterilização', SAIDA: 'Saída' }
      return map[row.category] ?? row.category
    }},
    { key: 'isDefault', header: 'Padrão', width: 90, align: 'center', accessorFn: row => row.isDefault ? 'Sim' : 'Não' },
    { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
    makeActionsColumn(onEdit, onDelete)
  ]
}

// -- Tab key -> config mapping

type TabConfig = {
  columns: ColumnDef<Record<string, unknown>>[]
  data: Record<string, unknown>[]
  searchPlaceholder: string
  entityLabel: string
  icon: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCallback = (r: any) => void

function getTabConfig(tabKey: string, tabName: string, onEdit: (r: Record<string, unknown>) => void, onDelete: (r: Record<string, unknown>) => void): TabConfig {
  const e = onEdit as AnyCallback
  const d = onDelete as AnyCallback
  const configMap: Record<string, TabConfig> = {
    materiais: { columns: getMaterialColumns(e, d) as unknown as TabConfig['columns'], data: mockMaterials as unknown as TabConfig['data'], searchPlaceholder: 'Buscar material...', entityLabel: 'Material', icon: 'Scissor' },
    colaboradores: { columns: getCollaboratorColumns(e, d) as unknown as TabConfig['columns'], data: mockCollaborators as unknown as TabConfig['data'], searchPlaceholder: 'Buscar colaborador...', entityLabel: 'Colaborador', icon: 'People' },
    equipamentos: { columns: getEquipmentColumns(e, d) as unknown as TabConfig['columns'], data: mockEquipments as unknown as TabConfig['data'], searchPlaceholder: 'Buscar equipamento...', entityLabel: 'Equipamento', icon: 'Cpu' },
    embalagens: { columns: getPackageColumns(e, d) as unknown as TabConfig['columns'], data: mockPackages as unknown as TabConfig['data'], searchPlaceholder: 'Buscar embalagem...', entityLabel: 'Embalagem', icon: 'Box1' },
    'tipos-de-ciclo': { columns: getCycleTypeColumns(e, d) as unknown as TabConfig['columns'], data: mockCycleTypes as unknown as TabConfig['data'], searchPlaceholder: 'Buscar tipo de ciclo...', entityLabel: 'Tipo de Ciclo', icon: 'Refresh2' },
    'tipos-de-ocorrencia': { columns: getOccurrenceTypeColumns(e, d) as unknown as TabConfig['columns'], data: mockOccurrenceTypes as unknown as TabConfig['data'], searchPlaceholder: 'Buscar tipo de ocorrência...', entityLabel: 'Tipo de Ocorrência', icon: 'Danger' },
    indicadores: { columns: getIndicatorColumns(e, d) as unknown as TabConfig['columns'], data: mockIndicators as unknown as TabConfig['data'], searchPlaceholder: 'Buscar indicador...', entityLabel: 'Indicador', icon: 'Chart' },
    insumos: { columns: getSupplyColumns(e, d) as unknown as TabConfig['columns'], data: mockSupplies as unknown as TabConfig['data'], searchPlaceholder: 'Buscar insumo...', entityLabel: 'Insumo', icon: 'Health' },
    terceiros: { columns: getOwnerColumns(e, d) as unknown as TabConfig['columns'], data: mockOwners as unknown as TabConfig['data'], searchPlaceholder: 'Buscar terceiro...', entityLabel: 'Terceiro', icon: 'ProfileCircle' },
    setores: { columns: getDepartmentColumns(e, d) as unknown as TabConfig['columns'], data: mockDepartments as unknown as TabConfig['data'], searchPlaceholder: 'Buscar setor...', entityLabel: 'Setor', icon: 'Building4' },
    medicos: { columns: getDoctorColumns(e, d) as unknown as TabConfig['columns'], data: mockDoctors as unknown as TabConfig['data'], searchPlaceholder: 'Buscar médico...', entityLabel: 'Médico', icon: 'Health' },
    pacientes: { columns: getPatientColumns(e, d) as unknown as TabConfig['columns'], data: mockPatients as unknown as TabConfig['data'], searchPlaceholder: 'Buscar paciente...', entityLabel: 'Paciente', icon: 'Profile2User' },
    checklists: { columns: getChecklistColumns(e, d) as unknown as TabConfig['columns'], data: mockChecklists as unknown as TabConfig['data'], searchPlaceholder: 'Buscar checklist...', entityLabel: 'Checklist', icon: 'TickSquare' },
    modelos: { columns: getTemplateColumns(e, d) as unknown as TabConfig['columns'], data: mockTemplates as unknown as TabConfig['data'], searchPlaceholder: 'Buscar modelo...', entityLabel: 'Modelo', icon: 'DocumentText' }
  }

  const config = configMap[tabKey]
  if (!config) {
    return { columns: [], data: [], searchPlaceholder: 'Buscar...', entityLabel: tabName, icon: 'DocumentText' }
  }

  return config
}

// -- Component

function CadastroTab({ tabKey, tabName, externalSearch, hideHeader, fullHeight, hiddenColumns, onEdit, onDelete, onNew }: CadastroTabProps) {
  const handleEdit = useCallback((row: Record<string, unknown>) => {
    onEdit?.(row)
  }, [onEdit])

  const handleDelete = useCallback((row: Record<string, unknown>) => {
    onDelete?.(row)
  }, [onDelete])

  const config = useMemo(() => getTabConfig(tabKey, tabName, handleEdit, handleDelete), [tabKey, tabName, handleEdit, handleDelete])
  const [internalSearch, setInternalSearch] = useState('')

  // Filter columns by hiddenColumns
  const visibleColumns = useMemo(() => {
    if (!hiddenColumns || hiddenColumns.size === 0) return config.columns
    return config.columns.filter(col => !hiddenColumns.has(col.key))
  }, [config.columns, hiddenColumns])

  const search = externalSearch !== undefined ? externalSearch : internalSearch

  const handleSearchChange = useCallback((value: string) => {
    setInternalSearch(value)
  }, [])

  // Filter data
  const filteredData = useMemo(() => {
    if (!search.trim()) return config.data
    const term = search.toLowerCase()
    return config.data.filter(row => {
      return Object.values(row).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(term)
        if (typeof val === 'number') return String(val).includes(term)
        return false
      })
    })
  }, [config.data, search])

  // Empty icon from tab config
  const emptyIcon = useMemo(() => {
    const icon = getRouteIcon(config.icon || 'DocumentText', 40, false)
    if (!icon) return undefined
    return <span style={{ color: 'var(--fg-dim)' }}>{icon}</span>
  }, [config.icon])

  const handleEmptyAction = useCallback(() => {
    onNew?.()
  }, [onNew])

  if (hideHeader) {
    return (
      <div className={fullHeight ? 'flex flex-col h-full overflow-hidden' : ''}>
        <DataTable
          columns={visibleColumns}
          data={filteredData}
          keyExtractor={(row) => (row as { id: number }).id}
          pagination
          autoFitRows
          emptyMessage={`Nenhum registro de ${tabName.toLowerCase()} encontrado.`}
          emptyIcon={emptyIcon}
          onEmptyAction={handleEmptyAction}
          emptyActionLabel="Novo Registro"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full overflow-hidden bg-card rounded-[12px] border border-border">
      {/* Card header */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap border-b border-border"
        style={{ padding: '12px 16px' }}
      >
        <span className="text-sm font-semibold text-foreground">
          {tabName}
        </span>

        <div className="flex items-center gap-2">
          <SearchInput
            value={internalSearch}
            onChange={handleSearchChange}
            placeholder={config.searchPlaceholder}
            className="w-full max-w-xs"
          />

          <button
            type="button"
            onClick={onNew}
            className="inline-flex items-center gap-1.5 shrink-0 cursor-pointer border-none outline-none rounded-sm bg-primary text-primary-foreground text-caption font-semibold hover-opacity transition-opacity duration-150"
            style={{ height: 36, padding: '0 14px' }}
          >
            <Add size={16} color="currentColor" />
            Novo
          </button>
        </div>
      </div>

      <DataTable
        columns={visibleColumns}
        data={filteredData}
        keyExtractor={(row) => (row as { id: number }).id}
        pagination
        autoFitRows
        emptyMessage={`Nenhum registro de ${tabName.toLowerCase()} encontrado.`}
        emptyIcon={emptyIcon}
        onEmptyAction={handleEmptyAction}
        emptyActionLabel="Novo Registro"
      />
    </div>
  )
}

/** Get column definitions for a given tab key (for column filter sidebar) */
function getTabColumns(tabKey: string): { key: string; header: string }[] {
  const noop = () => {}
  const config = getTabConfig(tabKey, tabKey, noop, noop)
  return config.columns.map(col => ({ key: col.key, header: col.header })).filter(c => c.key !== 'actions')
}

export { CadastroTab, getTabColumns }
export type { CadastroTabProps }
