# Entrada de Materiais — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Material Entry page — split layout with metadata form (left) and materials list with scan/conference/auth (right). Includes reusable MaterialCheckPanel, AuthModal, and CreateInlineDrawer components.

**Architecture:** React SPA page at `/entrada-de-materiais`. Left panel: form with Zod validation, comboboxes, conditional fields. Right panel: scan bar + material cards (KIT with accordion, AVULSO with quantity). Conference opens MaterialCheckPanel (drag & drop + scan). Auth per material via AuthModal. All data from MSW mocks.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS, shadcn/ui, Zustand (auth store only), React Hook Form + Zod v4, iconsax-react, MSW, HTML5 Drag API

---

## File Structure

```
web/src/
├── entities/entries/
│   ├── entries.enums.ts          # entry_type, entry_status
│   ├── entries.types.ts          # IEntry, IEntryMaterial, IMaterialCheck
│   ├── entries.schemas.ts        # Zod schemas for entry form
│   └── index.ts                  # Barrel
├── mock/data/
│   └── entrada.mock.ts           # Mock entries, entry materials
├── mock/handlers/
│   └── entrada.handlers.ts       # MSW handlers for entrada
├── components/domain/
│   ├── MaterialCheckPanel.tsx     # Reusable conference component
│   ├── AuthModal.tsx              # Reusable auth-per-item modal
│   └── CreateInlineDrawer.tsx     # Drawer for creating doctor/patient/owner
├── pages/entrada/
│   ├── Entrada.tsx                # Main page (split layout)
│   ├── EntradaForm.tsx            # Left panel: metadata form
│   ├── EntradaMaterialList.tsx    # Right panel: scan + materials
│   ├── EntradaMaterialCard.tsx    # Individual material card
│   └── index.ts                  # Barrel
```

---

## Task 1: Entity types, enums, and schemas

**Files:**
- Create: `src/entities/entries/entries.enums.ts`
- Create: `src/entities/entries/entries.types.ts`
- Create: `src/entities/entries/entries.schemas.ts`
- Create: `src/entities/entries/index.ts`
- Modify: `src/entities/index.ts`

- [ ] **Step 1: Create enums**

```typescript
// src/entities/entries/entries.enums.ts
export enum entry_type {
  INTERNA = 'INTERNA',
  EXTERNA = 'EXTERNA'
}

export enum entry_status {
  PROCESSANDO = 'PROCESSANDO',
  VALIDO = 'VALIDO',
  INVALIDO = 'INVALIDO'
}

export enum formatted_entry_type {
  INTERNA = 'Interna',
  EXTERNA = 'Externa'
}

export enum formatted_entry_status {
  PROCESSANDO = 'Processando',
  VALIDO = 'Válido',
  INVALIDO = 'Inválido'
}
```

- [ ] **Step 2: Create types**

```typescript
// src/entities/entries/entries.types.ts
import { entry_type, entry_status } from '.'

export type EntryFormData = {
  type: entry_type
  departmentId: string
  sourceCmeId: string
  doctorId: string
  patientId: string
  procedureDate: string
  procedureTime: string
  ownerId: string
  ownerType: string
}

export type EntryMaterialProps = {
  id: number
  materialId: number
  materialName: string
  materialCode: string | null
  materialType: 'KIT' | 'AVULSO' | 'QUANTIDADE'
  packageName: string | null
  amount: number
  images: string[]
  recorded: boolean
  recordedBy: string | null
  recordedAt: string | null
  checkedCount: number
  totalCount: number
}

export type EntryProps = {
  id: number
  cmeId: number
  type: entry_type
  status: entry_status
  departmentId: number | null
  sourceCmeId: number | null
  doctorId: number | null
  patientId: number | null
  ownerId: number | null
  ownerType: string | null
  procedureDatetime: string | null
  materials: EntryMaterialProps[]
  createdAt: string
}
```

- [ ] **Step 3: Create Zod schema**

```typescript
// src/entities/entries/entries.schemas.ts
import { z } from 'zod'

export const entryFormSchema = z.object({
  type: z.enum(['INTERNA', 'EXTERNA']),
  departmentId: z.string().optional(),
  sourceCmeId: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  procedureDate: z.string().optional(),
  procedureTime: z.string().optional(),
  ownerId: z.string().optional(),
  ownerType: z.string().optional()
}).refine(data => {
  if (data.type === 'INTERNA') return !!data.departmentId
  return !!data.sourceCmeId
}, { message: 'Setor ou CME obrigatório', path: ['departmentId'] })
.refine(data => {
  const hasDate = !!data.procedureDate
  const hasTime = !!data.procedureTime
  return hasDate === hasTime
}, { message: 'Data e hora devem ser preenchidos juntos', path: ['procedureDate'] })
```

- [ ] **Step 4: Create barrel and update entities index**

```typescript
// src/entities/entries/index.ts
export { entry_type, entry_status, formatted_entry_type, formatted_entry_status } from './entries.enums'
export type { EntryFormData, EntryMaterialProps, EntryProps } from './entries.types'
export { entryFormSchema } from './entries.schemas'
```

Add to `src/entities/index.ts`:
```typescript
export { entry_type, entry_status, formatted_entry_type, formatted_entry_status } from './entries'
export type { EntryFormData, EntryMaterialProps, EntryProps } from './entries'
export { entryFormSchema } from './entries'
```

- [ ] **Step 5: Verify typecheck**

Run: `cd web && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```
feat: add entry entity types, enums, and schemas
```

---

## Task 2: Mock data and MSW handlers

**Files:**
- Create: `src/mock/data/entrada.mock.ts`
- Create: `src/mock/handlers/entrada.handlers.ts`
- Modify: `src/mock/data/index.ts`
- Modify: `src/mock/handlers/index.ts`
- Modify: `src/mock/browser.ts`

- [ ] **Step 1: Create mock data**

```typescript
// src/mock/data/entrada.mock.ts
const _loc = '@/mock/data/entrada.mock'

export type MockEntry = {
  id: number
  cmeId: number
  type: 'INTERNA' | 'EXTERNA'
  status: 'PROCESSANDO' | 'VALIDO' | 'INVALIDO'
  departmentId: number | null
  sourceCmeId: number | null
  doctorId: number | null
  patientId: number | null
  ownerId: number | null
  ownerType: string | null
  procedureDatetime: string | null
  createdAt: string
}

export type MockEntryMaterial = {
  id: number
  entryId: number
  materialId: number
  userId: number
  amount: number
  imagesPath: string[]
  recorded: boolean
  createdAt: string
}

export const mockEntries: MockEntry[] = [
  { id: 1, cmeId: 1, type: 'INTERNA', status: 'PROCESSANDO', departmentId: 1, sourceCmeId: null, doctorId: 1, patientId: 2, ownerId: null, ownerType: null, procedureDatetime: '2026-04-14T08:30:00Z', createdAt: '2026-04-14T07:00:00Z' },
  { id: 2, cmeId: 1, type: 'EXTERNA', status: 'VALIDO', departmentId: null, sourceCmeId: 2, doctorId: null, patientId: null, ownerId: 1, ownerType: 'MEDICO', procedureDatetime: null, createdAt: '2026-04-13T14:00:00Z' },
  { id: 3, cmeId: 1, type: 'INTERNA', status: 'VALIDO', departmentId: 3, sourceCmeId: null, doctorId: 3, patientId: 5, ownerId: null, ownerType: null, procedureDatetime: '2026-04-12T10:00:00Z', createdAt: '2026-04-12T09:00:00Z' }
]

export const mockEntryMaterials: MockEntryMaterial[] = [
  { id: 1, entryId: 1, materialId: 2, userId: 1, amount: 1, imagesPath: [], recorded: false, createdAt: '2026-04-14T07:05:00Z' },
  { id: 2, entryId: 1, materialId: 1, userId: 1, amount: 1, imagesPath: [], recorded: true, createdAt: '2026-04-14T07:10:00Z' },
  { id: 3, entryId: 1, materialId: 9, userId: 1, amount: 500, imagesPath: [], recorded: true, createdAt: '2026-04-14T07:15:00Z' },
  { id: 4, entryId: 2, materialId: 6, userId: 2, amount: 1, imagesPath: [], recorded: true, createdAt: '2026-04-13T14:05:00Z' },
  { id: 5, entryId: 3, materialId: 7, userId: 3, amount: 5, imagesPath: [], recorded: true, createdAt: '2026-04-12T09:10:00Z' }
]
```

- [ ] **Step 2: Create MSW handlers**

```typescript
// src/mock/handlers/entrada.handlers.ts
import { http, HttpResponse } from 'msw'
import { mockEntries, mockEntryMaterials } from '@/mock/data'
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
```

- [ ] **Step 3: Update barrel exports**

Add to `src/mock/data/index.ts`:
```typescript
export { mockEntries, mockEntryMaterials } from './entrada.mock'
export type { MockEntry, MockEntryMaterial } from './entrada.mock'
```

Add to `src/mock/handlers/index.ts`:
```typescript
export { entradaHandlers } from './entrada.handlers'
```

Update `src/mock/browser.ts`:
```typescript
import { authHandlers, cadastrosHandlers, entradaHandlers } from '@/mock/handlers'

export const worker = setupWorker(...authHandlers, ...cadastrosHandlers, ...entradaHandlers)
```

- [ ] **Step 4: Verify typecheck**

Run: `cd web && npx tsc --noEmit`

- [ ] **Step 5: Commit**

```
feat: add entrada mock data and MSW handlers
```

---

## Task 3: Page setup and routing

**Files:**
- Create: `src/pages/entrada/Entrada.tsx`
- Create: `src/pages/entrada/index.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create page shell**

```typescript
// src/pages/entrada/Entrada.tsx
import { useEffect, useCallback } from 'react'

// hooks
import { useIsMobile, useIsDesktop } from '@/hooks'

const _loc = '@/pages/entrada/Entrada'

function Entrada() {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  // Listen for contextual-action events
  useEffect(() => {
    const handler = (e: Event) => {
      const actionId = (e as CustomEvent).detail as string
      if (actionId === 'new-entry') handleNewEntry()
      if (actionId === 'report') handleReport()
    }
    window.addEventListener('contextual-action', handler)
    return () => window.removeEventListener('contextual-action', handler)
  }, [])

  const handleNewEntry = useCallback(() => {
    window.location.reload()
  }, [])

  const handleReport = useCallback(() => {
    // TODO: open report dialog
    console.log(`[${_loc}] report`)
  }, [])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: form panel */}
      <div className={isDesktop ? 'w-[320px] shrink-0 border-r border-border bg-card overflow-y-auto' : 'hidden'}>
        <div className="p-lg text-center text-muted-foreground text-body">Form placeholder</div>
      </div>

      {/* Right: materials area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <div className="p-lg text-center text-muted-foreground text-body">Materials placeholder</div>
      </div>
    </div>
  )
}

export { Entrada }
```

- [ ] **Step 2: Create barrel**

```typescript
// src/pages/entrada/index.ts
export { Entrada } from './Entrada'
```

- [ ] **Step 3: Register in App.tsx PAGE_MAP**

Add after the cadastros entries in `PAGE_MAP`:
```typescript
'/entrada-de-materiais': lazy(() => import('@/pages/entrada').then(m => ({ default: m.Entrada }))),
```

- [ ] **Step 4: Verify typecheck and test in browser**

Run: `cd web && npx tsc --noEmit`
Navigate to `/entrada-de-materiais` — should show split layout with placeholders.

- [ ] **Step 5: Commit**

```
feat: add entrada page shell with routing
```

---

## Task 4: EntradaForm — metadata form (left panel)

**Files:**
- Create: `src/pages/entrada/EntradaForm.tsx`
- Modify: `src/pages/entrada/Entrada.tsx`

- [ ] **Step 1: Create form component**

Create `src/pages/entrada/EntradaForm.tsx` with:
- Progress badges strip (green check / gray circle for each field)
- Tipo select (INTERNA/EXTERNA) — controls which destination field shows
- Setor select (if INTERNA) — from `mockDepartments` filtered by ATIVO
- CME Origem select (if EXTERNA) — from `mockCmes`
- Medico combobox with "+ Criar" button — from `mockDoctors` filtered by ATIVO
- Paciente combobox with "+ Criar" — from `mockPatients` filtered by ATIVO
- Data Procedimento masked input (DD/MM/AAAA)
- Hora Procedimento masked input (HH:MM)
- Terceiro combobox with "+ Criar" — from `mockOwners` filtered by ATIVO
- Tipo Terceiro select (MEDICO/EMPRESA) — disabled unless Terceiro selected
- Lock Tipo + Setor/CME when `materialsAdded` prop is true

Props interface:
```typescript
type EntradaFormProps = {
  formData: EntryFormData
  onChange: (data: Partial<EntryFormData>) => void
  materialsAdded: boolean
  onCreateInline: (entity: 'doctor' | 'patient' | 'owner') => void
}
```

Use React Hook Form with zodResolver(entryFormSchema). Render each field following the FieldRenderer pattern from CadastroForm.tsx but simplified (no grid, vertical stack in 320px panel).

- [ ] **Step 2: Integrate in Entrada.tsx**

Replace the left panel placeholder with `<EntradaForm>`. Add state for formData and materialsAdded:
```typescript
const [formData, setFormData] = useState<EntryFormData>({
  type: '' as entry_type,
  departmentId: '', sourceCmeId: '', doctorId: '', patientId: '',
  procedureDate: '', procedureTime: '', ownerId: '', ownerType: ''
})
const [materialsAdded, setMaterialsAdded] = useState(false)

const isFormValid = !!(formData.type && (formData.departmentId || formData.sourceCmeId))
```

- [ ] **Step 3: Verify typecheck and test in browser**

Form should render with all fields. Tipo toggle should switch Setor/CME. Badges should update on fill.

- [ ] **Step 4: Commit**

```
feat: add EntradaForm metadata panel
```

---

## Task 5: EntradaMaterialList + EntradaMaterialCard

**Files:**
- Create: `src/pages/entrada/EntradaMaterialList.tsx`
- Create: `src/pages/entrada/EntradaMaterialCard.tsx`
- Modify: `src/pages/entrada/Entrada.tsx`

- [ ] **Step 1: Create EntradaMaterialCard**

Card component with 3 variants based on material type and state:
- **KIT**: photo, name, badge KIT (primary), code, package, progress bar (X/Y), action buttons (Conferir, Imagens, Registrar, Remover), collapsible accordion with submaterials grid (multi-col, max-height 120px, scroll)
- **AVULSO/QUANTIDADE**: photo, name, badge type (gray), code, package, quantity input (−/+), action buttons (Imagens, Registrar, Remover)
- **REGISTRADO**: green border/bg, opacity 0.7, badge "REGISTRADO", info "Registrado por [nome] · [hora]", actions disabled

Props:
```typescript
type EntradaMaterialCardProps = {
  material: EntryMaterialProps
  submaterials?: Submaterial[]
  onConference: () => void
  onImages: () => void
  onRegister: () => void
  onRemove: () => void
  onAmountChange: (amount: number) => void
}
```

- [ ] **Step 2: Create EntradaMaterialList**

Container with:
- Disabled overlay when `!isFormValid`
- Scan bar (input auto-focus, border primary, placeholder, "+" button)
- Scrollable list of EntradaMaterialCard
- Footer: "X materiais · Y registrados" + Relatório button (TODO placeholder)

Props:
```typescript
type EntradaMaterialListProps = {
  materials: EntryMaterialProps[]
  isFormValid: boolean
  onAddMaterial: (materialId: number) => void
  onConference: (index: number) => void
  onImages: (index: number) => void
  onRegister: (index: number) => void
  onRemove: (index: number) => void
  onAmountChange: (index: number, amount: number) => void
}
```

Scan bar logic: on Enter/blur, lookup material by code in mockMaterials. If found → add. If not found → show toast/alert.

- [ ] **Step 3: Integrate in Entrada.tsx**

Replace right panel placeholder. Add materials state array and handlers:
```typescript
const [materials, setMaterials] = useState<EntryMaterialProps[]>([])
```

Wire up add, remove, amount change, and mark as registered handlers.

- [ ] **Step 4: Verify in browser**

Fill form → materials area unlocks → type code → material appears in list → KIT shows accordion → AVULSO shows quantity.

- [ ] **Step 5: Commit**

```
feat: add material list and card components for entrada
```

---

## Task 6: AuthModal component

**Files:**
- Create: `src/components/domain/AuthModal.tsx`
- Modify: `src/components/domain/index.ts`

- [ ] **Step 1: Create AuthModal**

Dialog with:
- Title: "Autenticar para registrar"
- Input: code field (same as login by code)
- Toggle: "Lembrar de mim" checkbox
- Buttons: Confirmar (primary), Cancelar
- Logic: lookup code in mockUsers. If found → success callback with user data. If not → error message.
- "Lembrar de mim": if checked, store userId in component-level ref so parent can skip future auth calls in this session

```typescript
type AuthModalProps = {
  open: boolean
  onClose: () => void
  onAuthenticate: (userId: number, userName: string) => void
  rememberedUserId?: number | null
}
```

If `rememberedUserId` is set, auto-authenticate without showing dialog.

- [ ] **Step 2: Export from barrel**

Add to `src/components/domain/index.ts`:
```typescript
export { AuthModal } from './AuthModal'
export type { AuthModalProps } from './AuthModal'
```

- [ ] **Step 3: Integrate in Entrada.tsx**

Wire "Registrar" button on material cards → open AuthModal → on success mark material as recorded.

- [ ] **Step 4: Verify in browser**

Click Registrar → auth dialog → enter code "gg" → material turns green "REGISTRADO". Toggle "Lembrar" → next Registrar skips dialog.

- [ ] **Step 5: Commit**

```
feat: add reusable AuthModal component
```

---

## Task 7: CreateInlineDrawer component

**Files:**
- Create: `src/components/domain/CreateInlineDrawer.tsx`
- Modify: `src/components/domain/index.ts`
- Modify: `src/pages/entrada/Entrada.tsx`

- [ ] **Step 1: Create CreateInlineDrawer**

Sheet/drawer from the right side. Renders a form based on entity type:
- `doctor`: name field (reuse doctorFormConfig pattern from cadastros.forms.ts)
- `patient`: name field (reuse patientFormConfig pattern)
- `owner`: name + type fields (reuse ownerFormConfig pattern)

```typescript
type CreateInlineDrawerProps = {
  open: boolean
  entityType: 'doctor' | 'patient' | 'owner' | null
  onClose: () => void
  onCreated: (entity: { id: number; name: string; type?: string }) => void
}
```

Uses shadcn Sheet component. Form with Zod validation. On save: generates mock id (Date.now()), calls onCreated, closes.

- [ ] **Step 2: Export from barrel**

Add to `src/components/domain/index.ts`:
```typescript
export { CreateInlineDrawer } from './CreateInlineDrawer'
export type { CreateInlineDrawerProps } from './CreateInlineDrawer'
```

- [ ] **Step 3: Integrate in Entrada.tsx**

Wire "+ Criar" buttons in EntradaForm → open drawer with entity type → on created, update form field with new item.

- [ ] **Step 4: Verify in browser**

Click "+ Criar" on Médico → drawer opens → type name → save → drawer closes → name appears in combobox selected.

- [ ] **Step 5: Commit**

```
feat: add CreateInlineDrawer for doctor/patient/owner
```

---

## Task 8: MaterialCheckPanel component

**Files:**
- Create: `src/components/domain/MaterialCheckPanel.tsx`
- Modify: `src/components/domain/index.ts`
- Modify: `src/pages/entrada/Entrada.tsx`

- [ ] **Step 1: Create MaterialCheckPanel**

Full conference component per validated mockup v4:

```typescript
type CheckItem = {
  id: number
  code: string
  name: string
  amount: number
  checkedAmount: number
  images: string[]
}

type MaterialCheckPanelProps = {
  materialName: string
  items: CheckItem[]
  onUpdate: (items: CheckItem[]) => void
  onClose: () => void
}
```

Structure:
1. **Scan bar** (top): auto-focus input + progress bar gradient X/Y
2. **Highlight strip** (bg primary-7): "N faltando" + último conferido (primary colors, photo+name)
3. **Grid** (responsive: 3 cols lg, 2 cols md, 1 col mobile): cards sorted Pendentes → Parciais → Separador → Conferidos
4. Each card: thumbnail 52x52, name, code, badge X/Y (yellow pending, orange partial, green complete)
5. **Interactions**: hover border-primary, 1x-click border-primary border-2 + tip tooltip, 2x-click TODO MaterialPreview
6. **Drag & drop**: HTML5 drag API. Cards draggable. Drop zone inside conferidos section (dashed green). Bilateral: pending→checked and checked→pending
7. **Scan**: match code in items → increment checkedAmount → beep (Audio element with short tone)
8. **Drop zone**: only visible during drag (onDragOver)

Sorting function: items with `checkedAmount === 0` first, then `checkedAmount > 0 && checkedAmount < amount`, then `checkedAmount >= amount`.

- [ ] **Step 2: Export from barrel**

Add to `src/components/domain/index.ts`:
```typescript
export { MaterialCheckPanel } from './MaterialCheckPanel'
export type { MaterialCheckPanelProps, CheckItem } from './MaterialCheckPanel'
```

- [ ] **Step 3: Integrate in Entrada.tsx**

Wire "Conferir" button on KIT cards → open fullscreen/dialog with MaterialCheckPanel → on close, update material's checkedCount.

State in Entrada.tsx:
```typescript
const [conferenceTarget, setConferenceTarget] = useState<number | null>(null) // material index
```

- [ ] **Step 4: Verify in browser**

Click Conferir on KIT → panel opens → cards visible with quantities → drag card to drop zone → becomes green → progress updates → scan code → auto-checks → beep plays.

- [ ] **Step 5: Commit**

```
feat: add reusable MaterialCheckPanel with drag & drop
```

---

## Task 9: Mobile layout

**Files:**
- Modify: `src/pages/entrada/Entrada.tsx`
- Modify: `src/pages/entrada/EntradaForm.tsx`

- [ ] **Step 1: Add mobile accordion for form**

In Entrada.tsx, when `!isDesktop`:
- Render EntradaForm as collapsible accordion at the top (default expanded until form valid, then collapsed)
- Materials area takes full remaining height
- Use a simple collapsible div with chevron toggle

In EntradaForm.tsx:
- When rendered inside accordion, use full width instead of fixed 320px
- Fields in 2-col grid on tablet, 1-col on mobile

- [ ] **Step 2: Verify on mobile viewport**

Resize to 390x844. Form should collapse. Materials should fill screen. Conference panel should use 1 column.

- [ ] **Step 3: Commit**

```
feat: add mobile responsive layout for entrada
```

---

## Task 10: Report placeholder and images dialog

**Files:**
- Modify: `src/pages/entrada/EntradaMaterialList.tsx`
- Modify: `src/pages/entrada/Entrada.tsx`

- [ ] **Step 1: Add report placeholder dialog**

On "Relatório" button click, open ConfirmDialog-style dialog with:
- Title: "Relatório de Entrada"
- Description: "Funcionalidade em desenvolvimento. Em breve será possível visualizar, exportar e imprimir o relatório da entrada."
- Single "Fechar" button
- TODO comment in code for future implementation

- [ ] **Step 2: Add images dialog for materials**

On "Imagens" button click, open dialog with:
- Title: "Imagens — [material name]"
- File input (accept image/*, max 3)
- Grid of existing images with remove button
- Uses same base64 pattern from MaterialImageColumn

- [ ] **Step 3: Verify in browser**

Relatório button → placeholder dialog. Imagens → can add/remove photos.

- [ ] **Step 4: Commit**

```
feat: add report placeholder and images dialog for entrada
```

---

## Execution Order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Tasks 1-3 are foundation. Tasks 4-5 build the main UI. Tasks 6-8 add interactive components. Tasks 9-10 are polish and placeholders.
