const _loc = '@/mock/data/cadastros.mock'

// -- Types

export type MockMaterial = {
  id: number
  code: string | null
  name: string
  type: 'KIT' | 'AVULSO' | 'QUANTIDADE'
  amount: number
  submaterialsCount: number | null
  consigned: boolean
  ownerId: number | null
  packageId: number | null
  templateId: number | null
  color: string | null
  details: string | null
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockCollaborator = {
  id: number
  name: string
  cpf: string
  email: string
  role: string
  status: string
  code: string | null
  createdAt: string
}

export type MockEquipment = {
  id: number
  name: string
  type: 'AUTOCLAVE' | 'TERMODESINFECTADORA' | 'LAVADORA_ULTRASSONICA' | 'SECADORA_DE_TRAQUEIA' | 'OUTROS'
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockPackage = {
  id: number
  name: string
  validityDays: number
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockCycleType = {
  id: number
  name: string
  category: 'DESINFECCAO' | 'ESTERILIZACAO'
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockOccurrenceType = {
  id: number
  name: string
  type: 'MATERIAIS' | 'CICLOS' | 'OUTROS'
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockIndicator = {
  id: number
  name: string
  price: number | null
  invalidatesCycle: boolean
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockSupply = {
  id: number
  name: string
  price: number | null
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockOwner = {
  id: number
  name: string
  type: 'MEDICO' | 'EMPRESA'
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockDepartment = {
  id: number
  name: string
  external: boolean
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockDoctor = {
  id: number
  name: string
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockPatient = {
  id: number
  name: string
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockChecklist = {
  id: number
  name: string
  itemsCount: number
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

export type MockTemplate = {
  id: number
  name: string
  type: 'COM_INDICADOR' | 'SEM_INDICADOR'
  category: 'ENTRADA' | 'DESINFECCAO' | 'ESTERILIZACAO' | 'SAIDA'
  isDefault: boolean
  status: 'ATIVO' | 'INATIVO'
  createdAt: string
}

// -- Data

export const mockMaterials: MockMaterial[] = [
  { id: 1, code: 'MAT-001', name: 'PINÇA BACKAUS', type: 'AVULSO', amount: 1, submaterialsCount: null, consigned: false, ownerId: null, packageId: 1, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-12T10:00:00Z' },
  { id: 2, code: 'MAT-002', name: 'CX VASCULAR Nº1', type: 'KIT', amount: 1, submaterialsCount: 14, consigned: false, ownerId: null, packageId: 2, templateId: 1, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-12T10:05:00Z' },
  { id: 3, code: 'MAT-003', name: 'CAPOTE', type: 'QUANTIDADE', amount: 50, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-13T08:00:00Z' },
  { id: 4, code: 'MAT-004', name: 'LAPA', type: 'QUANTIDADE', amount: 30, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-13T08:10:00Z' },
  { id: 5, code: 'MAT-005', name: 'CAMPO SIMPLES', type: 'QUANTIDADE', amount: 100, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: 'Branco', details: null, status: 'ATIVO', createdAt: '2025-08-14T09:00:00Z' },
  { id: 6, code: 'MAT-006', name: 'CX ORTOPÉDICA Nº3', type: 'KIT', amount: 1, submaterialsCount: 22, consigned: true, ownerId: 1, packageId: 3, templateId: 2, color: null, details: 'Material consignado - verificar retorno', status: 'ATIVO', createdAt: '2025-08-14T09:30:00Z' },
  { id: 7, code: 'MAT-007', name: 'TESOURA METZENBAUM', type: 'AVULSO', amount: 5, submaterialsCount: null, consigned: false, ownerId: null, packageId: 1, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-15T07:00:00Z' },
  { id: 8, code: 'MAT-008', name: 'PORTA AGULHA MAYO', type: 'AVULSO', amount: 3, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-15T07:15:00Z' },
  { id: 9, code: null, name: 'COMPRESSA GAZE', type: 'AVULSO', amount: 500, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-16T11:00:00Z' },
  { id: 10, code: 'MAT-010', name: 'CX CESARIANA', type: 'KIT', amount: 1, submaterialsCount: 18, consigned: false, ownerId: null, packageId: 2, templateId: 1, color: null, details: null, status: 'INATIVO', createdAt: '2025-08-16T11:30:00Z' },
  { id: 11, code: 'MAT-011', name: 'AFASTADOR FARABEUF', type: 'AVULSO', amount: 8, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-17T14:00:00Z' },
  { id: 12, code: 'MAT-012', name: 'CABO DE BISTURI Nº4', type: 'AVULSO', amount: 10, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-17T14:20:00Z' },
  { id: 13, code: 'MAT-013', name: 'LENÇOL CIRÚRGICO', type: 'QUANTIDADE', amount: 40, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: 'Branco', details: null, status: 'ATIVO', createdAt: '2025-08-18T08:00:00Z' },
  { id: 14, code: 'MAT-014', name: 'TRAQUEIA RESPIRADOR', type: 'QUANTIDADE', amount: 20, submaterialsCount: null, consigned: false, ownerId: null, packageId: null, templateId: null, color: null, details: null, status: 'ATIVO', createdAt: '2025-08-18T08:30:00Z' }
]

export const mockCollaborators: MockCollaborator[] = [
  { id: 1, name: 'Ana Clara Souza', cpf: '123.456.789-00', email: 'ana.souza@hospital.com', role: 'ADMINISTRADOR', status: 'ILIMITADO', code: 'ADM001', createdAt: '2025-06-01T08:00:00Z' },
  { id: 2, name: 'Carlos Eduardo Lima', cpf: '234.567.890-11', email: 'carlos.lima@hospital.com', role: 'COLABORADOR_CHEFE', status: 'ILIMITADO', code: 'CHF001', createdAt: '2025-06-02T09:00:00Z' },
  { id: 3, name: 'Mariana Ferreira', cpf: '345.678.901-22', email: 'mariana.ferreira@hospital.com', role: 'COLABORADOR', status: 'ILIMITADO', code: 'COL001', createdAt: '2025-06-03T10:00:00Z' },
  { id: 4, name: 'Rafael Oliveira', cpf: '456.789.012-33', email: 'rafael.oliveira@hospital.com', role: 'COLABORADOR', status: 'ILIMITADO', code: 'COL002', createdAt: '2025-06-04T11:00:00Z' },
  { id: 5, name: 'Juliana Mendes', cpf: '567.890.123-44', email: 'juliana.mendes@hospital.com', role: 'COLABORADOR', status: 'LIMITADO', code: 'COL003', createdAt: '2025-06-05T08:30:00Z' },
  { id: 6, name: 'Fernando Santos', cpf: '678.901.234-55', email: 'fernando.santos@hospital.com', role: 'REPRESENTANTE', status: 'ILIMITADO', code: 'REP001', createdAt: '2025-06-06T09:30:00Z' },
  { id: 7, name: 'Patrícia Almeida', cpf: '789.012.345-66', email: 'patricia.almeida@hospital.com', role: 'COLABORADOR', status: 'BLOQUEADO', code: 'COL004', createdAt: '2025-06-07T10:30:00Z' },
  { id: 8, name: 'Lucas Ribeiro', cpf: '890.123.456-77', email: 'lucas.ribeiro@hospital.com', role: 'COLABORADOR', status: 'ILIMITADO', code: 'COL005', createdAt: '2025-06-08T11:30:00Z' },
  { id: 9, name: 'Camila Duarte', cpf: '901.234.567-88', email: 'camila.duarte@hospital.com', role: 'COLABORADOR', status: 'AGUARDANDO', code: null, createdAt: '2025-06-09T07:00:00Z' },
  { id: 10, name: 'Thiago Costa', cpf: '012.345.678-99', email: 'thiago.costa@hospital.com', role: 'COLABORADOR_CHEFE', status: 'ILIMITADO', code: 'CHF002', createdAt: '2025-06-10T08:00:00Z' },
  { id: 11, name: 'Beatriz Nascimento', cpf: '111.222.333-44', email: 'beatriz.nascimento@hospital.com', role: 'COLABORADOR', status: 'ILIMITADO', code: 'COL006', createdAt: '2025-06-11T09:00:00Z' },
  { id: 12, name: 'Diego Martins', cpf: '222.333.444-55', email: 'diego.martins@hospital.com', role: 'COLABORADOR', status: 'EXPIRADO', code: 'COL007', createdAt: '2025-06-12T10:00:00Z' }
]

export const mockEquipments: MockEquipment[] = [
  { id: 1, name: 'CISA 2', type: 'AUTOCLAVE', status: 'ATIVO', createdAt: '2025-07-01T08:00:00Z' },
  { id: 2, name: 'CISA 1', type: 'AUTOCLAVE', status: 'ATIVO', createdAt: '2025-07-01T08:10:00Z' },
  { id: 3, name: 'STERRAD 100NX', type: 'AUTOCLAVE', status: 'ATIVO', createdAt: '2025-07-02T09:00:00Z' },
  { id: 4, name: 'CISA ELEGANCE', type: 'AUTOCLAVE', status: 'ATIVO', createdAt: '2025-07-02T09:30:00Z' },
  { id: 5, name: 'MEDFACE TD-200', type: 'TERMODESINFECTADORA', status: 'ATIVO', createdAt: '2025-07-03T10:00:00Z' },
  { id: 6, name: 'GETINGE 46-4', type: 'TERMODESINFECTADORA', status: 'ATIVO', createdAt: '2025-07-03T10:30:00Z' },
  { id: 7, name: 'ULTRACLEANER UC-50', type: 'LAVADORA_ULTRASSONICA', status: 'ATIVO', createdAt: '2025-07-04T08:00:00Z' },
  { id: 8, name: 'SECATRAQ S100', type: 'SECADORA_DE_TRAQUEIA', status: 'ATIVO', createdAt: '2025-07-04T08:30:00Z' },
  { id: 9, name: 'BAUMER HI VAC PLUS', type: 'AUTOCLAVE', status: 'INATIVO', createdAt: '2025-07-05T09:00:00Z' },
  { id: 10, name: 'SELADORA HAWO', type: 'OUTROS', status: 'ATIVO', createdAt: '2025-07-05T09:30:00Z' },
  { id: 11, name: 'TUTTNAUER 3870EA', type: 'AUTOCLAVE', status: 'ATIVO', createdAt: '2025-07-06T10:00:00Z' }
]

export const mockPackages: MockPackage[] = [
  { id: 1, name: 'Tecido SMS', validityDays: 180, status: 'ATIVO', createdAt: '2025-07-10T08:00:00Z' },
  { id: 2, name: 'Papel Grau Cirúrgico', validityDays: 365, status: 'ATIVO', createdAt: '2025-07-10T08:10:00Z' },
  { id: 3, name: 'Tyvek', validityDays: 730, status: 'ATIVO', createdAt: '2025-07-11T09:00:00Z' },
  { id: 4, name: 'Container Rígido', validityDays: 365, status: 'ATIVO', createdAt: '2025-07-11T09:30:00Z' },
  { id: 5, name: 'Papel Crepado', validityDays: 90, status: 'ATIVO', createdAt: '2025-07-12T10:00:00Z' },
  { id: 6, name: 'Tecido de Algodão', validityDays: 7, status: 'ATIVO', createdAt: '2025-07-12T10:30:00Z' },
  { id: 7, name: 'Filme Polietileno', validityDays: 365, status: 'INATIVO', createdAt: '2025-07-13T08:00:00Z' },
  { id: 8, name: 'Bolsa Nylon', validityDays: 180, status: 'ATIVO', createdAt: '2025-07-13T08:30:00Z' },
  { id: 9, name: 'Manta SMS Dupla', validityDays: 270, status: 'ATIVO', createdAt: '2025-07-14T09:00:00Z' },
  { id: 10, name: 'Embalagem Mista', validityDays: 365, status: 'ATIVO', createdAt: '2025-07-14T09:30:00Z' }
]

export const mockCycleTypes: MockCycleType[] = [
  { id: 1, name: 'Vapor Saturado (121°C)', category: 'ESTERILIZACAO', status: 'ATIVO', createdAt: '2025-07-15T08:00:00Z' },
  { id: 2, name: 'Vapor Saturado (134°C)', category: 'ESTERILIZACAO', status: 'ATIVO', createdAt: '2025-07-15T08:10:00Z' },
  { id: 3, name: 'Peróxido de Hidrogênio', category: 'ESTERILIZACAO', status: 'ATIVO', createdAt: '2025-07-16T09:00:00Z' },
  { id: 4, name: 'Óxido de Etileno', category: 'ESTERILIZACAO', status: 'ATIVO', createdAt: '2025-07-16T09:30:00Z' },
  { id: 5, name: 'Formaldeído', category: 'ESTERILIZACAO', status: 'INATIVO', createdAt: '2025-07-17T10:00:00Z' },
  { id: 6, name: 'Termodesinfecção (93°C)', category: 'DESINFECCAO', status: 'ATIVO', createdAt: '2025-07-17T10:30:00Z' },
  { id: 7, name: 'Termodesinfecção (90°C)', category: 'DESINFECCAO', status: 'ATIVO', createdAt: '2025-07-18T08:00:00Z' },
  { id: 8, name: 'Desinfecção Química', category: 'DESINFECCAO', status: 'ATIVO', createdAt: '2025-07-18T08:30:00Z' },
  { id: 9, name: 'Glutaraldeído', category: 'DESINFECCAO', status: 'ATIVO', createdAt: '2025-07-19T09:00:00Z' },
  { id: 10, name: 'Ácido Peracético', category: 'DESINFECCAO', status: 'ATIVO', createdAt: '2025-07-19T09:30:00Z' },
  { id: 11, name: 'Plasma de Peróxido', category: 'ESTERILIZACAO', status: 'ATIVO', createdAt: '2025-07-20T10:00:00Z' }
]

export const mockOccurrenceTypes: MockOccurrenceType[] = [
  { id: 1, name: 'Material danificado', type: 'MATERIAIS', status: 'ATIVO', createdAt: '2025-07-21T08:00:00Z' },
  { id: 2, name: 'Material com sujidade', type: 'MATERIAIS', status: 'ATIVO', createdAt: '2025-07-21T08:10:00Z' },
  { id: 3, name: 'Falta de material', type: 'MATERIAIS', status: 'ATIVO', createdAt: '2025-07-22T09:00:00Z' },
  { id: 4, name: 'Ciclo abortado', type: 'CICLOS', status: 'ATIVO', createdAt: '2025-07-22T09:30:00Z' },
  { id: 5, name: 'Falha no indicador', type: 'CICLOS', status: 'ATIVO', createdAt: '2025-07-23T10:00:00Z' },
  { id: 6, name: 'Embalagem violada', type: 'MATERIAIS', status: 'ATIVO', createdAt: '2025-07-23T10:30:00Z' },
  { id: 7, name: 'Equipamento com defeito', type: 'CICLOS', status: 'ATIVO', createdAt: '2025-07-24T08:00:00Z' },
  { id: 8, name: 'Validade expirada', type: 'MATERIAIS', status: 'ATIVO', createdAt: '2025-07-24T08:30:00Z' },
  { id: 9, name: 'Queda de energia', type: 'OUTROS', status: 'ATIVO', createdAt: '2025-07-25T09:00:00Z' },
  { id: 10, name: 'Contaminação', type: 'OUTROS', status: 'INATIVO', createdAt: '2025-07-25T09:30:00Z' },
  { id: 11, name: 'Material extraviado', type: 'MATERIAIS', status: 'ATIVO', createdAt: '2025-07-26T10:00:00Z' }
]

export const mockIndicators: MockIndicator[] = [
  { id: 1, name: 'Indicador Biológico (BI)', price: 12.50, invalidatesCycle: true, status: 'ATIVO', createdAt: '2025-07-27T08:00:00Z' },
  { id: 2, name: 'Indicador Químico Classe 1', price: 0.80, invalidatesCycle: false, status: 'ATIVO', createdAt: '2025-07-27T08:10:00Z' },
  { id: 3, name: 'Indicador Químico Classe 4', price: 1.20, invalidatesCycle: false, status: 'ATIVO', createdAt: '2025-07-28T09:00:00Z' },
  { id: 4, name: 'Indicador Químico Classe 5', price: 2.50, invalidatesCycle: true, status: 'ATIVO', createdAt: '2025-07-28T09:30:00Z' },
  { id: 5, name: 'Indicador Químico Classe 6', price: 3.00, invalidatesCycle: true, status: 'ATIVO', createdAt: '2025-07-29T10:00:00Z' },
  { id: 6, name: 'Teste Bowie & Dick', price: 18.00, invalidatesCycle: true, status: 'ATIVO', createdAt: '2025-07-29T10:30:00Z' },
  { id: 7, name: 'Indicador Multiparamétrico', price: 4.50, invalidatesCycle: false, status: 'ATIVO', createdAt: '2025-07-30T08:00:00Z' },
  { id: 8, name: 'Indicador Enzimático', price: 8.00, invalidatesCycle: true, status: 'INATIVO', createdAt: '2025-07-30T08:30:00Z' },
  { id: 9, name: 'Indicador de Peróxido', price: 15.00, invalidatesCycle: true, status: 'ATIVO', createdAt: '2025-07-31T09:00:00Z' },
  { id: 10, name: 'Fita Indicadora Classe 1', price: null, invalidatesCycle: false, status: 'ATIVO', createdAt: '2025-07-31T09:30:00Z' }
]

export const mockSupplies: MockSupply[] = [
  { id: 1, name: 'Detergente Enzimático', price: 45.00, status: 'ATIVO', createdAt: '2025-08-01T08:00:00Z' },
  { id: 2, name: 'Lubrificante para Instrumental', price: 32.00, status: 'ATIVO', createdAt: '2025-08-01T08:10:00Z' },
  { id: 3, name: 'Seladora de Grau Cirúrgico', price: null, status: 'ATIVO', createdAt: '2025-08-02T09:00:00Z' },
  { id: 4, name: 'Escova de Limpeza', price: 5.50, status: 'ATIVO', createdAt: '2025-08-02T09:30:00Z' },
  { id: 5, name: 'Desincrostante', price: 38.00, status: 'ATIVO', createdAt: '2025-08-03T10:00:00Z' },
  { id: 6, name: 'Água Destilada (5L)', price: 12.00, status: 'ATIVO', createdAt: '2025-08-03T10:30:00Z' },
  { id: 7, name: 'Fita Crepe Autoclave', price: 8.50, status: 'ATIVO', createdAt: '2025-08-04T08:00:00Z' },
  { id: 8, name: 'Emulsão de Silicone', price: 28.00, status: 'INATIVO', createdAt: '2025-08-04T08:30:00Z' },
  { id: 9, name: 'Detergente Alcalino', price: 52.00, status: 'ATIVO', createdAt: '2025-08-05T09:00:00Z' },
  { id: 10, name: 'Álcool 70%', price: 6.00, status: 'ATIVO', createdAt: '2025-08-05T09:30:00Z' },
  { id: 11, name: 'Luva de Procedimento (Cx 100)', price: 22.00, status: 'ATIVO', createdAt: '2025-08-06T10:00:00Z' }
]

export const mockOwners: MockOwner[] = [
  { id: 1, name: 'Dr. Marcos Pereira', type: 'MEDICO', status: 'ATIVO', createdAt: '2025-08-07T08:00:00Z' },
  { id: 2, name: 'Instrumentais Brasil Ltda', type: 'EMPRESA', status: 'ATIVO', createdAt: '2025-08-07T08:10:00Z' },
  { id: 3, name: 'Dra. Helena Barros', type: 'MEDICO', status: 'ATIVO', createdAt: '2025-08-08T09:00:00Z' },
  { id: 4, name: 'MedEquip Locações', type: 'EMPRESA', status: 'ATIVO', createdAt: '2025-08-08T09:30:00Z' },
  { id: 5, name: 'Dr. Ricardo Menezes', type: 'MEDICO', status: 'ATIVO', createdAt: '2025-08-09T10:00:00Z' },
  { id: 6, name: 'Cirúrgica Paranaense', type: 'EMPRESA', status: 'INATIVO', createdAt: '2025-08-09T10:30:00Z' },
  { id: 7, name: 'Dr. Felipe Augusto', type: 'MEDICO', status: 'ATIVO', createdAt: '2025-08-10T08:00:00Z' },
  { id: 8, name: 'Ortosíntese S.A.', type: 'EMPRESA', status: 'ATIVO', createdAt: '2025-08-10T08:30:00Z' },
  { id: 9, name: 'Dra. Camila Prado', type: 'MEDICO', status: 'ATIVO', createdAt: '2025-08-11T09:00:00Z' },
  { id: 10, name: 'Johnson & Johnson Medical', type: 'EMPRESA', status: 'ATIVO', createdAt: '2025-08-11T09:30:00Z' }
]

export const mockDepartments: MockDepartment[] = [
  { id: 1, name: 'Centro Cirúrgico', external: false, status: 'ATIVO', createdAt: '2025-07-01T08:00:00Z' },
  { id: 2, name: 'UTI Adulto', external: false, status: 'ATIVO', createdAt: '2025-07-01T08:10:00Z' },
  { id: 3, name: 'UTI Neonatal', external: false, status: 'ATIVO', createdAt: '2025-07-02T09:00:00Z' },
  { id: 4, name: 'Enfermaria', external: false, status: 'ATIVO', createdAt: '2025-07-02T09:30:00Z' },
  { id: 5, name: 'Ambulatório', external: true, status: 'ATIVO', createdAt: '2025-07-03T10:00:00Z' },
  { id: 6, name: 'Pronto Socorro', external: false, status: 'ATIVO', createdAt: '2025-07-03T10:30:00Z' },
  { id: 7, name: 'Hemodinâmica', external: false, status: 'ATIVO', createdAt: '2025-07-04T08:00:00Z' },
  { id: 8, name: 'Endoscopia', external: false, status: 'ATIVO', createdAt: '2025-07-04T08:30:00Z' },
  { id: 9, name: 'Obstetrícia', external: false, status: 'ATIVO', createdAt: '2025-07-05T09:00:00Z' },
  { id: 10, name: 'Odontologia', external: true, status: 'ATIVO', createdAt: '2025-07-05T09:30:00Z' },
  { id: 11, name: 'Sala de Recuperação', external: false, status: 'ATIVO', createdAt: '2025-07-06T10:00:00Z' },
  { id: 12, name: 'Lavanderia', external: true, status: 'INATIVO', createdAt: '2025-07-06T10:30:00Z' }
]

export const mockDoctors: MockDoctor[] = [
  { id: 1, name: 'Dr. Carlos Silva', status: 'ATIVO', createdAt: '2025-06-15T08:00:00Z' },
  { id: 2, name: 'Dra. Ana Santos', status: 'ATIVO', createdAt: '2025-06-15T08:10:00Z' },
  { id: 3, name: 'Dr. Pedro Oliveira', status: 'ATIVO', createdAt: '2025-06-16T09:00:00Z' },
  { id: 4, name: 'Dra. Juliana Costa', status: 'ATIVO', createdAt: '2025-06-16T09:30:00Z' },
  { id: 5, name: 'Dr. Rodrigo Almeida', status: 'ATIVO', createdAt: '2025-06-17T10:00:00Z' },
  { id: 6, name: 'Dra. Fernanda Reis', status: 'ATIVO', createdAt: '2025-06-17T10:30:00Z' },
  { id: 7, name: 'Dr. Gustavo Mendes', status: 'INATIVO', createdAt: '2025-06-18T08:00:00Z' },
  { id: 8, name: 'Dra. Larissa Barros', status: 'ATIVO', createdAt: '2025-06-18T08:30:00Z' },
  { id: 9, name: 'Dr. Henrique Duarte', status: 'ATIVO', createdAt: '2025-06-19T09:00:00Z' },
  { id: 10, name: 'Dra. Isabela Ferreira', status: 'ATIVO', createdAt: '2025-06-19T09:30:00Z' },
  { id: 11, name: 'Dr. Vinícius Prado', status: 'ATIVO', createdAt: '2025-06-20T10:00:00Z' },
  { id: 12, name: 'Dra. Renata Machado', status: 'ATIVO', createdAt: '2025-06-20T10:30:00Z' }
]

export const mockPatients: MockPatient[] = [
  { id: 1, name: 'Maria Fernanda de Souza', status: 'ATIVO', createdAt: '2025-08-01T08:00:00Z' },
  { id: 2, name: 'José Carlos Pereira', status: 'ATIVO', createdAt: '2025-08-01T08:10:00Z' },
  { id: 3, name: 'Ana Beatriz Lima', status: 'ATIVO', createdAt: '2025-08-02T09:00:00Z' },
  { id: 4, name: 'Francisco Antônio da Silva', status: 'ATIVO', createdAt: '2025-08-02T09:30:00Z' },
  { id: 5, name: 'Luísa Helena Martins', status: 'ATIVO', createdAt: '2025-08-03T10:00:00Z' },
  { id: 6, name: 'Roberto Nascimento', status: 'ATIVO', createdAt: '2025-08-03T10:30:00Z' },
  { id: 7, name: 'Gabriela Rodrigues', status: 'INATIVO', createdAt: '2025-08-04T08:00:00Z' },
  { id: 8, name: 'Antônio Marcos Ribeiro', status: 'ATIVO', createdAt: '2025-08-04T08:30:00Z' },
  { id: 9, name: 'Teresa Cristina Alves', status: 'ATIVO', createdAt: '2025-08-05T09:00:00Z' },
  { id: 10, name: 'Paulo Henrique Gomes', status: 'ATIVO', createdAt: '2025-08-05T09:30:00Z' },
  { id: 11, name: 'Cláudia Maria Freitas', status: 'ATIVO', createdAt: '2025-08-06T10:00:00Z' },
  { id: 12, name: 'Manoel Augusto Dias', status: 'ATIVO', createdAt: '2025-08-06T10:30:00Z' },
  { id: 13, name: 'Sandra Regina Campos', status: 'ATIVO', createdAt: '2025-08-07T08:00:00Z' }
]

export const mockChecklists: MockChecklist[] = [
  { id: 1, name: 'Checklist de Recebimento', itemsCount: 8, status: 'ATIVO', createdAt: '2025-07-20T08:00:00Z' },
  { id: 2, name: 'Checklist de Limpeza Manual', itemsCount: 12, status: 'ATIVO', createdAt: '2025-07-20T08:10:00Z' },
  { id: 3, name: 'Checklist de Preparo e Embalagem', itemsCount: 10, status: 'ATIVO', createdAt: '2025-07-21T09:00:00Z' },
  { id: 4, name: 'Checklist de Conferência Visual', itemsCount: 6, status: 'ATIVO', createdAt: '2025-07-21T09:30:00Z' },
  { id: 5, name: 'Checklist de Pré-Esterilização', itemsCount: 9, status: 'ATIVO', createdAt: '2025-07-22T10:00:00Z' },
  { id: 6, name: 'Checklist de Liberação de Carga', itemsCount: 7, status: 'ATIVO', createdAt: '2025-07-22T10:30:00Z' },
  { id: 7, name: 'Checklist de Armazenamento', itemsCount: 5, status: 'ATIVO', createdAt: '2025-07-23T08:00:00Z' },
  { id: 8, name: 'Checklist de Dispensação', itemsCount: 6, status: 'ATIVO', createdAt: '2025-07-23T08:30:00Z' },
  { id: 9, name: 'Checklist de Manutenção', itemsCount: 11, status: 'INATIVO', createdAt: '2025-07-24T09:00:00Z' },
  { id: 10, name: 'Checklist de Termodesinfecção', itemsCount: 8, status: 'ATIVO', createdAt: '2025-07-24T09:30:00Z' }
]

export const mockTemplates: MockTemplate[] = [
  { id: 1, name: 'Entrada Padrão', type: 'SEM_INDICADOR', category: 'ENTRADA', isDefault: true, status: 'ATIVO', createdAt: '2025-07-25T08:00:00Z' },
  { id: 2, name: 'Entrada com Indicador', type: 'COM_INDICADOR', category: 'ENTRADA', isDefault: false, status: 'ATIVO', createdAt: '2025-07-25T08:10:00Z' },
  { id: 3, name: 'Desinfecção Padrão', type: 'SEM_INDICADOR', category: 'DESINFECCAO', isDefault: true, status: 'ATIVO', createdAt: '2025-07-26T09:00:00Z' },
  { id: 4, name: 'Esterilização Vapor', type: 'COM_INDICADOR', category: 'ESTERILIZACAO', isDefault: true, status: 'ATIVO', createdAt: '2025-07-26T09:30:00Z' },
  { id: 5, name: 'Esterilização Peróxido', type: 'COM_INDICADOR', category: 'ESTERILIZACAO', isDefault: false, status: 'ATIVO', createdAt: '2025-07-27T10:00:00Z' },
  { id: 6, name: 'Saída Padrão', type: 'SEM_INDICADOR', category: 'SAIDA', isDefault: true, status: 'ATIVO', createdAt: '2025-07-27T10:30:00Z' },
  { id: 7, name: 'Saída com Conferência', type: 'SEM_INDICADOR', category: 'SAIDA', isDefault: false, status: 'ATIVO', createdAt: '2025-07-28T08:00:00Z' },
  { id: 8, name: 'Esterilização Óxido Etileno', type: 'COM_INDICADOR', category: 'ESTERILIZACAO', isDefault: false, status: 'INATIVO', createdAt: '2025-07-28T08:30:00Z' },
  { id: 9, name: 'Desinfecção Química', type: 'SEM_INDICADOR', category: 'DESINFECCAO', isDefault: false, status: 'ATIVO', createdAt: '2025-07-29T09:00:00Z' },
  { id: 10, name: 'Entrada Urgência', type: 'SEM_INDICADOR', category: 'ENTRADA', isDefault: false, status: 'ATIVO', createdAt: '2025-07-29T09:30:00Z' }
]

// -- Submaterials (for KIT materials: ids 2, 6, 10)

export type MockSubmaterial = {
  id: number
  materialId: number
  code: string
  name: string
  amount: number
  images: string[]
}

export const mockSubmaterials: MockSubmaterial[] = [
  // CX VASCULAR Nº1 (materialId: 2)
  { id: 1, materialId: 2, code: 'SUB-001', name: 'Pinça Kelly Curva 16cm', amount: 1, images: [] },
  { id: 2, materialId: 2, code: 'SUB-002', name: 'Pinça Hemostática Crile', amount: 1, images: [] },
  { id: 3, materialId: 2, code: 'SUB-003', name: 'Tesoura Metzenbaum 18cm', amount: 1, images: [] },
  { id: 4, materialId: 2, code: 'SUB-004', name: 'Porta Agulha Mayo-Hegar', amount: 1, images: [] },
  { id: 5, materialId: 2, code: 'SUB-005', name: 'Afastador Farabeuf', amount: 2, images: [] },
  { id: 6, materialId: 2, code: '', name: 'Campo Cirúrgico Fenestrado', amount: 3, images: [] },
  { id: 7, materialId: 2, code: '', name: 'Cabo de Bisturi Nº4', amount: 1, images: [] },
  // CX ORTOPÉDICA Nº3 (materialId: 6)
  { id: 8, materialId: 6, code: 'ORT-001', name: 'Chave Hexagonal 3.5mm', amount: 1, images: [] },
  { id: 9, materialId: 6, code: 'ORT-002', name: 'Broca Canulada 4.5mm', amount: 2, images: [] },
  { id: 10, materialId: 6, code: 'ORT-003', name: 'Guia de Broca 3.5mm', amount: 1, images: [] },
  { id: 11, materialId: 6, code: 'ORT-004', name: 'Placa DCP 8 furos', amount: 1, images: [] },
  { id: 12, materialId: 6, code: '', name: 'Parafuso Cortical 3.5x26mm', amount: 8, images: [] },
  { id: 13, materialId: 6, code: '', name: 'Parafuso Cortical 3.5x30mm', amount: 6, images: [] },
  // CX CESARIANA (materialId: 10)
  { id: 14, materialId: 10, code: 'CES-001', name: 'Pinça Allis', amount: 2, images: [] },
  { id: 15, materialId: 10, code: 'CES-002', name: 'Afastador Doyen', amount: 1, images: [] },
  { id: 16, materialId: 10, code: 'CES-003', name: 'Tesoura Mayo Curva', amount: 1, images: [] },
  { id: 17, materialId: 10, code: '', name: 'Pinça Kocher Reta', amount: 2, images: [] },
  { id: 18, materialId: 10, code: '', name: 'Porta Agulha Mayo', amount: 1, images: [] }
]

// -- Material images (placeholder SVG data URIs for demo)

const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="none"><rect width="120" height="120" rx="8" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="11" fill="#94a3b8" font-family="sans-serif">Foto</text></svg>')

export const mockMaterialImages: Record<number, string[]> = {
  1: [PLACEHOLDER_IMG],
  2: [PLACEHOLDER_IMG, PLACEHOLDER_IMG],
  6: [PLACEHOLDER_IMG, PLACEHOLDER_IMG, PLACEHOLDER_IMG]
}
