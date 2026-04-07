// entities
import { cme_module, cme_status } from '@/entities'

// types
import type { CmeProps } from '@/entities'

export const mockCmes: CmeProps[] = [
  {
    id: 1,
    username: 'medtracker',
    corporateName: 'Medtracker LTDA',
    cnpj: '11.111.111/0001-11',
    city: 'Sao Paulo',
    uf: 'SP',
    email: 'contato@medtracker.com',
    module: cme_module.COMPLETO,
    status: cme_status.ILIMITADO,
    settings: { useAI: true, useQRCode: true, useCodeMaterialTabAsDefault: false, useCodeUserTabAsDefault: false },
    paths: { logo: null },
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'representante',
    corporateName: 'Representante CME',
    cnpj: '22.222.222/0001-22',
    city: 'Rio de Janeiro',
    uf: 'RJ',
    email: 'representante@medtracker.com',
    module: cme_module.COMPLETO,
    status: cme_status.ILIMITADO,
    settings: { useAI: false, useQRCode: true, useCodeMaterialTabAsDefault: false, useCodeUserTabAsDefault: false },
    paths: { logo: null },
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 3,
    username: 'impressao',
    corporateName: 'Impressão CME',
    cnpj: '33.333.333/0001-33',
    city: 'Belo Horizonte',
    uf: 'MG',
    email: 'impressao@medtracker.com',
    module: cme_module.IMPRESSAO,
    status: cme_status.ILIMITADO,
    settings: { useAI: false, useQRCode: false, useCodeMaterialTabAsDefault: false, useCodeUserTabAsDefault: false },
    paths: { logo: null },
    createdAt: '2024-03-01T00:00:00.000Z'
  },
  {
    id: 4,
    username: 'etiquetagem',
    corporateName: 'Etiquetagem CME',
    cnpj: '44.444.444/0001-44',
    city: 'Curitiba',
    uf: 'PR',
    email: 'etiquetagem@medtracker.com',
    module: cme_module.ETIQUETAGEM,
    status: cme_status.ILIMITADO,
    settings: { useAI: false, useQRCode: true, useCodeMaterialTabAsDefault: true, useCodeUserTabAsDefault: true },
    paths: { logo: null },
    createdAt: '2024-04-01T00:00:00.000Z'
  }
]
