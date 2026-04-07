// packages
import { http, HttpResponse } from 'msw'

// mock
import { mockUsers, mockCmes } from '@/mock/data'

// configs
import { VITE_API_URL } from '@/configs'

// constants
const MOCK_CPF_PASSWORD = '13ce5dc1'
const MOCK_CME_PASSWORD = 'medtracker'
const MOCK_2FA_CODE = '12345'
const MOCK_TOKEN = 'mock-jwt-token-medtracker-dev'

export const authHandlers = [
  http.post(`${VITE_API_URL}/api/auth`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    const { action } = body

    switch (action) {
      case 'user-by-code': {
        const { code } = body
        const user = mockUsers.find(u => u.code === code)

        if (!user) {
          return HttpResponse.json({
            statusCode: 404,
            statusMessage: 'Usuário não encontrado.',
            body: []
          })
        }

        if (user.settings.auth2FA) {
          return HttpResponse.json({
            statusCode: 206,
            statusMessage: 'Código de confirmação enviado.',
            body: [{ userId: user.id, email: user.email }]
          })
        }

        return HttpResponse.json({
          statusCode: 200,
          statusMessage: 'Login realizado com sucesso.',
          body: [{ ...user, cmes: [mockCmes[0]] }],
          token: MOCK_TOKEN
        })
      }

      case 'user': {
        const { cpf, password } = body
        const user = mockUsers.find(u => u.cpf === cpf)

        if (!user || password !== MOCK_CPF_PASSWORD) {
          return HttpResponse.json({
            statusCode: 401,
            statusMessage: 'Credenciais incorretas.',
            body: []
          })
        }

        if (user.settings.auth2FA) {
          return HttpResponse.json({
            statusCode: 206,
            statusMessage: 'Código de confirmação enviado.',
            body: [{ userId: user.id, email: user.email }]
          })
        }

        return HttpResponse.json({
          statusCode: 200,
          statusMessage: 'Login realizado com sucesso.',
          body: [{ ...user, cmes: [mockCmes[0]] }],
          token: MOCK_TOKEN
        })
      }

      case 'cme': {
        const { username, password } = body
        const cme = mockCmes.find(c => c.username === username)

        if (!cme || password !== MOCK_CME_PASSWORD) {
          return HttpResponse.json({
            statusCode: 401,
            statusMessage: 'Credenciais incorretas.',
            body: []
          })
        }

        return HttpResponse.json({
          statusCode: 200,
          statusMessage: 'Login CME realizado com sucesso.',
          body: [cme],
          token: MOCK_TOKEN
        })
      }

      default:
        return HttpResponse.json({
          statusCode: 400,
          statusMessage: 'Ação inválida.',
          body: []
        })
    }
  }),

  http.post(`${VITE_API_URL}/api/match-confirmation-code`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string | number>
    const { confirmationCode, userId } = body

    if (String(confirmationCode) !== MOCK_2FA_CODE) {
      return HttpResponse.json({
        statusCode: 401,
        statusMessage: 'Código de confirmação inválido.',
        body: []
      })
    }

    const user = mockUsers.find(u => u.id === Number(userId))

    if (!user) {
      return HttpResponse.json({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado.',
        body: []
      })
    }

    return HttpResponse.json({
      statusCode: 200,
      statusMessage: 'Login realizado com sucesso.',
      body: [{ ...user, cmes: [mockCmes[0]] }],
      token: MOCK_TOKEN
    })
  })
]
