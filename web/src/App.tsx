// packages
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// guards
import { AuthProvider, AuthGuard } from '@/guards'

// components
import { Preloader } from '@/components'
import { AppLayout } from '@/components/layout'

// constants
import { ROUTES } from '@/constants'

// types
import type { RouteMetadataProps } from '@/types'

const _loc = '@/App'

// Page registry: maps route paths to lazy-loaded components
// Pages that have actual implementations use their real component
// Everything else falls back to Placeholder
const LazyCadastros = lazy(() => import('@/pages/cadastros').then(m => ({ default: m.Cadastros })))

const PAGE_MAP: Record<string, ReturnType<typeof lazy>> = {
  '/home': lazy(() => import('@/pages/home').then(m => ({ default: m.Home }))),
  '/cadastros': LazyCadastros,
  '/cadastros/materiais': LazyCadastros,
  '/cadastros/colaboradores': LazyCadastros,
  '/cadastros/equipamentos': LazyCadastros,
  '/cadastros/embalagens': LazyCadastros,
  '/cadastros/tipos-de-ciclo': LazyCadastros,
  '/cadastros/tipos-de-ocorrencia': LazyCadastros,
  '/cadastros/indicadores': LazyCadastros,
  '/cadastros/insumos': LazyCadastros,
  '/cadastros/terceiros': LazyCadastros,
  '/cadastros/setores': LazyCadastros,
  '/cadastros/medicos': LazyCadastros,
  '/cadastros/pacientes': LazyCadastros,
  '/cadastros/checklists': LazyCadastros,
  '/cadastros/modelos': LazyCadastros,
  '/entrada-de-materiais': lazy(() => import('@/pages/entrada').then(m => ({ default: m.Entrada }))),
  // Add more as pages are implemented:
  // '/dashboard': lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard }))),
}

const LazyPlaceholder = lazy(() => import('@/pages/Placeholder').then(m => ({ default: m.Placeholder })))
const LazyLogin = lazy(() => import('@/pages/login').then(m => ({ default: m.Login })))
const LazyNotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })))
const LazyUnauthorized = lazy(() => import('@/pages/Unauthorized').then(m => ({ default: m.Unauthorized })))
const LazyForbidden = lazy(() => import('@/pages/Forbidden').then(m => ({ default: m.Forbidden })))
const LazyServerError = lazy(() => import('@/pages/ServerError').then(m => ({ default: m.ServerError })))

function getPageComponent(path: string) {
  return PAGE_MAP[path] || LazyPlaceholder
}

function renderRoutes(routes: RouteMetadataProps[]) {
  const elements: React.ReactNode[] = []

  for (const route of routes) {
    const PageComponent = getPageComponent(route.path)

    // Parent route
    elements.push(
      <Route key={route.path} path={route.path} element={<PageComponent />} />
    )

    // Child routes (subroutes)
    if (route.children) {
      for (const child of route.children) {
        const ChildComponent = getPageComponent(child.path)
        elements.push(
          <Route key={child.path} path={child.path} element={<ChildComponent />} />
        )
      }
    }
  }

  return elements
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Preloader variant="navigation-public" />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LazyLogin />} />
            <Route path="/401" element={<LazyUnauthorized />} />
            <Route path="/403" element={<LazyForbidden />} />
            <Route path="/500" element={<LazyServerError />} />

            {/* Protected routes with layout — mapped from ROUTES constant */}
            <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
              {renderRoutes(ROUTES)}
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* 404 */}
            <Route path="*" element={<LazyNotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
