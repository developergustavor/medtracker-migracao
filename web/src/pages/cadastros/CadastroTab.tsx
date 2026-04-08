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
  loading?: boolean
  forceEmpty?: boolean
  hiddenColumns?: Set<string>
}

// -- Helpers

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-xs justify-end">
      <div className="relative group">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onEdit() }}
          className="inline-flex items-center justify-center shrink-0 cursor-pointer outline-none rounded-sm bg-transparent border border-border transition-[background-color] duration-150 ease-in-out"
          style={{ width: 28, height: 28 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--elevated)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
        >
          <Edit2 size={16} color="var(--foreground)" variant="Linear" />
        </button>
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-popover text-foreground text-xs rounded-xs"
          style={{ border: '1px solid var(--popover-border)' }}
        >
          Editar
        </span>
      </div>
      <div className="relative group">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="inline-flex items-center justify-center shrink-0 cursor-pointer outline-none rounded-sm bg-transparent border border-destructive transition-[background-color] duration-150 ease-in-out"
          style={{ width: 28, height: 28 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--elevated)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
        >
          <Trash size={16} color="var(--destructive)" variant="Linear" />
        </button>
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-destructive text-xs rounded-xs"
          style={{
            background: 'var(--destructive-10)',
            border: '1px solid var(--destructive)'
          }}
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

function makeActionsColumn<T extends { id: number }>(): ColumnDef<T> {
  return {
    key: 'actions',
    header: '',
    width: 80,
    align: 'right',
    accessorFn: (row: T) => (
      <RowActions
        onEdit={() => console.log('edit', row.id)}
        onDelete={() => console.log('delete', row.id)}
      />
    )
  }
}

const materialColumns: ColumnDef<MockMaterial>[] = [
  { key: 'code', header: 'Código', sortable: true, filterable: true, width: 100, accessorFn: row => row.code ?? '-' },
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 140 },
  { key: 'amount', header: 'Qtd', sortable: true, width: 70, align: 'center' },
  { key: 'consigned', header: 'Consignado', width: 100, align: 'center', accessorFn: row => row.consigned ? 'Sim' : 'Não' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockMaterial>()
]

const collaboratorColumns: ColumnDef<MockCollaborator>[] = [
  { key: 'code', header: 'Código', sortable: true, filterable: true, width: 90, accessorFn: row => row.code ?? '-' },
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'cpf', header: 'CPF', width: 140 },
  { key: 'email', header: 'E-mail', sortable: true, filterable: true },
  { key: 'role', header: 'Função', sortable: true, filterable: true, width: 160 },
  { key: 'status', header: 'Status', width: 110, accessorFn: row => <StatusBadge status={row.status} variant={row.status === 'ILIMITADO' ? 'success' : row.status === 'BLOQUEADO' ? 'danger' : 'warning'} /> },
  makeActionsColumn<MockCollaborator>()
]

const equipmentColumns: ColumnDef<MockEquipment>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 200 },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockEquipment>()
]

const packageColumns: ColumnDef<MockPackage>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'validityDays', header: 'Validade (dias)', sortable: true, width: 130, align: 'center' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockPackage>()
]

const cycleTypeColumns: ColumnDef<MockCycleType>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'category', header: 'Categoria', sortable: true, filterable: true, width: 160, accessorFn: row => row.category === 'ESTERILIZACAO' ? 'Esterilização' : 'Desinfecção' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockCycleType>()
]

const occurrenceTypeColumns: ColumnDef<MockOccurrenceType>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 130 },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockOccurrenceType>()
]

const indicatorColumns: ColumnDef<MockIndicator>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'price', header: 'Preço', sortable: true, width: 110, align: 'right', accessorFn: row => formatCurrency(row.price) },
  { key: 'invalidatesCycle', header: 'Invalida Ciclo', width: 120, align: 'center', accessorFn: row => row.invalidatesCycle ? 'Sim' : 'Não' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockIndicator>()
]

const supplyColumns: ColumnDef<MockSupply>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'price', header: 'Preço', sortable: true, width: 110, align: 'right', accessorFn: row => formatCurrency(row.price) },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockSupply>()
]

const ownerColumns: ColumnDef<MockOwner>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 120, accessorFn: row => row.type === 'MEDICO' ? 'Médico' : 'Empresa' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockOwner>()
]

const departmentColumns: ColumnDef<MockDepartment>[] = [
  { key: 'code', header: 'Código', sortable: true, filterable: true, width: 100, accessorFn: row => row.code ?? '-' },
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockDepartment>()
]

const doctorColumns: ColumnDef<MockDoctor>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockDoctor>()
]

const patientColumns: ColumnDef<MockPatient>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockPatient>()
]

const checklistColumns: ColumnDef<MockChecklist>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'itemsCount', header: 'Itens', sortable: true, width: 80, align: 'center' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockChecklist>()
]

const templateColumns: ColumnDef<MockTemplate>[] = [
  { key: 'name', header: 'Nome', sortable: true, filterable: true },
  { key: 'type', header: 'Tipo', sortable: true, filterable: true, width: 140, accessorFn: row => row.type === 'COM_INDICADOR' ? 'Com Indicador' : 'Sem Indicador' },
  { key: 'category', header: 'Categoria', sortable: true, filterable: true, width: 140, accessorFn: row => {
    const map: Record<string, string> = { ENTRADA: 'Entrada', DESINFECCAO: 'Desinfecção', ESTERILIZACAO: 'Esterilização', SAIDA: 'Saída' }
    return map[row.category] ?? row.category
  }},
  { key: 'isDefault', header: 'Padrão', width: 90, align: 'center', accessorFn: row => row.isDefault ? 'Sim' : 'Não' },
  { key: 'status', header: 'Status', width: 100, accessorFn: row => <StatusBadge status={row.status} variant={statusVariant(row.status)} /> },
  makeActionsColumn<MockTemplate>()
]

// -- Tab key -> config mapping

type TabConfig = {
  columns: ColumnDef<Record<string, unknown>>[]
  data: Record<string, unknown>[]
  searchPlaceholder: string
  entityLabel: string
  icon: string
}

function getTabConfig(tabKey: string, tabName: string): TabConfig {
  const configMap: Record<string, { columns: ColumnDef<never>[]; data: never[]; searchPlaceholder: string; entityLabel: string; icon: string }> = {
    materiais: { columns: materialColumns as ColumnDef<never>[], data: mockMaterials as never[], searchPlaceholder: 'Buscar material...', entityLabel: 'Material', icon: 'Scissor' },
    colaboradores: { columns: collaboratorColumns as ColumnDef<never>[], data: mockCollaborators as never[], searchPlaceholder: 'Buscar colaborador...', entityLabel: 'Colaborador', icon: 'People' },
    equipamentos: { columns: equipmentColumns as ColumnDef<never>[], data: mockEquipments as never[], searchPlaceholder: 'Buscar equipamento...', entityLabel: 'Equipamento', icon: 'Cpu' },
    embalagens: { columns: packageColumns as ColumnDef<never>[], data: mockPackages as never[], searchPlaceholder: 'Buscar embalagem...', entityLabel: 'Embalagem', icon: 'Box1' },
    'tipos-de-ciclo': { columns: cycleTypeColumns as ColumnDef<never>[], data: mockCycleTypes as never[], searchPlaceholder: 'Buscar tipo de ciclo...', entityLabel: 'Tipo de Ciclo', icon: 'Refresh2' },
    'tipos-de-ocorrencia': { columns: occurrenceTypeColumns as ColumnDef<never>[], data: mockOccurrenceTypes as never[], searchPlaceholder: 'Buscar tipo de ocorrência...', entityLabel: 'Tipo de Ocorrência', icon: 'Danger' },
    indicadores: { columns: indicatorColumns as ColumnDef<never>[], data: mockIndicators as never[], searchPlaceholder: 'Buscar indicador...', entityLabel: 'Indicador', icon: 'Chart' },
    insumos: { columns: supplyColumns as ColumnDef<never>[], data: mockSupplies as never[], searchPlaceholder: 'Buscar insumo...', entityLabel: 'Insumo', icon: 'Health' },
    terceiros: { columns: ownerColumns as ColumnDef<never>[], data: mockOwners as never[], searchPlaceholder: 'Buscar terceiro...', entityLabel: 'Terceiro', icon: 'ProfileCircle' },
    setores: { columns: departmentColumns as ColumnDef<never>[], data: mockDepartments as never[], searchPlaceholder: 'Buscar setor...', entityLabel: 'Setor', icon: 'Building4' },
    medicos: { columns: doctorColumns as ColumnDef<never>[], data: mockDoctors as never[], searchPlaceholder: 'Buscar médico...', entityLabel: 'Médico', icon: 'Health' },
    pacientes: { columns: patientColumns as ColumnDef<never>[], data: mockPatients as never[], searchPlaceholder: 'Buscar paciente...', entityLabel: 'Paciente', icon: 'Profile2User' },
    checklists: { columns: checklistColumns as ColumnDef<never>[], data: mockChecklists as never[], searchPlaceholder: 'Buscar checklist...', entityLabel: 'Checklist', icon: 'TickSquare' },
    modelos: { columns: templateColumns as ColumnDef<never>[], data: mockTemplates as never[], searchPlaceholder: 'Buscar modelo...', entityLabel: 'Modelo', icon: 'DocumentText' }
  }

  const config = configMap[tabKey]
  if (!config) {
    return { columns: [], data: [], searchPlaceholder: 'Buscar...', entityLabel: tabName, icon: 'DocumentText' }
  }

  return config as unknown as TabConfig
}

// -- Component

function CadastroTab({ tabKey, tabName, externalSearch, hideHeader, fullHeight, loading, forceEmpty, hiddenColumns }: CadastroTabProps) {
  const config = useMemo(() => getTabConfig(tabKey, tabName), [tabKey, tabName])
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
    if (forceEmpty) return []
    if (!search.trim()) return config.data
    const term = search.toLowerCase()
    return config.data.filter(row => {
      return Object.values(row).some(val => {
        if (typeof val === 'string') return val.toLowerCase().includes(term)
        if (typeof val === 'number') return String(val).includes(term)
        return false
      })
    })
  }, [config.data, search, forceEmpty])

  // Empty icon from tab config
  const emptyIcon = useMemo(() => {
    const icon = getRouteIcon(config.icon || 'DocumentText', 40, false)
    if (!icon) return undefined
    return <span style={{ color: 'var(--fg-dim)' }}>{icon}</span>
  }, [config.icon])

  if (hideHeader) {
    return (
      <div className={fullHeight ? 'flex flex-col h-full overflow-hidden' : ''}>
        <DataTable
          columns={visibleColumns}
          data={filteredData}
          keyExtractor={(row) => (row as { id: number }).id}
          pagination
          autoFitRows
          loading={loading}
          emptyMessage={`Nenhum registro de ${tabName.toLowerCase()} encontrado.`}
          emptyIcon={emptyIcon}
        />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col w-full overflow-hidden bg-card rounded-[12px] border border-border"
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between gap-3 flex-wrap border-b border-border"
        style={{ padding: '12px 16px' }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--fg)' }}
        >
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
            className="inline-flex items-center gap-1.5 shrink-0 cursor-pointer border-none outline-none rounded-sm bg-primary text-primary-foreground text-caption font-semibold transition-opacity duration-150 ease-in-out"
            style={{ height: 36, padding: '0 14px' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            <Add size={16} color="currentColor" />
            Novo
          </button>
        </div>
      </div>

      {/* DataTable without its own search (we handle it externally) */}
      <DataTable
        columns={visibleColumns}
        data={filteredData}
        keyExtractor={(row) => (row as { id: number }).id}
        pagination
        autoFitRows
        loading={loading}
        emptyMessage={`Nenhum registro de ${tabName.toLowerCase()} encontrado.`}
        emptyIcon={emptyIcon}
      />
    </div>
  )
}

/** Get column definitions for a given tab key (for column filter sidebar) */
function getTabColumns(tabKey: string): { key: string; header: string }[] {
  const config = getTabConfig(tabKey, tabKey)
  return config.columns.map(col => ({ key: col.key, header: col.header })).filter(c => c.key !== 'actions')
}

export { CadastroTab, getTabColumns }
export type { CadastroTabProps }
