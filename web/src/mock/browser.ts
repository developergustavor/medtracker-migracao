// packages
import { setupWorker } from 'msw/browser'

// mock
import { authHandlers, cadastrosHandlers } from '@/mock/handlers'

export const worker = setupWorker(...authHandlers, ...cadastrosHandlers)
