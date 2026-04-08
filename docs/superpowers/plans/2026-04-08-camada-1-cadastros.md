# Camada 1 — Cadastros: Implementation Plan

## Context

Camada 0 complete (scaffold, layout, login, home). Now building the master data management system — 14 registration tabs with full CRUD operations.

## Architecture

- Reusable DataTable component following igreen-design tokens
- Generic FormDialog for create/edit operations
- Tab-based navigation with URL hash sync
- All data from MSW mocks (adapter pattern for future API)
- Zod v4 validation on all forms
- React Hook Form for form management
- RBAC filtering on tabs (some restricted by module)

## Task Decomposition

### Task 11: Base Components (DataTable, FormDialog, ConfirmDialog, SearchInput)

**Files to create:**
- `src/components/domain/DataTable.tsx` — Generic sortable, paginated, selectable table
- `src/components/domain/FormDialog.tsx` — Generic dialog wrapper for create/edit forms
- `src/components/domain/ConfirmDialog.tsx` — Confirmation dialog for delete actions
- `src/components/domain/SearchInput.tsx` — Debounced search input
- `src/components/domain/StatusBadge.tsx` — Colored status badges
- `src/components/domain/index.ts` — Barrel

**DataTable spec:**
- Uses shadcn Table, Checkbox, Skeleton
- Props: columns config, data array, loading state, pagination, sorting, selection, actions
- Header: bg overlay-3, text fg-muted, uppercase caption
- Rows: border-bottom separator, hover overlay-3
- Pagination: igreen-design pattern (page info + page buttons + page size select)
- Selection: checkbox column, multi-select, floating footer with count + bulk actions
- Empty state: centered message
- Loading state: skeleton rows

### Task 12: Cadastros Page Structure

**Files:**
- `src/pages/cadastros/Cadastros.tsx` — Main page with tabs
- `src/pages/cadastros/index.ts` — Barrel
- Update App.tsx PAGE_MAP

### Task 13: Mock Data for All Entities

**Files:**
- `src/mock/data/cadastros.mock.ts` — Mock data for all 14 entities
- `src/mock/handlers/cadastros.handlers.ts` — MSW handlers for CRUD

### Tasks 14-19: Individual Tabs (Simple entities — single form, 1-3 fields)

These share the same pattern: DataTable + FormDialog with minimal fields.

- **14**: Médicos (nome)
- **15**: Pacientes (nome)
- **16**: Setores (nome, código)
- **17**: Terceiros (nome, tipo select)
- **18**: Tipos de Ciclo (nome, categoria select)
- **19**: Tipos de Ocorrência (nome, tipo select)

### Tasks 20-22: Medium complexity tabs

- **20**: Embalagens (nome, dias validade)
- **21**: Indicadores (nome, preço, invalida ciclo checkbox) — module restricted
- **22**: Insumos (nome, preço) — module restricted

### Tasks 23-24: Higher complexity tabs

- **23**: Equipamentos (nome, tipo select with specific equipment types)
- **24**: Checklists (nome, itens/conteúdo) — module restricted

### Task 25: Colaboradores (complex)

- CPF mask, email, cargo select, código, senha, 2FA checkbox
- Password strength validation

### Task 26: Modelos/Templates (complex)

- HTML/CSS textareas, dimensions, printer select, default checkbox
- Template categories and types

### Task 27: Materiais (most complex)

- Multi-step stepper, image upload, submaterials management
- Type-conditional fields, consigned materials, owner selection

## Execution Order

11 → 12 → 13 → 14-19 (batch) → 20-22 (batch) → 23-24 → 25 → 26 → 27
