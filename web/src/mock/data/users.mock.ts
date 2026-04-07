// entities
import { user_role, user_status } from '@/entities'

// types
import type { UserProps } from '@/entities'

export const mockUsers: UserProps[] = [
  {
    id: 1,
    name: 'Gustavo',
    email: 'gustavo@medtracker.com.br',
    cpf: '101.261.546-43',
    coren: null,
    code: 'gg',
    role: user_role.ADMINISTRADOR,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: true },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 2,
    name: 'Filipe',
    email: 'filipe@medtracker.com.br',
    cpf: '021.654.726-10',
    coren: null,
    code: 'ff',
    role: user_role.ADMINISTRADOR,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: true },
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 3,
    name: 'Marcos',
    email: 'marcos@medtracker.com',
    cpf: '333.333.333-33',
    coren: null,
    code: 'mm',
    role: user_role.COLABORADOR,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: false },
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 4,
    name: 'Mateus',
    email: 'mateus@gmail.com',
    cpf: '133.584.456-23',
    coren: null,
    code: 'mt',
    role: user_role.REPRESENTANTE,
    status: user_status.ILIMITADO,
    settings: { auth2FA: true, emailChecked: true },
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 5,
    name: 'Teste',
    email: 'teste@teste.com',
    cpf: '323.232.332-32',
    coren: null,
    code: 'tt',
    role: user_role.COLABORADOR_CHEFE,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: false },
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: null
  }
]
