// packages
import { z } from 'zod'

export const loginByCodeSchema = z.object({
  code: z.string().min(1, 'Código obrigatório')
})

export const loginByCpfSchema = z.object({
  cpf: z.string().min(14, 'CPF inválido'),
  password: z.string().min(1, 'Senha obrigatória')
})

export const loginByCmeSchema = z.object({
  username: z.string().min(1, 'Usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória')
})

export const twoFactorSchema = z.object({
  confirmationCode: z.string().min(5, 'Código deve ter 5 dígitos').max(5)
})

export type LoginByCodeSchema = z.infer<typeof loginByCodeSchema>
export type LoginByCpfSchema = z.infer<typeof loginByCpfSchema>
export type LoginByCmeSchema = z.infer<typeof loginByCmeSchema>
export type TwoFactorSchema = z.infer<typeof twoFactorSchema>
