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

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'currency' | 'cpf' | 'password' | 'textarea' | 'increment' | 'toggle' | 'file' | 'images'

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
  span?: number
  required?: boolean
  hideOnEdit?: boolean
  disabledOnEdit?: boolean
  rows?: number
  min?: number
  accept?: string
  condition?: (values: Record<string, unknown>) => boolean
  disabledCondition?: (values: Record<string, unknown>) => boolean
  dynamicLabel?: (values: Record<string, unknown>, cmeModule?: string) => string
  dynamicOptions?: (userRole?: string) => SelectOption[]
}

export type FormStep = {
  key: string
  label: string
  fields: FormFieldConfig[]
  visibleModules?: string[]
  disabledCondition?: (values: Record<string, unknown>) => boolean
}

export type EntityFormConfig = {
  schema: ZodSchema
  fields: FormFieldConfig[]
  steps?: FormStep[]
  layout?: 'default' | '3col-material' | 'template-editor'
  defaultValues: Record<string, unknown>
}

// -- Shared option sets

const materialTypeOptions: SelectOption[] = [
  { value: 'KIT', label: 'Kit' },
  { value: 'AVULSO', label: 'Avulso' },
  { value: 'QUANTIDADE', label: 'Quantidade' }
]

const equipmentTypeOptions: SelectOption[] = [
  { value: 'AUTOCLAVE', label: 'Autoclave' },
  { value: 'TERMODESINFECTADORA', label: 'Termodesinfectadora' },
  { value: 'LAVADORA_ULTRASSONICA', label: 'Lavadora Ultrassônica' },
  { value: 'SECADORA_DE_TRAQUEIA', label: 'Secadora de Traqueia' },
  { value: 'OUTROS', label: 'Outros' }
]

const cycleTypeCategoryOptions: SelectOption[] = [
  { value: 'DESINFECCAO', label: 'Desinfecção' },
  { value: 'ESTERILIZACAO', label: 'Esterilização' }
]

const occurrenceTypeOptions: SelectOption[] = [
  { value: 'MATERIAIS', label: 'Materiais' },
  { value: 'CICLOS', label: 'Ciclos' },
  { value: 'OUTROS', label: 'Outros' }
]

const ownerTypeOptions: SelectOption[] = [
  { value: 'MEDICO', label: 'Médico' },
  { value: 'EMPRESA', label: 'Empresa' }
]

// Role options — ADMIN can see all, non-ADMIN can only see COLABORADOR and COLABORADOR_CHEFE
const allCollaboratorRoleOptions: SelectOption[] = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'COLABORADOR_CHEFE', label: 'Colaborador Chefe' },
  { value: 'REPRESENTANTE', label: 'Representante' },
  { value: 'COLABORADOR', label: 'Colaborador' }
]

const nonAdminCollaboratorRoleOptions: SelectOption[] = [
  { value: 'COLABORADOR_CHEFE', label: 'Colaborador Chefe' },
  { value: 'COLABORADOR', label: 'Colaborador' }
]

export function getCollaboratorRoleOptions(userRole?: string): SelectOption[] {
  if (userRole === 'ADMINISTRADOR' || userRole === 'DEV') return allCollaboratorRoleOptions
  return nonAdminCollaboratorRoleOptions
}

const templateTypeOptions: SelectOption[] = [
  { value: 'COM_INDICADOR', label: 'Com Indicador' },
  { value: 'SEM_INDICADOR', label: 'Sem Indicador' },
  { value: 'RELATORIO', label: 'Relatório' },
  { value: 'CHECKLIST', label: 'Checklist' }
]

const templateCategoryOptions: SelectOption[] = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'DESINFECCAO', label: 'Desinfecção' },
  { value: 'ESTERILIZACAO', label: 'Esterilização' },
  { value: 'SAIDA', label: 'Saída' }
]

// -- Form configs per entity

const materialFields: FormFieldConfig[] = [
  { key: 'code', label: 'Código', type: 'text', placeholder: 'Ex: MAT-001', span: 4 },
  { key: 'name', label: 'Material', type: 'text', placeholder: 'Nome do material', span: 8, required: true },
  { key: 'type', label: 'Tipo', type: 'select', options: materialTypeOptions, span: 6, required: true, disabledOnEdit: true },
  { key: 'amount', label: 'Quantidade', type: 'increment', span: 6, required: true, min: 1, dynamicLabel: (v) => v.type === 'KIT' ? 'Qtd. Submateriais' : 'Quantidade' },
  { key: 'packageId', label: 'Embalagem', type: 'select', options: [], span: 6 },
  { key: 'templateId', label: 'Modelo de Etiqueta', type: 'select', options: [], span: 6 },
  { key: 'consigned', label: 'Consignado', type: 'checkbox', span: 6 },
  { key: 'ownerId', label: 'Terceiro', type: 'select', options: [], span: 6, disabledCondition: (v) => v.consigned !== true },
  { key: 'color', label: 'Cor', type: 'text', placeholder: 'Ex: Azul', span: 12 },
  { key: 'details', label: 'Detalhes', type: 'textarea', placeholder: 'Observações sobre o material...', span: 12, rows: 3 },
  { key: 'images', label: 'Imagens', type: 'images', span: 12, accept: 'image/png,image/jpg,image/jpeg' }
]

const materialFormConfig: EntityFormConfig = {
  schema: materialSchema,
  fields: materialFields,
  layout: '3col-material',
  defaultValues: { code: '', name: '', type: 'AVULSO', amount: 1, packageId: '', templateId: '', consigned: false, ownerId: '', color: '', details: '' }
}

const collaboratorFormConfig: EntityFormConfig = {
  schema: collaboratorSchema,
  fields: [
    { key: 'name', label: 'Colaborador', type: 'text', placeholder: 'Nome completo', span: 8, required: true },
    { key: 'coren', label: 'Coren', type: 'text', placeholder: 'Registro COREN', span: 4 },
    { key: 'cpf', label: 'CPF', type: 'cpf', placeholder: '000.000.000-00', span: 6, required: true },
    { key: 'role', label: 'Cargo', type: 'select', options: allCollaboratorRoleOptions, span: 6, required: true, dynamicOptions: getCollaboratorRoleOptions },
    { key: 'code', label: 'Código', type: 'text', placeholder: 'Ex: COL-001', span: 6 },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'email@exemplo.com', span: 6, required: true },
    { key: 'password', label: 'Senha', type: 'password', placeholder: 'Mínimo 8 caracteres', span: 6, required: true, hideOnEdit: true },
    { key: 'confirmPassword', label: 'Confirme a Senha', type: 'password', placeholder: 'Repita a senha', span: 6, required: true, hideOnEdit: true },
    { key: 'auth2FA', label: 'Autenticação 2FA', type: 'checkbox', span: 12 }
  ],
  defaultValues: { name: '', coren: '', cpf: '', role: 'COLABORADOR', code: '', email: '', password: '', confirmPassword: '', auth2FA: false }
}

const equipmentFormConfig: EntityFormConfig = {
  schema: equipmentSchema,
  fields: [
    { key: 'name', label: 'Equipamento', type: 'text', placeholder: 'Nome do equipamento', span: 8, required: true },
    { key: 'type', label: 'Tipo', type: 'select', options: equipmentTypeOptions, span: 4, required: true }
  ],
  defaultValues: { name: '', type: 'AUTOCLAVE' }
}

const packageFormConfig: EntityFormConfig = {
  schema: packageSchema,
  fields: [
    { key: 'name', label: 'Embalagem', type: 'text', placeholder: 'Nome da embalagem', span: 9, required: true },
    { key: 'validityDays', label: 'Validade (dias)', type: 'increment', span: 3, required: true, min: 1 }
  ],
  defaultValues: { name: '', validityDays: 1 }
}

const cycleTypeFormConfig: EntityFormConfig = {
  schema: cycleTypeSchema,
  fields: [
    { key: 'name', label: 'Tipo de Ciclo', type: 'text', placeholder: 'Nome do tipo de ciclo', span: 8, required: true },
    { key: 'category', label: 'Categoria', type: 'select', options: cycleTypeCategoryOptions, span: 4, required: true }
  ],
  defaultValues: { name: '', category: 'DESINFECCAO' }
}

const occurrenceTypeFormConfig: EntityFormConfig = {
  schema: occurrenceTypeSchema,
  fields: [
    { key: 'name', label: 'Nome do tipo de ocorrência', type: 'text', placeholder: 'Nome do tipo', span: 6, required: true },
    { key: 'type', label: 'Tipo', type: 'select', options: occurrenceTypeOptions, span: 6, required: true }
  ],
  defaultValues: { name: '', type: 'MATERIAIS' }
}

const indicatorFormConfig: EntityFormConfig = {
  schema: indicatorSchema,
  fields: [
    { key: 'name', label: 'Indicador', type: 'text', placeholder: 'Nome do indicador', span: 12, required: true },
    { key: 'price', label: 'Preço', type: 'currency', placeholder: '0,00', span: 6, required: true },
    { key: 'invalidateCycle', label: 'Invalidador de Ciclo', type: 'checkbox', span: 6 }
  ],
  defaultValues: { name: '', price: null, invalidateCycle: false }
}

const supplyFormConfig: EntityFormConfig = {
  schema: supplySchema,
  fields: [
    { key: 'name', label: 'Insumo', type: 'text', placeholder: 'Nome do insumo', span: 8, required: true },
    { key: 'price', label: 'Preço', type: 'currency', placeholder: '0,00', span: 4, required: true }
  ],
  defaultValues: { name: '', price: null }
}

const ownerFormConfig: EntityFormConfig = {
  schema: ownerSchema,
  fields: [
    { key: 'name', label: 'Terceiro', type: 'text', placeholder: 'Nome do terceiro', span: 8, required: true },
    { key: 'type', label: 'Tipo', type: 'select', options: ownerTypeOptions, span: 4, required: true }
  ],
  defaultValues: { name: '', type: 'MEDICO' }
}

const departmentFormConfig: EntityFormConfig = {
  schema: departmentSchema,
  fields: [
    { key: 'name', label: 'Setor', type: 'text', placeholder: 'Nome do setor', span: 9, required: true },
    { key: 'external', label: 'Externo', type: 'toggle', span: 3 }
  ],
  defaultValues: { name: '', external: false }
}

const doctorFormConfig: EntityFormConfig = {
  schema: doctorSchema,
  fields: [
    { key: 'name', label: 'Médico', type: 'text', placeholder: 'Nome do médico', span: 12, required: true }
  ],
  defaultValues: { name: '' }
}

const patientFormConfig: EntityFormConfig = {
  schema: patientSchema,
  fields: [
    { key: 'name', label: 'Paciente', type: 'text', placeholder: 'Nome do paciente', span: 12, required: true }
  ],
  defaultValues: { name: '' }
}

const checklistFormConfig: EntityFormConfig = {
  schema: checklistSchema,
  fields: [
    { key: 'file', label: 'Arquivo (PDF)', type: 'file', span: 12, required: true, accept: '.pdf,application/pdf' }
  ],
  defaultValues: { name: '', file: '' }
}

const templateFormConfig: EntityFormConfig = {
  layout: 'template-editor',
  schema: templateSchema,
  fields: [
    { key: 'name', label: 'Modelo', type: 'text', placeholder: 'Nome do modelo', span: 8, required: true },
    { key: 'category', label: 'Categoria', type: 'select', options: templateCategoryOptions, span: 4 },
    { key: 'type', label: 'Tipo de Etiqueta', type: 'select', options: templateTypeOptions, span: 4 },
    { key: 'width', label: 'Largura (cm)', type: 'number', placeholder: '8', span: 4, condition: (v) => v.type === 'SEM_INDICADOR' },
    { key: 'height', label: 'Comprimento (cm)', type: 'number', placeholder: '12', span: 4, condition: (v) => v.type === 'SEM_INDICADOR' },
    { key: 'margin', label: 'Margins (CSS)', type: 'text', placeholder: '0mm 0mm 0mm 0mm', span: 12, condition: (v) => v.type === 'SEM_INDICADOR' },
    { key: 'isDefault', label: 'Modelo padrão', type: 'checkbox', span: 12 },
    { key: 'html', label: 'HTML', type: 'textarea', placeholder: '<div>...</div>', span: 12, rows: 6 },
    { key: 'css', label: 'CSS', type: 'textarea', placeholder: '.label { ... }', span: 12, rows: 4 }
  ],
  defaultValues: { name: '', category: 'ENTRADA', type: 'COM_INDICADOR', width: '', height: '', margin: '', isDefault: false, html: '', css: '' }
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
