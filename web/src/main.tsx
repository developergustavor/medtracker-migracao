// styles
import '@/styles/design-system.css'
import '@/styles/globals.css'

// packages
import { createRoot } from 'react-dom/client'

// components
import { App } from '@/App'

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === 'true') {
    const { worker } = await import('@/mock/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  createRoot(document.getElementById('root')!).render(<App />)
}

bootstrap()
