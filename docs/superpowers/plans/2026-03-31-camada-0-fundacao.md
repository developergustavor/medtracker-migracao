# Camada 0 — Fundacao: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Medtracker v2 project foundation — from empty directory to a fully functional shell with design system, auth, layout (sidebar + topbar + mobile tab bar), spotlight search, and login page. Everything needed before building domain screens.

**Architecture:** React SPA with Vite. Tailwind CSS for utility styling with CSS custom properties from igreen-design (adapted with Medtracker blue primary). Zustand for state. React Router DOM for routing. MSW for mock API. All components support light/dark themes from day one.

**Tech Stack:** React 19, Vite 6, TypeScript (strict), Tailwind CSS 4, shadcn/ui, iconsax-react, Zustand, Zod v4, Axios, React Hook Form, React Router DOM, MSW, Playwright, pnpm

---

## File Structure

```
medtracker-migracao/
├── web/
│   ├── public/
│   │   └── icons/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx              # Main sidebar (248px/68px)
│   │   │   │   ├── SubSidebar.tsx           # Sub-sidebar (overlay/push)
│   │   │   │   ├── Topbar.tsx               # Main topbar (glass, breadcrumb, search, CME)
│   │   │   │   ├── ContextualBar.tsx        # Secondary topbar (contextual actions)
│   │   │   │   ├── BottomTabBar.tsx         # Mobile tab bar with Tools
│   │   │   │   ├── ToolsSheet.tsx           # Mobile tools bottom sheet
│   │   │   │   ├── SpotlightSearch.tsx      # Full-screen search dialog
│   │   │   │   ├── AppLayout.tsx            # Root layout orchestrator
│   │   │   │   └── index.ts                 # Barrel export
│   │   │   ├── loaders/
│   │   │   │   ├── Preloader.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── configs/
│   │   │   ├── env.configs.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   │   ├── routes.constants.ts          # Route definitions + metadata
│   │   │   ├── http.constants.ts
│   │   │   └── index.ts
│   │   ├── entities/
│   │   │   ├── users/
│   │   │   │   ├── users.types.ts
│   │   │   │   ├── users.enums.ts
│   │   │   │   ├── users.schemas.ts
│   │   │   │   └── index.ts
│   │   │   ├── cmes/
│   │   │   │   ├── cmes.types.ts
│   │   │   │   ├── cmes.enums.ts
│   │   │   │   └── index.ts
│   │   │   ├── apis/
│   │   │   │   ├── apis.types.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-media-query.tsx
│   │   │   ├── use-sidebar.tsx
│   │   │   ├── use-theme.tsx
│   │   │   └── index.ts
│   │   ├── libs/
│   │   │   ├── requests.libs.ts             # Axios instance + interceptors
│   │   │   └── index.ts
│   │   ├── mock/
│   │   │   ├── data/
│   │   │   │   ├── users.mock.ts
│   │   │   │   ├── cmes.mock.ts
│   │   │   │   └── index.ts
│   │   │   ├── handlers/
│   │   │   │   ├── auth.handlers.ts
│   │   │   │   └── index.ts
│   │   │   ├── browser.ts                   # MSW browser setup
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Unauthorized.tsx
│   │   │   ├── Forbidden.tsx
│   │   │   ├── ServerError.tsx
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── auth.store.ts
│   │   │   ├── ui.store.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── design-system.css            # Tokens from igreen-design (Medtracker adapted)
│   │   │   └── globals.css
│   │   ├── types/
│   │   │   ├── routes.types.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── errors.utils.ts
│   │   │   ├── routes.utils.tsx
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── tests/
│   │   └── e2e/
│   │       ├── login.spec.ts
│   │       └── navigation.spec.ts
│   ├── .prettierrc
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── playwright.config.ts
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
```

---

## Task 1: Project Scaffold (Vite + React + TypeScript)

**Files:**
- Create: `web/package.json`, `web/vite.config.ts`, `web/tsconfig.json`, `web/tsconfig.app.json`, `web/tsconfig.node.json`, `web/index.html`, `web/src/main.tsx`, `web/src/App.tsx`, `web/src/vite-env.d.ts`

- [ ] **Step 1: Initialize project with pnpm**

```bash
cd /home/developergustavor/Documents/Medtracker/medtracker-migracao
pnpm create vite web --template react-ts
cd web
```

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add react-router-dom zustand axios zod @hookform/resolvers react-hook-form framer-motion lucide-react iconsax-react use-mask-input lodash
pnpm add -D @types/node @types/react @types/react-dom @types/lodash @vitejs/plugin-react-swc autoprefixer postcss tailwindcss @tailwindcss/typography typescript @eslint/js eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals typescript-eslint
```

- [ ] **Step 3: Configure vite.config.ts**

```typescript
import path from 'path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

- [ ] **Step 4: Configure tsconfig.json (strict mode)**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "allowJs": true
  }
}
```

- [ ] **Step 5: Configure tsconfig.app.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Write minimal main.tsx (no StrictMode per CLAUDE.md)**

```tsx
import { createRoot } from 'react-dom/client'
import { App } from '@/App'

createRoot(document.getElementById('root')!).render(<App />)
```

- [ ] **Step 7: Write minimal App.tsx**

```tsx
const loc = '@/App'

export function App() {
  return <div>Medtracker v2</div>
}
```

- [ ] **Step 8: Run dev server to verify**

```bash
cd /home/developergustavor/Documents/Medtracker/medtracker-migracao/web
pnpm dev
```

Expected: Dev server starts on port 5173, shows "Medtracker v2"

- [ ] **Step 9: Commit**

```bash
git add web/
git commit -m "feat: scaffold Medtracker v2 with Vite + React + TypeScript strict"
```

---

## Task 2: Tailwind CSS + Design System Tokens

**Files:**
- Create: `web/tailwind.config.ts`, `web/postcss.config.js`, `web/src/styles/design-system.css`, `web/src/styles/globals.css`, `web/.prettierrc`

- [ ] **Step 1: Configure postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

- [ ] **Step 2: Configure tailwind.config.ts with all CLAUDE.md breakpoints**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-fg)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)' },
        warning: { DEFAULT: 'var(--warning)' },
        info: { DEFAULT: 'var(--info)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          muted: 'var(--sidebar-muted)',
          accent: 'var(--sidebar-accent)',
          border: 'var(--sidebar-border)'
        },
        elevated: { DEFAULT: 'var(--elevated)', hover: 'var(--elevated-hover)' }
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)'
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)'
      },
      fontSize: {
        display: 'var(--text-display)',
        lg: 'var(--text-lg)',
        title: 'var(--text-title)',
        heading: 'var(--text-heading)',
        subheading: 'var(--text-subheading)',
        body: 'var(--text-body)',
        sm: 'var(--text-sm)',
        caption: 'var(--text-caption)',
        xs: 'var(--text-xs)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        popover: 'var(--shadow-popover)'
      },
      screens: {
        xxxxsAndDown: { min: '0px', max: '280px' },
        xxxxs: { min: '0px', max: '280px' },
        xxxxsAndUp: { min: '0px' },
        xxxsAndDown: { min: '0px', max: '375px' },
        xxxs: { min: '281px', max: '375px' },
        xxxsAndUp: { min: '281px' },
        xxsAndDown: { min: '0px', max: '430px' },
        xxs: { min: '376px', max: '430px' },
        xxsAndUp: { min: '376px' },
        xsAndDown: { min: '0px', max: '639px' },
        xs: { min: '431px', max: '639px' },
        xsAndUp: { min: '431px' },
        smAndDown: { min: '0px', max: '767px' },
        sm: { min: '640px', max: '767px' },
        smAndUp: { min: '640px' },
        mdAndDown: { min: '0px', max: '1023px' },
        md: { min: '768px', max: '1023px' },
        mdAndUp: { min: '768px' },
        lgAndDown: { min: '0px', max: '1279px' },
        lg: { min: '1024px', max: '1279px' },
        lgAndUp: { min: '1024px' },
        xlAndDown: { min: '0px', max: '1535px' },
        xl: { min: '1280px', max: '1535px' },
        xlAndUp: { min: '1280px' },
        '2xl': { min: '1536px' }
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
}

export default config
```

- [ ] **Step 3: Create design-system.css with Medtracker blue primary**

Copy the full igreen-design CSS from the generate_theme_css output, replacing ALL `--primary` tokens:

**Dark theme (:root) replacements:**
```css
--primary: #4B7BFF;
--primary-fg: #ffffff;
--primary-7: rgba(75, 123, 255, 0.07);
--primary-8: rgba(75, 123, 255, 0.08);
--primary-10: rgba(75, 123, 255, 0.10);
--primary-12: rgba(75, 123, 255, 0.12);
--primary-15: rgba(75, 123, 255, 0.15);
--primary-20: rgba(75, 123, 255, 0.20);
--primary-70: rgba(75, 123, 255, 0.70);
```

**Light theme replacements:**
```css
--primary: #2155FC;
--primary-fg: #ffffff;
--primary-7: rgba(33, 85, 252, 0.07);
--primary-8: rgba(33, 85, 252, 0.08);
--primary-10: rgba(33, 85, 252, 0.10);
--primary-12: rgba(33, 85, 252, 0.12);
--primary-15: rgba(33, 85, 252, 0.15);
--primary-20: rgba(33, 85, 252, 0.20);
--primary-70: rgba(33, 85, 252, 0.70);
```

Also change theme selector from `[data-theme="light"]` to `.light` (Tailwind darkMode: class uses `.dark` on html, light is default).

The full file is the complete igreen-design CSS output with these substitutions.

- [ ] **Step 4: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: Create .prettierrc**

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 300,
  "arrowParens": "avoid",
  "trailingComma": "none",
  "endOfLine": "auto"
}
```

- [ ] **Step 6: Update main.tsx to import styles**

```tsx
// styles
import '@/styles/design-system.css'
import '@/styles/globals.css'

// packages
import { createRoot } from 'react-dom/client'

// components
import { App } from '@/App'

createRoot(document.getElementById('root')!).render(<App />)
```

- [ ] **Step 7: Verify dark/light theme works**

Update App.tsx temporarily to test:

```tsx
const loc = '@/App'

export function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-lg">
      <h1 className="text-display font-bold text-primary">Medtracker v2</h1>
      <p className="text-body text-muted-foreground mt-sm">Design system tokens working</p>
      <button
        className="mt-lg px-lg py-sm bg-primary text-primary-foreground rounded-sm"
        onClick={() => document.documentElement.classList.toggle('dark')}
      >
        Toggle Theme
      </button>
    </div>
  )
}
```

Run: `pnpm dev`
Expected: Blue primary (#2155FC) in light, lighter blue (#4B7BFF) in dark. Toggle button switches themes.

- [ ] **Step 8: Commit**

```bash
git add web/
git commit -m "feat: add Tailwind CSS + igreen-design tokens with Medtracker blue primary"
```

---

## Task 3: ESLint + Husky + Commitlint

**Files:**
- Create: `web/eslint.config.js`, `.husky/pre-commit`, `.husky/commit-msg`, `commitlint.config.js`

- [ ] **Step 1: Install linting and commit deps at monorepo root**

```bash
cd /home/developergustavor/Documents/Medtracker/medtracker-migracao
pnpm add -D -w @commitlint/cli @commitlint/config-conventional husky
npx husky init
```

- [ ] **Step 2: Create commitlint.config.js at monorepo root**

```js
export default {
  extends: ['@commitlint/config-conventional']
}
```

- [ ] **Step 3: Create .husky/commit-msg**

```bash
npx --no -- commitlint --edit ${1}
```

- [ ] **Step 4: Create .husky/pre-commit**

```bash
cd web && pnpm tsc --noEmit && pnpm eslint src/
```

- [ ] **Step 5: Create web/eslint.config.js**

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
)
```

- [ ] **Step 6: Verify lint passes**

```bash
cd /home/developergustavor/Documents/Medtracker/medtracker-migracao/web
pnpm eslint src/
pnpm tsc --noEmit
```

Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: add ESLint, Husky, and Commitlint configuration"
```

---

## Task 4: Entities + Types + Constants (Auth Domain)

**Files:**
- Create: `web/src/entities/users/users.types.ts`, `web/src/entities/users/users.enums.ts`, `web/src/entities/users/users.schemas.ts`, `web/src/entities/users/index.ts`, `web/src/entities/cmes/cmes.types.ts`, `web/src/entities/cmes/cmes.enums.ts`, `web/src/entities/cmes/index.ts`, `web/src/entities/apis/apis.types.ts`, `web/src/entities/apis/index.ts`, `web/src/entities/index.ts`, `web/src/types/routes.types.ts`, `web/src/types/index.ts`, `web/src/constants/routes.constants.ts`, `web/src/constants/http.constants.ts`, `web/src/constants/index.ts`, `web/src/configs/env.configs.ts`, `web/src/configs/index.ts`

- [ ] **Step 1: Create user enums**

```typescript
// src/entities/users/users.enums.ts
export enum user_role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  COLABORADOR_CHEFE = 'COLABORADOR_CHEFE',
  REPRESENTANTE = 'REPRESENTANTE',
  COLABORADOR = 'COLABORADOR'
}

export enum user_status {
  LIMITADO = 'LIMITADO',
  ILIMITADO = 'ILIMITADO',
  AGUARDANDO = 'AGUARDANDO',
  BLOQUEADO = 'BLOQUEADO',
  EXPIRADO = 'EXPIRADO',
  DELETADO = 'DELETADO'
}

export enum formatted_user_role {
  ADMINISTRADOR = 'Administrador',
  COLABORADOR_CHEFE = 'Colaborador Chefe',
  REPRESENTANTE = 'Representante',
  COLABORADOR = 'Colaborador'
}
```

- [ ] **Step 2: Create user types**

```typescript
// src/entities/users/users.types.ts
import { user_role, user_status } from '.'

export type UserSettingsProps = {
  auth2FA: boolean
  emailChecked: boolean
}

export type UserProps = {
  id: number
  name: string
  email: string
  cpf: string
  coren: string | null
  code: string | null
  role: user_role
  status: user_status
  settings: UserSettingsProps
  createdAt: string
  updatedAt: string | null
}
```

- [ ] **Step 3: Create user schemas (Zod)**

```typescript
// src/entities/users/users.schemas.ts
import { z } from 'zod'

export const loginByCodeSchema = z.object({
  code: z.string().min(1, 'Codigo obrigatorio')
})

export const loginByCpfSchema = z.object({
  cpf: z.string().min(14, 'CPF invalido'),
  password: z.string().min(1, 'Senha obrigatoria')
})

export const loginByCmeSchema = z.object({
  username: z.string().min(1, 'Usuario obrigatorio'),
  password: z.string().min(1, 'Senha obrigatoria')
})

export const twoFactorSchema = z.object({
  confirmationCode: z.string().min(5, 'Codigo deve ter 5 digitos').max(5)
})

export type LoginByCodeSchema = z.infer<typeof loginByCodeSchema>
export type LoginByCpfSchema = z.infer<typeof loginByCpfSchema>
export type LoginByCmeSchema = z.infer<typeof loginByCmeSchema>
export type TwoFactorSchema = z.infer<typeof twoFactorSchema>
```

- [ ] **Step 4: Create user barrel export**

```typescript
// src/entities/users/index.ts
export { user_role, user_status, formatted_user_role } from './users.enums'
export type { UserProps, UserSettingsProps } from './users.types'
export { loginByCodeSchema, loginByCpfSchema, loginByCmeSchema, twoFactorSchema } from './users.schemas'
export type { LoginByCodeSchema, LoginByCpfSchema, LoginByCmeSchema, TwoFactorSchema } from './users.schemas'
```

- [ ] **Step 5: Create CME enums and types**

```typescript
// src/entities/cmes/cmes.enums.ts
export enum cme_module {
  ETIQUETAGEM = 'ETIQUETAGEM',
  COMPLETO = 'COMPLETO',
  IMPRESSAO = 'IMPRESSAO'
}

export enum cme_status {
  LIMITADO = 'LIMITADO',
  ILIMITADO = 'ILIMITADO',
  AGUARDANDO = 'AGUARDANDO',
  BLOQUEADO = 'BLOQUEADO',
  EXPIRADO = 'EXPIRADO',
  DELETADO = 'DELETADO'
}

export enum formatted_cme_module {
  ETIQUETAGEM = 'Etiquetagem',
  COMPLETO = 'Completo',
  IMPRESSAO = 'Impressao'
}
```

```typescript
// src/entities/cmes/cmes.types.ts
import { cme_module, cme_status } from '.'

export type CmeSettingsProps = {
  useAI: boolean
  useQRCode: boolean
  useCodeMaterialTabAsDefault: boolean
  useCodeUserTabAsDefault: boolean
}

export type CmeProps = {
  id: number
  username: string
  corporateName: string
  cnpj: string | null
  city: string | null
  uf: string | null
  email: string | null
  module: cme_module
  status: cme_status
  settings: CmeSettingsProps
  paths: { logo: string | null }
  createdAt: string
}
```

```typescript
// src/entities/cmes/index.ts
export { cme_module, cme_status, formatted_cme_module } from './cmes.enums'
export type { CmeProps, CmeSettingsProps } from './cmes.types'
```

- [ ] **Step 6: Create API types**

```typescript
// src/entities/apis/apis.types.ts
export type BaseResponseProps<T = unknown[]> = {
  statusCode: number
  statusMessage?: string
  details?: string | unknown
  body: T
  token?: string
  meta?: {
    page: number
    pages: number
    limit: number
    total: number
    order?: string
  }
}
```

```typescript
// src/entities/apis/index.ts
export type { BaseResponseProps } from './apis.types'
```

- [ ] **Step 7: Create entities barrel**

```typescript
// src/entities/index.ts
export { user_role, user_status, formatted_user_role } from './users'
export type { UserProps, UserSettingsProps, LoginByCodeSchema, LoginByCpfSchema, LoginByCmeSchema, TwoFactorSchema } from './users'
export { loginByCodeSchema, loginByCpfSchema, loginByCmeSchema, twoFactorSchema } from './users'
export { cme_module, cme_status, formatted_cme_module } from './cmes'
export type { CmeProps, CmeSettingsProps } from './cmes'
export type { BaseResponseProps } from './apis'
```

- [ ] **Step 8: Create route types and constants**

```typescript
// src/types/routes.types.ts
import type { user_role, cme_module } from '@/entities'

export type RouteMetadataProps = {
  name: string
  path: string
  icon?: string
  allowedRoles: user_role[]
  allowedModules: cme_module[]
  showInSidebar: boolean
  showInMobileTab?: boolean
  mobileTabRoles?: user_role[]
  children?: RouteMetadataProps[]
  contextualActions?: ContextualActionProps[]
}

export type ContextualActionProps = {
  label: string
  icon: string
  action: string
  variant?: 'primary' | 'default'
  position?: 'start' | 'center' | 'end'
}
```

```typescript
// src/types/index.ts
export type { RouteMetadataProps, ContextualActionProps } from './routes.types'
```

- [ ] **Step 9: Create routes constants**

```typescript
// src/constants/routes.constants.ts
import { user_role, cme_module } from '@/entities'
import type { RouteMetadataProps } from '@/types'

const allRoles = Object.values(user_role)
const nonColabRoles = [user_role.ADMINISTRADOR, user_role.COLABORADOR_CHEFE, user_role.REPRESENTANTE]
const adminOnly = [user_role.ADMINISTRADOR]
const allModules = Object.values(cme_module)
const workflowModules = [cme_module.ETIQUETAGEM, cme_module.COMPLETO]

export const ROUTES: RouteMetadataProps[] = [
  {
    name: 'Home',
    path: '/home',
    icon: 'Home2',
    allowedRoles: allRoles,
    allowedModules: allModules,
    showInSidebar: true,
    showInMobileTab: true,
    mobileTabRoles: allRoles
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'Chart',
    allowedRoles: nonColabRoles,
    allowedModules: allModules,
    showInSidebar: true,
    showInMobileTab: true,
    mobileTabRoles: nonColabRoles
  },
  {
    name: 'Cadastros',
    path: '/cadastros',
    icon: 'AddSquare',
    allowedRoles: nonColabRoles,
    allowedModules: allModules,
    showInSidebar: true,
    showInMobileTab: true,
    mobileTabRoles: nonColabRoles,
    children: [
      { name: 'Materiais', path: '/cadastros/materiais', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Colaboradores', path: '/cadastros/colaboradores', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Equipamentos', path: '/cadastros/equipamentos', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Embalagens', path: '/cadastros/embalagens', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Tipos de Ciclo', path: '/cadastros/tipos-de-ciclo', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Tipos de Ocorrencia', path: '/cadastros/tipos-de-ocorrencia', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Indicadores', path: '/cadastros/indicadores', allowedRoles: nonColabRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Insumos', path: '/cadastros/insumos', allowedRoles: nonColabRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Terceiros', path: '/cadastros/terceiros', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Setores', path: '/cadastros/setores', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Medicos', path: '/cadastros/medicos', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Pacientes', path: '/cadastros/pacientes', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Checklists', path: '/cadastros/checklists', allowedRoles: nonColabRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Modelos', path: '/cadastros/modelos', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true }
    ]
  },
  {
    name: 'Entrada de Materiais',
    path: '/entrada-de-materiais',
    icon: 'DirectboxReceive',
    allowedRoles: allRoles,
    allowedModules: workflowModules,
    showInSidebar: true,
    showInMobileTab: true,
    mobileTabRoles: [user_role.COLABORADOR]
  },
  {
    name: 'Ciclos',
    path: '/ciclos',
    icon: 'Refresh2',
    allowedRoles: allRoles,
    allowedModules: workflowModules,
    showInSidebar: true,
    showInMobileTab: true,
    mobileTabRoles: allRoles,
    children: [
      { name: 'Desinfeccao', path: '/ciclos/desinfeccao', allowedRoles: allRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Esterilizacao', path: '/ciclos/esterilizacao', allowedRoles: allRoles, allowedModules: workflowModules, showInSidebar: true }
    ]
  },
  {
    name: 'Saida de Materiais',
    path: '/saida-de-materiais',
    icon: 'DirectboxSend',
    allowedRoles: allRoles,
    allowedModules: workflowModules,
    showInSidebar: true,
    showInMobileTab: true,
    mobileTabRoles: [user_role.COLABORADOR]
  },
  {
    name: 'Conferencia',
    path: '/conferencia',
    icon: 'TaskSquare',
    allowedRoles: allRoles,
    allowedModules: [cme_module.COMPLETO],
    showInSidebar: true
  },
  {
    name: 'Impressao de Etiquetas',
    path: '/impressao-de-etiquetas',
    icon: 'Tag',
    allowedRoles: allRoles,
    allowedModules: [cme_module.IMPRESSAO],
    showInSidebar: true
  },
  {
    name: 'Relatorios',
    path: '/relatorios',
    icon: 'DocumentText',
    allowedRoles: adminOnly,
    allowedModules: workflowModules,
    showInSidebar: false
  },
  {
    name: 'Gerenciamento',
    path: '/gerenciamento',
    icon: 'Setting2',
    allowedRoles: adminOnly,
    allowedModules: allModules,
    showInSidebar: true
  },
  {
    name: 'Configuracoes',
    path: '/configuracoes',
    icon: 'Setting',
    allowedRoles: nonColabRoles,
    allowedModules: allModules,
    showInSidebar: true
  }
]
```

- [ ] **Step 10: Create HTTP constants**

```typescript
// src/constants/http.constants.ts
export const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const
```

```typescript
// src/constants/index.ts
export { ROUTES } from './routes.constants'
export { HTTP_STATUS_CODE } from './http.constants'
```

- [ ] **Step 11: Create env config**

```typescript
// src/configs/env.configs.ts
export const { VITE_APP_NAME, VITE_NODE_ENV, VITE_API_URL } = import.meta.env
```

```typescript
// src/configs/index.ts
export { VITE_APP_NAME, VITE_NODE_ENV, VITE_API_URL } from './env.configs'
```

- [ ] **Step 12: Verify types compile**

```bash
cd /home/developergustavor/Documents/Medtracker/medtracker-migracao/web
pnpm tsc --noEmit
```

Expected: No type errors

- [ ] **Step 13: Commit**

```bash
git add web/src/entities/ web/src/types/ web/src/constants/ web/src/configs/
git commit -m "feat: add entities, types, constants, and configs for auth domain"
```

---

## Task 5: Stores (Auth + UI)

**Files:**
- Create: `web/src/store/auth.store.ts`, `web/src/store/ui.store.ts`, `web/src/store/index.ts`

- [ ] **Step 1: Create auth store**

```typescript
// src/store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProps, CmeProps } from '@/entities'
import { VITE_APP_NAME, VITE_NODE_ENV } from '@/configs'

type AuthState = {
  user: UserProps | null
  cme: CmeProps | null
  token: string | null
  isAuthenticated: boolean
  login: (user: UserProps, token: string) => void
  loginCme: (cme: CmeProps, token: string) => void
  setUser: (user: UserProps) => void
  setCme: (cme: CmeProps) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      cme: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      loginCme: (cme, token) => set({ cme, token, isAuthenticated: true }),
      setUser: user => set({ user }),
      setCme: cme => set({ cme }),
      logout: () => {
        set({ user: null, cme: null, token: null, isAuthenticated: false })
        window.location.href = '/login'
      }
    }),
    { name: `${VITE_APP_NAME}-${VITE_NODE_ENV}-auth-storage` }
  )
)
```

- [ ] **Step 2: Create UI store**

```typescript
// src/store/ui.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { VITE_APP_NAME, VITE_NODE_ENV } from '@/configs'

type Theme = 'light' | 'dark'

type UIState = {
  sidebarCollapsed: boolean
  theme: Theme
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  persist(
    set => ({
      sidebarCollapsed: false,
      theme: 'light',
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: collapsed => set({ sidebarCollapsed: collapsed }),
      setTheme: theme => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ theme })
      }
    }),
    { name: `${VITE_APP_NAME}-${VITE_NODE_ENV}-ui-storage` }
  )
)
```

- [ ] **Step 3: Create store barrel**

```typescript
// src/store/index.ts
export { useAuthStore } from './auth.store'
export { useUIStore } from './ui.store'
```

- [ ] **Step 4: Verify types compile**

```bash
pnpm tsc --noEmit
```

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add web/src/store/
git commit -m "feat: add auth and UI stores with Zustand persist"
```

---

**Note: Tasks 6-10 (MSW Mock Layer, Axios + Requests Lib, Auth Guards, Layout Components, Login Page) will be defined in subsequent plan files as each task completes and is validated.**

The plan is intentionally scoped to Tasks 1-5 as the first deliverable batch. Each subsequent batch (Tasks 6-10) will be planned after validation of the foundation.

This ensures:
1. We validate the project compiles and runs before building on it
2. Each batch can be reviewed independently
3. We don't over-plan ahead of validation cycles
