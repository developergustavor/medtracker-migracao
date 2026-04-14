# Entrada de Materiais v2 — Design Spec

## 1. Visao Geral

Tela de registro de entrada de materiais na CME. Recebe materiais de setores internos ou CMEs externas, permite conferencia de submateriais (KITs), registro com autenticacao por item, e geracao de relatorio.

Migracao da v1 (Nuxt 3/Vue 3/Vuetify 3) para v2 (React/Vite/Tailwind/shadcn) com melhorias de UX.

---

## 2. Layout

### 2.1 Desktop (lgAndUp >= 1024px)

Split horizontal:
- **Esquerda (320px fixo)**: Form de metadados da entrada
- **Direita (flex-1)**: Area de materiais (scan + lista + acoes)

### 2.2 Tablet/Mobile (< 1024px)

Form colapsa em accordion no topo. Area de materiais ocupa tela inteira.

---

## 3. Form de Metadados (painel esquerdo)

### 3.1 Badges de Progresso

Strip horizontal no topo do form mostrando status de cada campo:
- Verde (check): campo preenchido
- Cinza (circulo): campo vazio
- Campos: Tipo, Setor/CME, Medico, Paciente, Procedimento, Terceiro

### 3.2 Campos

| Campo | Tipo | Obrigatorio | Notas |
|-------|------|-------------|-------|
| Tipo | Select | Sim | INTERNA / EXTERNA. Lock apos primeiro material adicionado |
| Setor | Select | Sim (se INTERNA) | Departamentos ativos da CME |
| CME Origem | Select | Sim (se EXTERNA) | CMEs externas |
| Medico | Combobox + Criar | Nao | Busca + botao "+ Criar" abre drawer lateral |
| Paciente | Combobox + Criar | Nao | Busca + botao "+ Criar" abre drawer lateral |
| Data Procedimento | Masked (DD/MM/AAAA) | Condicional | Obrigatorio se Hora preenchida |
| Hora Procedimento | Masked (HH:MM) | Condicional | Obrigatorio se Data preenchida |
| Terceiro | Combobox + Criar | Nao | Busca + botao "+ Criar" abre drawer lateral |
| Tipo Terceiro | Select | Condicional | Visivel/habilitado apenas se Terceiro selecionado. Valores: MEDICO, EMPRESA |

### 3.3 Bloqueio de Edicao

Apos primeiro material adicionado: Tipo e Setor/CME ficam desabilitados (lock visual).

### 3.4 Drawer Lateral para Criar Inline

Ao clicar "+ Criar" em Medico, Paciente ou Terceiro:
- Abre sheet/drawer lateral direito
- Form completo do respectivo cadastro (reusar schemas/fields do cadastros.forms.ts)
- Ao salvar: fecha drawer, seleciona automaticamente o item criado no combobox
- Ao cancelar: fecha drawer sem alteracao

---

## 4. Area de Materiais (painel direito)

### 4.1 Bloqueio Inicial

Area inteiramente bloqueada (opacity + overlay) ate que Tipo e Setor/CME estejam preenchidos.

### 4.2 Scan Bar

- Input proeminente com borda primary, auto-focus
- Placeholder: "Bipar codigo ou buscar material..."
- Botao "+" ao lado para busca/adicao manual
- Ao bipar codigo: busca material nos mocks, adiciona a lista
- Se codigo nao encontrado: abre modal de busca por nome

### 4.3 Lista de Materiais

Cards empilhados verticalmente. Cada card mostra:

**Material KIT:**
- Foto (thumbnail 44px) + Nome + badge "KIT" (primary) + codigo + embalagem
- Progress bar de conferencia (X/Y) com badge numerico
- Botoes: Conferir, Imagens, Registrar, Remover
- Accordion de submateriais (altura fixa ~120px, scroll, grid multi-col dependendo do breakpoint):
  - Cada submaterial: icone status (check verde ou circulo amarelo) + nome + contagem (X/Y)

**Material AVULSO/QUANTIDADE:**
- Foto + Nome + badge tipo (cinza) + codigo + embalagem
- Input de quantidade (-/+)
- Botoes: Imagens, Registrar, Remover

**Material REGISTRADO:**
- Card com borda verde, fundo verde sutil, opacidade reduzida
- Badge "REGISTRADO" verde
- Info: "Registrado por [nome] · [hora]"
- Botoes desabilitados exceto visualizar

### 4.4 Acoes por Material

| Acao | Condicao | Comportamento |
|------|----------|---------------|
| Conferir | Apenas KIT + modulo COMPLETO | Abre componente de conferencia de submateriais (spec separada) |
| Imagens | Sempre | Adicionar/ver fotos de evidencia (base64, ate 3 por material) |
| Registrar | Nao registrado ainda | Abre AuthModal com credencial + "Lembrar de mim". Apos auth, marca como registrado |
| Remover | Nao registrado ainda | ConfirmDialog. Remove da lista |

### 4.5 Footer

- Esquerda: contagem "X materiais · Y registrados"
- Direita: botao "Relatorio" (TODO placeholder — dialog com preview + export/download/print)

---

## 5. Componente de Conferencia de Submateriais

Componente reutilizavel: `MaterialCheckPanel`

### 5.1 Estrutura

1. **Scan bar** (topo): input auto-focus com borda primary + progress bar gradient (X/Y)
2. **Highlight strip** (bg primary-7): contagem de faltantes + ultimo conferido (foto + nome, cores primary)
3. **Grid de submateriais**: multi-coluna responsivo (3 cols lg, 2 cols md, 1 col mobile)
4. **Separador**: linha verde com label "Conferidos (N)"
5. **Secao conferidos**: cards verdes com opacity reduzida + drop zone para drag

### 5.2 Card de Submaterial

- Thumbnail 52x52 (foto ou placeholder)
- Nome + codigo
- Badge quantitativo: "X/Y" com cores por status:
  - Pendente (0/Y): amarelo
  - Parcial (X/Y onde X < Y): laranja
  - Completo (Y/Y): verde
- Status label: PENDENTE / PARCIAL / COMPLETO

### 5.3 Ordenacao

Pendentes primeiro → Parciais → Separador → Conferidos

### 5.4 Interacoes

| Acao | Resultado |
|------|-----------|
| Hover | border-primary |
| 1x click | border-primary border-2 + tip animado: "Arraste para Conferidos · 2x para visualizar" |
| 2x click | Abre MaterialPreview (TODO: componente reutilizavel) |
| Drag para Conferidos | Marca como conferido (+1 na contagem), card move para secao verde |
| Drag de Conferido para cima | Volta para pendente (-1 na contagem) |
| Scan (bipar codigo) | Auto-confere o submaterial correspondente, beep sonoro |

### 5.5 Drop Zone

Dentro da secao de conferidos (abaixo do separador verde). Borda dashed verde, visivel apenas durante drag.

### 5.6 Reutilizacao

Este componente sera usado em:
- Entrada de Materiais (area = ENTRADA)
- Potencialmente: Saida de Materiais, Conferencia CC

---

## 6. Auth Modal (Registrar Material)

- Dialog com input de credencial (codigo ou CPF + senha)
- Toggle "Lembrar de mim" — se ativo, nao pede auth nos proximos registros da mesma sessao
- Apos autenticacao: material marcado como registrado, card vira verde
- Cada material exige auth individual (a menos que "Lembrar" esteja ativo)

---

## 7. Relatorio

**TODO — placeholder por hora.**

Intencao futura:
- Dialog com preview visual rico (tabela, resumo, badges)
- Botoes: exportar PDF, imprimir, copiar
- Nuances de impressao (originalmente Electron) a resolver

---

## 8. Acoes Contextuais (ContextualBar)

Ja definidas em routes.constants.ts:
- "Nova Entrada" (icon: Add, position: start, variant: primary) — reseta form
- "Gerar Relatorio" (icon: DocumentText, position: center) — abre dialog relatorio

---

## 9. Roles e Modulos

- **Roles permitidos**: todos (DEV, ADMINISTRADOR, COLABORADOR_CHEFE, REPRESENTANTE, COLABORADOR)
- **Modulos permitidos**: ETIQUETAGEM, COMPLETO (nao IMPRESSAO)
- Conferencia de submateriais: apenas modulo COMPLETO + material KIT

---

## 10. TODOs

1. **MaterialPreview** — componente dialog/sheet para visualizar material completo (foto, dados, submateriais). Reutilizar no double-click da conferencia e no CRUD de materiais (tabela + botao "Visualizar")
2. **Relatorio** — dialog com preview + export. Placeholder por hora (nuances Electron)
3. **Auth Modal** — componente de autenticacao por item com "Lembrar de mim"
4. **Mobile layout** — form colapsa em accordion, materiais ocupam tela inteira
5. **Botao Visualizar no CRUD** — adicionar na DataTable de materiais + double-click na row

---

## 11. Dados Mock

Criar em `src/mock/data/entrada.mock.ts`:
- `mockEntries`: array de entradas com materiais, status, timestamps
- `mockEntryMaterials`: materiais dentro de entradas
- Reusar `mockMaterials`, `mockSubmaterials`, `mockDepartments`, `mockDoctors`, `mockPatients`, `mockOwners` existentes

Criar em `src/mock/handlers/entrada.handlers.ts`:
- GET `entry_records_page`: listar entradas
- POST `material_entry`: registrar material na entrada
- POST `material_entry_image`: upload de imagem

---

## 12. Arquivos a Criar/Modificar

### Novos:
- `src/pages/entrada/Entrada.tsx` — pagina principal
- `src/pages/entrada/EntradaForm.tsx` — form de metadados (painel esquerdo)
- `src/pages/entrada/EntradaMaterialCard.tsx` — card de material na lista
- `src/pages/entrada/EntradaMaterialList.tsx` — lista de materiais (painel direito)
- `src/pages/entrada/index.ts` — barrel
- `src/components/domain/MaterialCheckPanel.tsx` — conferencia de submateriais (reutilizavel)
- `src/components/domain/AuthModal.tsx` — autenticacao por item (reutilizavel)
- `src/components/domain/CreateInlineDrawer.tsx` — drawer lateral para criar medico/paciente/terceiro
- `src/mock/data/entrada.mock.ts` — mock data
- `src/mock/handlers/entrada.handlers.ts` — MSW handlers
- `src/entities/entries/entries.types.ts` — tipos
- `src/entities/entries/entries.schemas.ts` — schemas Zod
- `src/entities/entries/entries.enums.ts` — enums (entry_status, entry_type)
- `src/entities/entries/index.ts` — barrel

### Modificar:
- `src/App.tsx` — adicionar LazyEntrada no PAGE_MAP
- `src/mock/data/index.ts` — exportar novos mocks
- `src/components/domain/index.ts` — exportar novos componentes
- `src/entities/index.ts` — exportar novos tipos
