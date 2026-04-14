// packages
import { setupWorker } from 'msw/browser'

// mock
import { authHandlers, cadastrosHandlers, entradaHandlers } from '@/mock/handlers'

export const worker = setupWorker(...authHandlers, ...cadastrosHandlers, ...entradaHandlers)
