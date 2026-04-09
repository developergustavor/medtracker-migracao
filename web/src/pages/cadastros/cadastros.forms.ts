// packages
import type { ZodSchema } from 'zod'

// schemas
import {
  materialSchema, collaboratorSchema, equipmentSchema, packageSchema,
  cycleTypeSchema, occurrenceTypeSchema, indicatorSchema, supplySchema,
  ownerSchema, departmentSchema, doctorSchema, patientSchema,
  checklistSchema, templateSchema
} from './cadastros.schemas'

const _loc = '@/pages/cadastros/cadastros.forms'

// -- Field types

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'currency' | 'cpf'

export type SelectOption = {
  value: string
  label: string
}

export type FormFieldConfig = {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: SelectOption[]
  span?: 1 | 2
}

export type EntityFormConfig = {
  schema: ZodSchema
  fields: FormFieldConfig[]
  defaultValues: Record<string, unknown>
}

// -- Status options (shared)

const statusOptions: SelectOption[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'INATIVO', label: 'Inativo' }
]

const collaboratorStatusOptions: SelectOption[] = [
  { value: 'ILIMITADO', label: 'Ilimitado' },
  { value: 'BLOQUEADO', label: 'Bloqueado' },
  { value: 'TEMPORARIO', label: 'Temporário' }
]

// -- Form configs per entity

const materialFormConfig: EntityFormConfig = {
  schema: materialSchema,
  fields: [
    { key: 'code', label: 'Código', type: 'text', placeholder: 'Ex: MAT-001' },
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do material' },
    { key: 'type', label: 'Tipo', type: 'select', options: [
      { value: 'INSTRUMENTAL', label: 'Instrumental' },
      { value: 'TEXTIL', label: 'Têxtil' },
      { value: 'KIT', label: 'Kit' },
      { value: 'AVULSO', label: 'Avulso' },
      { value: 'QUANTIDADE', label: 'Quantidade' }
    ]},
    { key: 'amount', label: 'Quantidade', type: 'number', placeholder: '1' },
    { key: 'consigned', label: 'Material consignado', type: 'checkbox' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { code: '', name: '', type: 'INSTRUMENTAL', amount: 1, consigned: false, status: 'ATIVO' }
}

const collaboratorFormConfig: EntityFormConfig = {
  schema: collaboratorSchema,
  fields: [
    { key: 'code', label: 'Código', type: 'text', placeholder: 'Ex: COL-001' },
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome completo' },
    { key: 'cpf', label: 'CPF', type: 'cpf', placeholder: '000.000.000-00' },
    { key: 'email', label: 'E-mail', type: 'text', placeholder: 'email@exemplo.com' },
    { key: 'role', label: 'Função', type: 'text', placeholder: 'Ex: Enfermeiro' },
    { key: 'status', label: 'Status', type: 'select', options: collaboratorStatusOptions }
  ],
  defaultValues: { code: '', name: '', cpf: '', email: '', role: '', status: 'ILIMITADO' }
}

const equipmentFormConfig: EntityFormConfig = {
  schema: equipmentSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do equipamento', span: 2 },
    { key: 'type', label: 'Tipo', type: 'select', options: [
      { value: 'AUTOCLAVE', label: 'Autoclave' },
      { value: 'TERMODESINFECTADORA', label: 'Termodesinfectadora' },
      { value: 'LAVADORA_ULTRASSONICA', label: 'Lavadora Ultrassônica' },
      { value: 'SECADORA_DE_TRAQUEIA', label: 'Secadora de Traqueia' },
      { value: 'OUTROS', label: 'Outros' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', type: 'AUTOCLAVE', status: 'ATIVO' }
}

const packageFormConfig: EntityFormConfig = {
  schema: packageSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome da embalagem', span: 2 },
    { key: 'validityDays', label: 'Validade (dias)', type: 'number', placeholder: '30' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', validityDays: 30, status: 'ATIVO' }
}

const cycleTypeFormConfig: EntityFormConfig = {
  schema: cycleTypeSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do tipo de ciclo', span: 2 },
    { key: 'category', label: 'Categoria', type: 'select', options: [
      { value: 'DESINFECCAO', label: 'Desinfecção' },
      { value: 'ESTERILIZACAO', label: 'Esterilização' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', category: 'DESINFECCAO', status: 'ATIVO' }
}

const occurrenceTypeFormConfig: EntityFormConfig = {
  schema: occurrenceTypeSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do tipo de ocorrência', span: 2 },
    { key: 'type', label: 'Tipo', type: 'select', options: [
      { value: 'MATERIAIS', label: 'Materiais' },
      { value: 'CICLOS', label: 'Ciclos' },
      { value: 'OUTROS', label: 'Outros' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', type: 'MATERIAIS', status: 'ATIVO' }
}

const indicatorFormConfig: EntityFormConfig = {
  schema: indicatorSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do indicador', span: 2 },
    { key: 'price', label: 'Preço (R$)', type: 'currency', placeholder: '0,00' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions },
    { key: 'invalidatesCycle', label: 'Invalida ciclo', type: 'checkbox' }
  ],
  defaultValues: { name: '', price: null, invalidatesCycle: false, status: 'ATIVO' }
}

const supplyFormConfig: EntityFormConfig = {
  schema: supplySchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do insumo', span: 2 },
    { key: 'price', label: 'Preço (R$)', type: 'currency', placeholder: '0,00' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', price: null, status: 'ATIVO' }
}

const ownerFormConfig: EntityFormConfig = {
  schema: ownerSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do terceiro', span: 2 },
    { key: 'type', label: 'Tipo', type: 'select', options: [
      { value: 'MEDICO', label: 'Médico' },
      { value: 'EMPRESA', label: 'Empresa' }
    ]},
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', type: 'MEDICO', status: 'ATIVO' }
}

const departmentFormConfig: EntityFormConfig = {
  schema: departmentSchema,
  fields: [
    { key: 'code', label: 'Código', type: 'text', placeholder: 'Ex: SET-001' },
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do setor' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { code: '', name: '', status: 'ATIVO' }
}

const doctorFormConfig: EntityFormConfig = {
  schema: doctorSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do médico', span: 2 },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', status: 'ATIVO' }
}

const patientFormConfig: EntityFormConfig = {
  schema: patientSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do paciente', span: 2 },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', status: 'ATIVO' }
}

const checklistFormConfig: EntityFormConfig = {
  schema: checklistSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do checklist', span: 2 },
    { key: 'itemsCount', label: 'Quantidade de itens', type: 'number', placeholder: '0' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', itemsCount: 0, status: 'ATIVO' }
}

const templateFormConfig: EntityFormConfig = {
  schema: templateSchema,
  fields: [
    { key: 'name', label: 'Nome', type: 'text', placeholder: 'Nome do modelo', span: 2 },
    { key: 'type', label: 'Tipo', type: 'select', options: [
      { value: 'COM_INDICADOR', label: 'Com Indicador' },
      { value: 'SEM_INDICADOR', label: 'Sem Indicador' }
    ]},
    { key: 'category', label: 'Categoria', type: 'select', options: [
      { value: 'ENTRADA', label: 'Entrada' },
      { value: 'DESINFECCAO', label: 'Desinfecção' },
      { value: 'ESTERILIZACAO', label: 'Esterilização' },
      { value: 'SAIDA', label: 'Saída' }
    ]},
    { key: 'isDefault', label: 'Modelo padrão', type: 'checkbox' },
    { key: 'status', label: 'Status', type: 'select', options: statusOptions }
  ],
  defaultValues: { name: '', type: 'COM_INDICADOR', category: 'ENTRADA', isDefault: false, status: 'ATIVO' }
}

// -- Config map

export const formConfigMap: Record<string, EntityFormConfig> = {
  materiais: materialFormConfig,
  colaboradores: collaboratorFormConfig,
  equipamentos: equipmentFormConfig,
  embalagens: packageFormConfig,
  'tipos-de-ciclo': cycleTypeFormConfig,
  'tipos-de-ocorrencia': occurrenceTypeFormConfig,
  indicadores: indicatorFormConfig,
  insumos: supplyFormConfig,
  terceiros: ownerFormConfig,
  setores: departmentFormConfig,
  medicos: doctorFormConfig,
  pacientes: patientFormConfig,
  checklists: checklistFormConfig,
  modelos: templateFormConfig
}
