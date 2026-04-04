// packages
import { z } from 'zod'

export const loginByCodeSchema = z.object({
  code: z.string().min(1, 'Codigo obrigatorio')
})

export const loginByCpfSchema = z.object({
  cpf: z.string().min(14, 'CPF invalido'),
  password: z.string().min(1, 'Senha obrigatoria')
})

export const loginByCmeSchema = z.object({
  username: z.string().min(1, 'Usuario obrigatorio'),
  password: z.string().min(1, 'Senha obrigatoria')
})

export const twoFactorSchema = z.object({
  confirmationCode: z.string().min(5, 'Codigo deve ter 5 digitos').max(5)
})

export type LoginByCodeSchema = z.infer<typeof loginByCodeSchema>
export type LoginByCpfSchema = z.infer<typeof loginByCpfSchema>
export type LoginByCmeSchema = z.infer<typeof loginByCmeSchema>
export type TwoFactorSchema = z.infer<typeof twoFactorSchema>
