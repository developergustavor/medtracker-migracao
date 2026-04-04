// entities
import { user_role, user_status } from '@/entities'

// types
import type { UserProps } from '@/entities'

export const mockUsers: UserProps[] = [
  {
    id: 1,
    name: 'Gustavo',
    email: 'gustavo@medtracker.com',
    cpf: '111.111.111-11',
    coren: 'COREN-001',
    code: 'USR001',
    role: user_role.ADMINISTRADOR,
    status: user_status.ILIMITADO,
    settings: { auth2FA: true, emailChecked: true },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 2,
    name: 'Filipe',
    email: 'filipe@medtracker.com',
    cpf: '222.222.222-22',
    coren: 'COREN-002',
    code: 'USR002',
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
    coren: 'COREN-003',
    code: 'USR003',
    role: user_role.COLABORADOR,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: true },
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 4,
    name: 'Mateus',
    email: 'mateus@medtracker.com',
    cpf: '444.444.444-44',
    coren: null,
    code: 'USR004',
    role: user_role.REPRESENTANTE,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: true },
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: null
  },
  {
    id: 5,
    name: 'Teste',
    email: 'teste@medtracker.com',
    cpf: '555.555.555-55',
    coren: 'COREN-005',
    code: 'USR005',
    role: user_role.COLABORADOR_CHEFE,
    status: user_status.ILIMITADO,
    settings: { auth2FA: false, emailChecked: true },
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: null
  }
]
