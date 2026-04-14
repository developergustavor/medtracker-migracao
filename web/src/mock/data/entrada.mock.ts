const _loc = '@/mock/data/entrada.mock'

export type MockEntry = {
  id: number
  cmeId: number
  type: 'INTERNA' | 'EXTERNA'
  status: 'PROCESSANDO' | 'VALIDO' | 'INVALIDO'
  departmentId: number | null
  sourceCmeId: number | null
  doctorId: number | null
  patientId: number | null
  ownerId: number | null
  ownerType: string | null
  procedureDatetime: string | null
  createdAt: string
}

export type MockEntryMaterial = {
  id: number
  entryId: number
  materialId: number
  userId: number
  amount: number
  imagesPath: string[]
  recorded: boolean
  createdAt: string
}

export const mockEntries: MockEntry[] = [
  { id: 1, cmeId: 1, type: 'INTERNA', status: 'PROCESSANDO', departmentId: 1, sourceCmeId: null, doctorId: 1, patientId: 2, ownerId: null, ownerType: null, procedureDatetime: '2026-04-14T08:30:00Z', createdAt: '2026-04-14T07:00:00Z' },
  { id: 2, cmeId: 1, type: 'EXTERNA', status: 'VALIDO', departmentId: null, sourceCmeId: 2, doctorId: null, patientId: null, ownerId: 1, ownerType: 'MEDICO', procedureDatetime: null, createdAt: '2026-04-13T14:00:00Z' },
  { id: 3, cmeId: 1, type: 'INTERNA', status: 'VALIDO', departmentId: 3, sourceCmeId: null, doctorId: 3, patientId: 5, ownerId: null, ownerType: null, procedureDatetime: '2026-04-12T10:00:00Z', createdAt: '2026-04-12T09:00:00Z' }
]

export const mockEntryMaterials: MockEntryMaterial[] = [
  { id: 1, entryId: 1, materialId: 2, userId: 1, amount: 1, imagesPath: [], recorded: false, createdAt: '2026-04-14T07:05:00Z' },
  { id: 2, entryId: 1, materialId: 1, userId: 1, amount: 1, imagesPath: [], recorded: true, createdAt: '2026-04-14T07:10:00Z' },
  { id: 3, entryId: 1, materialId: 9, userId: 1, amount: 500, imagesPath: [], recorded: true, createdAt: '2026-04-14T07:15:00Z' },
  { id: 4, entryId: 2, materialId: 6, userId: 2, amount: 1, imagesPath: [], recorded: true, createdAt: '2026-04-13T14:05:00Z' },
  { id: 5, entryId: 3, materialId: 7, userId: 3, amount: 5, imagesPath: [], recorded: true, createdAt: '2026-04-12T09:10:00Z' }
]
