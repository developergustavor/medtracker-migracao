// entities
import { user_role, user_status } from '.'

export type UserSettingsProps = {
  auth2FA: boolean
  emailChecked: boolean
}

export type UserProps = {
  id: number
  name: string
  email: string
  cpf: string
  coren: string | null
  code: string | null
  role: user_role
  status: user_status
  settings: UserSettingsProps
  createdAt: string
  updatedAt: string | null
}
