// packages
import { setupWorker } from 'msw/browser'

// mock
import { authHandlers } from '@/mock/handlers'

export const worker = setupWorker(...authHandlers)
