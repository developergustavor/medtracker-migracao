// packages
import { http, HttpResponse } from 'msw'

// mock
import { mockEntries, mockEntryMaterials } from '@/mock/data'

// configs
import { VITE_API_URL } from '@/configs'

const _loc = '@/mock/handlers/entrada.handlers'

export const entradaHandlers = [
  http.get(`${VITE_API_URL}/api`, ({ request }) => {
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    if (action === 'entries_records_page') {
      return HttpResponse.json({
        statusCode: 200,
        statusMessage: 'Registros carregados com sucesso.',
        body: mockEntries,
        meta: { page: 1, pages: 1, limit: 10, total: mockEntries.length }
      })
    }

    if (action === 'entry_materials') {
      const entryId = url.searchParams.get('entryId')
      const materials = mockEntryMaterials.filter(m => m.entryId === Number(entryId))
      return HttpResponse.json({
        statusCode: 200,
        statusMessage: 'Materiais da entrada carregados.',
        body: materials
      })
    }

    return undefined
  }),

  http.post(`${VITE_API_URL}/api`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const { action } = body

    if (action === 'material_entry') {
      return HttpResponse.json({
        statusCode: 201,
        statusMessage: 'Material registrado na entrada.',
        body: [{ id: Date.now(), entryId: body.entryId || Date.now() }]
      })
    }

    if (action === 'material_entry_image') {
      return HttpResponse.json({
        statusCode: 201,
        statusMessage: 'Imagem registrada.',
        body: []
      })
    }

    return undefined
  })
]
