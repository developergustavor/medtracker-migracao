// entities
import { entry_type, entry_status } from '.'

export type EntryFormData = {
  type: entry_type
  departmentId: string
  sourceCmeId: string
  doctorId: string
  patientId: string
  procedureDate: string
  procedureTime: string
  ownerId: string
  ownerType: string
}

export type EntryMaterialProps = {
  id: number
  materialId: number
  materialName: string
  materialCode: string | null
  materialType: 'KIT' | 'AVULSO' | 'QUANTIDADE'
  packageName: string | null
  amount: number
  images: string[]
  recorded: boolean
  recordedBy: string | null
  recordedAt: string | null
  checkedCount: number
  totalCount: number
}

export type EntryProps = {
  id: number
  cmeId: number
  type: entry_type
  status: entry_status
  departmentId: number | null
  sourceCmeId: number | null
  doctorId: number | null
  patientId: number | null
  ownerId: number | null
  ownerType: string | null
  procedureDatetime: string | null
  materials: EntryMaterialProps[]
  createdAt: string
}
