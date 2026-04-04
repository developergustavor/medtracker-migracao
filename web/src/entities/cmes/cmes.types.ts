// entities
import { cme_module, cme_status } from '.'

export type CmeSettingsProps = {
  useAI: boolean
  useQRCode: boolean
  useCodeMaterialTabAsDefault: boolean
  useCodeUserTabAsDefault: boolean
}

export type CmeProps = {
  id: number
  username: string
  corporateName: string
  cnpj: string | null
  city: string | null
  uf: string | null
  email: string | null
  module: cme_module
  status: cme_status
  settings: CmeSettingsProps
  paths: { logo: string | null }
  createdAt: string
}
