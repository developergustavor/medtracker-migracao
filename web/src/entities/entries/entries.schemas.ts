// packages
import { z } from 'zod'

export const entryFormSchema = z
  .object({
    type: z.enum(['INTERNA', 'EXTERNA']),
    departmentId: z.string().optional(),
    sourceCmeId: z.string().optional(),
    doctorId: z.string().optional(),
    patientId: z.string().optional(),
    procedureDate: z.string().optional(),
    procedureTime: z.string().optional(),
    ownerId: z.string().optional(),
    ownerType: z.string().optional()
  })
  .refine((data) => {
    if (data.type === 'INTERNA') return !!data.departmentId
    return !!data.sourceCmeId
  }, { message: 'Setor ou CME obrigatório', path: ['departmentId'] })
  .refine((data) => {
    const hasDate = !!data.procedureDate
    const hasTime = !!data.procedureTime
    return hasDate === hasTime
  }, { message: 'Data e hora devem ser preenchidos juntos', path: ['procedureDate'] })
