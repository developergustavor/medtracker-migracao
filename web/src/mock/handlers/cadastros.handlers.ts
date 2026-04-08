// packages
import { http, HttpResponse } from 'msw'

// mock
import {
  mockMaterials,
  mockCollaborators,
  mockEquipments,
  mockDepartments,
  mockDoctors,
  mockPatients,
  mockPackages,
  mockCycleTypes,
  mockOccurrenceTypes,
  mockIndicators,
  mockSupplies,
  mockOwners,
  mockChecklists,
  mockTemplates
} from '@/mock/data'

// configs
import { VITE_API_URL } from '@/configs'

const _loc = '@/mock/handlers/cadastros.handlers'

// -- Helpers

type PaginationParams = {
  page?: string
  limit?: string
}

function paginate<T>(data: T[], params: PaginationParams) {
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.max(1, Number(params.limit) || 10)
  const total = data.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const end = start + limit

  return {
    body: data.slice(start, end),
    meta: { page, pages, limit, total }
  }
}

function buildGetHandler<T>(actionName: string, dataset: T[]) {
  return (url: URL) => {
    const action = url.searchParams.get('action')
    if (action !== actionName) return null

    const page = url.searchParams.get('page') || '1'
    const limit = url.searchParams.get('limit') || '10'
    const result = paginate(dataset, { page, limit })

    return HttpResponse.json({
      statusCode: 200,
      statusMessage: 'Registros carregados com sucesso.',
      ...result
    })
  }
}

// -- Action → dataset mapping

const getActions: Record<string, (url: URL) => ReturnType<typeof HttpResponse.json> | null> = {
  materials_records_page: (url) => buildGetHandler('materials_records_page', mockMaterials)(url),
  collaborators_records_page: (url) => buildGetHandler('collaborators_records_page', mockCollaborators)(url),
  equipments_records_page: (url) => buildGetHandler('equipments_records_page', mockEquipments)(url),
  packages_records_page: (url) => buildGetHandler('packages_records_page', mockPackages)(url),
  cycle_types_records_page: (url) => buildGetHandler('cycle_types_records_page', mockCycleTypes)(url),
  occurrence_types_records_page: (url) => buildGetHandler('occurrence_types_records_page', mockOccurrenceTypes)(url),
  indicators_records_page: (url) => buildGetHandler('indicators_records_page', mockIndicators)(url),
  supplies_records_page: (url) => buildGetHandler('supplies_records_page', mockSupplies)(url),
  owners_records_page: (url) => buildGetHandler('owners_records_page', mockOwners)(url),
  departments_records_page: (url) => buildGetHandler('departments_records_page', mockDepartments)(url),
  doctors_records_page: (url) => buildGetHandler('doctors_records_page', mockDoctors)(url),
  patients_records_page: (url) => buildGetHandler('patients_records_page', mockPatients)(url),
  checklists_records_page: (url) => buildGetHandler('checklists_records_page', mockChecklists)(url),
  templates_records_page: (url) => buildGetHandler('templates_records_page', mockTemplates)(url)
}

// -- Handlers

export const cadastrosHandlers = [
  // GET — paginated list by action
  http.get(`${VITE_API_URL}/api`, ({ request }) => {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (!action || !getActions[action]) return undefined

    return getActions[action](url)
  }),

  // POST — create / update / delete (stub)
  http.post(`${VITE_API_URL}/api`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const { action } = body

    if (typeof action !== 'string') return undefined

    // Only handle cadastros-related actions
    const cadastrosActions = [
      'material', 'collaborator', 'equipment', 'package',
      'cycle_type', 'occurrence_type', 'indicator', 'supply',
      'owner', 'department', 'doctor', 'patient',
      'checklist', 'template'
    ]

    if (!cadastrosActions.includes(action)) return undefined

    return HttpResponse.json({
      statusCode: 201,
      statusMessage: 'Registro salvo com sucesso.',
      body: [{ id: Date.now() }]
    })
  }),

  // PUT — update (stub)
  http.put(`${VITE_API_URL}/api`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const { action } = body

    if (typeof action !== 'string') return undefined

    const cadastrosActions = [
      'material', 'collaborator', 'equipment', 'package',
      'cycle_type', 'occurrence_type', 'indicator', 'supply',
      'owner', 'department', 'doctor', 'patient',
      'checklist', 'template'
    ]

    if (!cadastrosActions.includes(action)) return undefined

    return HttpResponse.json({
      statusCode: 200,
      statusMessage: 'Registro atualizado com sucesso.',
      body: []
    })
  }),

  // DELETE — delete (stub)
  http.delete(`${VITE_API_URL}/api`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const { action } = body

    if (typeof action !== 'string') return undefined

    const cadastrosActions = [
      'material', 'collaborator', 'equipment', 'package',
      'cycle_type', 'occurrence_type', 'indicator', 'supply',
      'owner', 'department', 'doctor', 'patient',
      'checklist', 'template'
    ]

    if (!cadastrosActions.includes(action)) return undefined

    return HttpResponse.json({
      statusCode: 200,
      statusMessage: 'Registro removido com sucesso.',
      body: []
    })
  })
]
