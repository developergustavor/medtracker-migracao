// packages
import { z } from 'zod'

const _loc = '@/pages/cadastros/cadastros.schemas'

// -- Material

export const materialSchema = z.object({
  code: z.string().max(20, 'Máximo 20 caracteres.').optional(),
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['KIT', 'AVULSO', 'QUANTIDADE'], { message: 'Tipo obrigatório.' }),
  amount: z.coerce.number().int().min(1, 'Mínimo 1.'),
  packageId: z.string().optional(),
  templateId: z.string().optional(),
  consigned: z.boolean(),
  ownerId: z.string().optional(),
  color: z.string().max(100, 'Máximo 100 caracteres.').optional(),
  details: z.string().max(1000, 'Máximo 1000 caracteres.').optional()
})

export type MaterialFormData = z.infer<typeof materialSchema>

// -- Collaborator

export const collaboratorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  coren: z.string().max(50, 'Máximo 50 caracteres.').optional(),
  cpf: z.string().min(14, 'CPF inválido.').max(14, 'CPF inválido.'),
  role: z.enum(['ADMINISTRADOR', 'COLABORADOR', 'COLABORADOR_CHEFE', 'REPRESENTANTE'], { message: 'Cargo obrigatório.' }),
  code: z.string().max(20, 'Máximo 20 caracteres.').optional(),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(8, 'Mínimo 8 caracteres.').regex(/\d/, 'Necessário algum número.').regex(/[-!$%^&*()_+|~=`{}[\]:/<>?,.@#]/, 'Necessário caractere especial.').optional(),
  confirmPassword: z.string().optional(),
  auth2FA: z.boolean()
}).refine(data => !data.password || data.password === data.confirmPassword, {
  message: 'As senhas devem ser iguais.',
  path: ['confirmPassword']
})

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>

// -- Equipment

export const equipmentSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['AUTOCLAVE', 'TERMODESINFECTADORA', 'LAVADORA_ULTRASSONICA', 'SECADORA_DE_TRAQUEIA', 'OUTROS'], { message: 'Tipo obrigatório.' })
})

export type EquipmentFormData = z.infer<typeof equipmentSchema>

// -- Package (Embalagem)

export const packageSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  validityDays: z.coerce.number().int().min(1, 'Mínimo 1 dia.')
})

export type PackageFormData = z.infer<typeof packageSchema>

// -- Cycle Type

export const cycleTypeSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  category: z.enum(['DESINFECCAO', 'ESTERILIZACAO'], { message: 'Categoria obrigatória.' })
})

export type CycleTypeFormData = z.infer<typeof cycleTypeSchema>

// -- Occurrence Type

export const occurrenceTypeSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['MATERIAIS', 'CICLOS', 'OUTROS'], { message: 'Tipo obrigatório.' })
})

export type OccurrenceTypeFormData = z.infer<typeof occurrenceTypeSchema>

// -- Indicator

export const indicatorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  price: z.coerce.number().min(0, 'Preço inválido.').nullable().optional(),
  invalidateCycle: z.boolean()
})

export type IndicatorFormData = z.infer<typeof indicatorSchema>

// -- Supply (Insumo)

export const supplySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  price: z.coerce.number().min(0, 'Preço inválido.').nullable().optional()
})

export type SupplyFormData = z.infer<typeof supplySchema>

// -- Owner (Terceiro)

export const ownerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  type: z.enum(['MEDICO', 'EMPRESA'], { message: 'Tipo obrigatório.' })
})

export type OwnerFormData = z.infer<typeof ownerSchema>

// -- Department (Setor)

export const departmentSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  external: z.boolean()
})

export type DepartmentFormData = z.infer<typeof departmentSchema>

// -- Doctor (Médico)

export const doctorSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.')
})

export type DoctorFormData = z.infer<typeof doctorSchema>

// -- Patient (Paciente)

export const patientSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.')
})

export type PatientFormData = z.infer<typeof patientSchema>

// -- Checklist

export const checklistSchema = z.object({
  name: z.string().optional(),
  file: z.string().min(1, 'Arquivo obrigatório.')
})

export type ChecklistFormData = z.infer<typeof checklistSchema>

// -- Template (Modelo)

export const templateSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.').max(255, 'Máximo 255 caracteres.'),
  category: z.enum(['ENTRADA', 'DESINFECCAO', 'ESTERILIZACAO', 'SAIDA']).optional(),
  type: z.enum(['COM_INDICADOR', 'SEM_INDICADOR', 'RELATORIO', 'CHECKLIST']).optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  margin: z.string().optional(),
  isDefault: z.boolean(),
  html: z.string().optional(),
  css: z.string().optional()
})

export type TemplateFormData = z.infer<typeof templateSchema>
