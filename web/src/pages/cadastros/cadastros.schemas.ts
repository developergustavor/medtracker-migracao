// packages
import { z } from 'zod'

const _loc = '@/pages/cadastros/cadastros.schemas'

// -- Shared

const statusEnum = z.enum(['ATIVO', 'INATIVO'])

// -- Material

export const materialSchema = z.object({
  code: z.string().max(20, 'Máximo 20 caracteres.').nullable().optional(),
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['INSTRUMENTAL', 'TEXTIL', 'KIT', 'AVULSO', 'QUANTIDADE'], { message: 'Tipo obrigatório.' }),
  amount: z.coerce.number().int().min(1, 'Mínimo 1.'),
  consigned: z.boolean(),
  status: statusEnum
})

export type MaterialFormData = z.infer<typeof materialSchema>

// -- Collaborator

export const collaboratorSchema = z.object({
  code: z.string().max(20, 'Máximo 20 caracteres.').nullable().optional(),
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  cpf: z.string().min(14, 'CPF inválido.').max(14, 'CPF inválido.'),
  email: z.string().email('E-mail inválido.'),
  role: z.string().min(1, 'Função obrigatória.'),
  status: z.enum(['ILIMITADO', 'BLOQUEADO', 'TEMPORARIO'])
})

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>

// -- Equipment

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['AUTOCLAVE', 'TERMODESINFECTADORA', 'LAVADORA_ULTRASSONICA', 'SECADORA_DE_TRAQUEIA', 'OUTROS'], { message: 'Tipo obrigatório.' }),
  status: statusEnum
})

export type EquipmentFormData = z.infer<typeof equipmentSchema>

// -- Package (Embalagem)

export const packageSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  validityDays: z.coerce.number().int().min(1, 'Mínimo 1 dia.'),
  status: statusEnum
})

export type PackageFormData = z.infer<typeof packageSchema>

// -- Cycle Type

export const cycleTypeSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  category: z.enum(['DESINFECCAO', 'ESTERILIZACAO'], { message: 'Categoria obrigatória.' }),
  status: statusEnum
})

export type CycleTypeFormData = z.infer<typeof cycleTypeSchema>

// -- Occurrence Type

export const occurrenceTypeSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['MATERIAIS', 'CICLOS', 'OUTROS'], { message: 'Tipo obrigatório.' }),
  status: statusEnum
})

export type OccurrenceTypeFormData = z.infer<typeof occurrenceTypeSchema>

// -- Indicator

export const indicatorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  price: z.coerce.number().min(0, 'Preço inválido.').nullable().optional(),
  invalidatesCycle: z.boolean(),
  status: statusEnum
})

export type IndicatorFormData = z.infer<typeof indicatorSchema>

// -- Supply (Insumo)

export const supplySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  price: z.coerce.number().min(0, 'Preço inválido.').nullable().optional(),
  status: statusEnum
})

export type SupplyFormData = z.infer<typeof supplySchema>

// -- Owner (Terceiro)

export const ownerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['MEDICO', 'EMPRESA'], { message: 'Tipo obrigatório.' }),
  status: statusEnum
})

export type OwnerFormData = z.infer<typeof ownerSchema>

// -- Department (Setor)

export const departmentSchema = z.object({
  code: z.string().max(20, 'Máximo 20 caracteres.').nullable().optional(),
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  status: statusEnum
})

export type DepartmentFormData = z.infer<typeof departmentSchema>

// -- Doctor (Médico)

export const doctorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  status: statusEnum
})

export type DoctorFormData = z.infer<typeof doctorSchema>

// -- Patient (Paciente)

export const patientSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  status: statusEnum
})

export type PatientFormData = z.infer<typeof patientSchema>

// -- Checklist

export const checklistSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  itemsCount: z.coerce.number().int().min(0, 'Mínimo 0.'),
  status: statusEnum
})

export type ChecklistFormData = z.infer<typeof checklistSchema>

// -- Template (Modelo)

export const templateSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['COM_INDICADOR', 'SEM_INDICADOR'], { message: 'Tipo obrigatório.' }),
  category: z.enum(['ENTRADA', 'DESINFECCAO', 'ESTERILIZACAO', 'SAIDA'], { message: 'Categoria obrigatória.' }),
  isDefault: z.boolean(),
  status: statusEnum
})

export type TemplateFormData = z.infer<typeof templateSchema>
