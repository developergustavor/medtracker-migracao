# Medtracker Etiquetagem v2 — Frontend Design Spec

## 1. Visao Geral

**Projeto**: Migracao e modernizacao do frontend do Medtracker Etiquetagem (v1 Nuxt 3/Vue 3/Vuetify 3) para v2 (React/Vite/Tailwind/shadcn).

**Objetivo**: Reproduzir 100% das funcionalidades ativas da v1 com UX/UI modernizada, performance extrema, dark mode, e design system profissional.

**Escopo ativo**: Frontend (`web/`) — tela por tela, componente por componente, validado individualmente.

**Escopo bloqueado**: Backend, banco de dados, CI/CD, infraestrutura.

---

## 2. Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Framework | React (ultima estavel) |
| Build | Vite (ultima estavel) |
| Linguagem | TypeScript (strict: true, noImplicitAny, strictNullChecks, noUnusedLocals, noUnusedParameters) |
| Estilizacao | Tailwind CSS + tokens copiados do igreen-design |
| Componentes UI | shadcn/ui + componentes copiados do igreen-design |
| Icones | Iconsax (iconsax-react, SVG, variantes: Linear/Bold/Outline/Broken/Bulk/TwoTone) |
| Estado global | Zustand (persist middleware) |
| Validacao | Zod v4+ |
| HTTP | Axios (com interceptors) |
| Formularios | React Hook Form + @hookform/resolvers |
| Animacoes | Framer Motion / Motion |
| Roteamento | React Router DOM |
| Testes E2E | Playwright |
| Dados | Mock local (MSW ou adapter pattern) |
| Gerenciador | pnpm |

---

## 3. Paleta de Cores

**Decisao**: Paleta Medtracker Azul adaptada sobre tokens igreen-design.

### Primary (unica customizacao)

| Token | Light | Dark |
|-------|-------|------|
| `--primary` | `#2155FC` | `#4B7BFF` |
| `--primary-fg` | `#ffffff` | `#ffffff` |
| `--primary-7` | `rgba(33,85,252,0.07)` | `rgba(75,123,255,0.07)` |
| `--primary-8` | `rgba(33,85,252,0.08)` | `rgba(75,123,255,0.08)` |
| `--primary-10` | `rgba(33,85,252,0.10)` | `rgba(75,123,255,0.10)` |
| `--primary-12` | `rgba(33,85,252,0.12)` | `rgba(75,123,255,0.12)` |
| `--primary-15` | `rgba(33,85,252,0.15)` | `rgba(75,123,255,0.15)` |
| `--primary-20` | `rgba(33,85,252,0.20)` | `rgba(75,123,255,0.20)` |
| `--primary-70` | `rgba(33,85,252,0.70)` | `rgba(75,123,255,0.70)` |

### Status (inalterados do igreen-design)

| Token | Light | Dark |
|-------|-------|------|
| `--destructive` | `#dc2626` | `#ef4444` |
| `--warning` | `#d97706` | `#f6b51e` |
| `--info` | `#7c3aed` | `#8754ec` |

### Surfaces, foreground, border, spacing, radius, typography, shadows, transitions

Todos copiados integralmente do igreen-design sem alteracao.

---

## 4. Temas

**Dark mode desde o dia 1**. Todos os componentes nascem com suporte a light/dark.

- Toggle de tema no menu do usuario (desktop: sidebar footer / mobile: Tools sheet)
- Persistido em Zustand com localStorage
- Classe `.dark` no `<html>` (padrao Tailwind)
- Tokens CSS variaveis mudam por tema

---

## 5. Layout e Navegacao

### 5.1 Desktop/Tablet (breakpoint mdAndUp: >= 768px)

**Modelo aprovado: F — Hibrido Overlay + Push**

#### Sidebar principal (248px expandida / 68px colapsada)
- Logo Medtracker + nome no topo
- Botao toggle para colapsar/expandir
- Itens de navegacao com icones Iconsax + label
- Rotas com subrotas mostram seta `>` indicando sub-sidebar
- Footer: avatar + nome + role + toggle tema
- Scrollavel se necessario

#### Sub-sidebar (comportamento hibrido)
- **Sidebar expandida**: sub-sidebar abre como **overlay** (flutuante, shadow, nao empurra conteudo)
- **Sidebar colapsada**: sub-sidebar faz **push** (substitui espaco ao lado dos icones)
- Fecha ao: clicar fora (overlay), selecionar subrota, ou clicar X
- Contem: titulo do grupo + lista de subrotas + campo filtro (para Cadastros com 14 itens)

#### Topbar principal (56px, sticky)
- Background: glass effect (backdrop-filter blur)
- Esquerda: breadcrumb (Home / Pagina / Subpagina)
- Direita: input busca (abre Spotlight), seletor CME (dropdown), avatar usuario

#### Topbar secundaria (44px, contextual)
- Aparece apenas em rotas que tem acoes rapidas
- Layout com 3 grupos: start (acao primaria) | center (ferramentas) | end (filtros)
- Itens: icone Iconsax + label, clicavel
- Em telas menores onde itens nao cabem: overflow vira botao "..." que abre bottom sheet com as acoes

#### Busca Spotlight
- Trigger: click no input de busca ou Ctrl+K / Cmd+K
- Dialog full-screen com backdrop blur (estilo macOS Spotlight)
- Input centralizado no topo
- Autocomplete categorizado ao digitar (Materiais, Paginas, Acoes)
- Highlight do termo buscado nos resultados
- Enter: resultados em grid com scroll-y
- Navegacao: setas cima/baixo, Enter para abrir, ESC para fechar

### 5.2 Mobile (breakpoint smAndDown: < 768px)

**Modelo aprovado: I refinado — Bottom Tab Bar + Tools Sheet**

#### Sem topbar principal
- Mobile nao tem topbar fixa — conteudo comeca direto
- Titulo da pagina renderizado no body

#### Topbar secundaria (contextual, 44px)
- Aparece apenas em rotas com acoes
- Mesmos 3 grupos (start/center/end) do desktop
- Overflow: botao "..." abre bottom sheet

#### Bottom Tab Bar (64px, fixa no rodape)
- Icone Tools centralizado em absolute (elevado, background primary, border-radius 16px, box-shadow)
- **4 itens dinamicos por role**:

| Slot | ADMIN/CHEFE/REP | COLABORADOR |
|------|-----------------|-------------|
| 1 | Home | Home |
| 2 | Dashboard | Entradas |
| Centro | **Tools** | **Tools** |
| 3 | Cadastros | Ciclos |
| 4 | Ciclos | Saidas |

#### Tools Sheet (bottom sheet, max-height ~88vh)
- Trigger: tap no icone Tools
- Conteudo:
  1. Input de busca (abre Spotlight ao clicar)
  2. Seletor CME ativa (card com nome, modulo, status)
  3. Grid de navegacao (6 itens: Dashboard, Cadastros, Relatorios, Config, Gerenciar, Manual)
  4. Secao Conta (perfil, alterar senha, sair)
- Toggle tema tambem disponivel aqui

#### Bottom Sheet para subrotas
- Ao clicar em rota com subrotas (ex: Cadastros na tab bar ou na Tools sheet)
- Bottom sheet com: input filtro + lista de subrotas com icones
- Scroll-y se necessario

#### Spotlight mobile
- Mesmo comportamento do desktop mas adaptado
- Full-screen com blur, input no topo, autocomplete categorizado
- Bottom sheet para resultados com grid e scroll-y (max-height quase full screen)

---

## 6. Breakpoints

Seguem obrigatoriamente o tailwind.config do CLAUDE.md:

| Nome | Range |
|------|-------|
| xxxxs | 0 - 280px |
| xxxs | 281 - 375px |
| xxs | 376 - 430px |
| xs | 431 - 639px |
| sm | 640 - 767px |
| md | 768 - 1023px |
| lg | 1024 - 1279px |
| xl | 1280 - 1535px |
| 2xl | 1536px+ |

Cada breakpoint tem variantes `AndDown` e `AndUp` para queries compostas.

**Regras de responsividade**:
- **Mobile** (smAndDown, < 768px): Bottom tab bar, sem sidebar, tools sheet
- **Tablet** (md, 768-1023px): Sidebar colapsada por padrao, topbar dupla
- **Desktop** (lgAndUp, >= 1024px): Sidebar expandida por padrao, topbar dupla

---

## 7. Performance

**Requisito**: Sistema extremamente leve, rapido e performatico.

- **Componentizacao rigorosa**: Componentes pequenos e focados, evitar re-renders
- **React.memo**: Em componentes puros que recebem mesmas props
- **useMemo / useCallback**: Para calculos caros e callbacks passados como props
- **Lazy loading**: `React.lazy()` + `Suspense` para todas as rotas/paginas
- **Code splitting**: Por rota (Vite automatic chunk splitting)
- **Virtualizacao**: Para listas longas (Cadastros com 14 abas, tabelas paginadas)
- **Debounce**: Em inputs de busca e filtros
- **Otimizacao de imagens**: Lazy loading, formato WebP quando possivel
- **Zero dependencias desnecessarias**: Cada pacote justificado

---

## 8. Icones

**Biblioteca**: Iconsax (iconsax-react)
- Site: https://iconsax.io/
- App de busca: https://app.iconsax.io/
- Docs: https://docs.iconsax.io/
- NPM: `iconsax-react` (v0.0.8)

**Variantes disponiveis**: Linear, Bold, Outline, Broken, Bulk, TwoTone
**Uso padrao**: Linear para navegacao e UI geral, Bold para estados ativos
**Props**: `size`, `color`, `variant`

---

## 9. Dados Mockados

- Camada de mock completa e realista simulando todas as respostas do backend
- Dados de dominio medico (materiais esterilizaveis, ciclos, CMEs)
- Pattern adapter: `@/services` consume mocks da mesma forma que consumira API real
- Troca de mock para API real = mudanca minima (trocar adapter, nao reescrever logica)
- Considerar MSW (Mock Service Worker) para interceptar fetch/axios

---

## 10. Camadas de Construcao (Ordem de Dependencia)

### Camada 0 — Fundacao
1. Setup projeto (Vite + React + Tailwind + shadcn + pnpm)
2. Design system (tokens copiados do igreen-design + primary Medtracker adaptado)
3. Configuracao TypeScript estrito
4. Configuracao ESLint + Prettier + Husky + Commitlint
5. Mock layer (MSW + fixtures de dados)
6. Auth store (Zustand persist) + guards
7. Layout principal (sidebar + topbar + sub-sidebar + responsividade)
8. Bottom tab bar (mobile) + Tools sheet
9. Busca Spotlight
10. Login (3 abas: Codigo, CPF, CME + 2FA + Remember Me)

### Camada 1 — Dados Mestres
11. Cadastros — estrutura de abas + tabela generica
12. Cadastros — cada aba individualmente (14 abas)
13. Configuracoes (perfil CME, templates)

### Camada 2 — Workflows Operacionais
14. Entrada de Materiais
15. Ciclos — listagem (Desinfeccao + Esterilizacao)
16. Ciclos — detalhes (materiais, insumos, indicadores, ocorrencias)
17. Ciclos — finalizar + gerar etiqueta
18. Saida de Materiais
19. Conferencia (Centro Cirurgico) — stepper 3 steps
20. Impressao de Etiquetas

### Camada 3 — Analitico e Admin
21. Dashboard (KPIs + graficos + filtros)
22. Relatorios (3 abas)
23. Gerenciamento (CMEs + teste impressao + dashboard admin)
24. Dashboard CME

### Camada 4 — Telas Auxiliares
25. Recuperacao de senha
26. Alteracao de senha
27. Confirmacao de email
28. Paginas de erro (401, 403, 404, 500)
29. Manutencao

---

## 11. Features Desabilitadas (Backlog Futuro)

Nao entram na v2 inicial. Serao documentadas em `BACKLOG.md`:

| Feature | Descricao |
|---------|-----------|
| Consultar Material (tool) | Modal de busca rapida de material |
| Ocorrencias (tool) | Atalho para registrar ocorrencia |
| Retorno de Materiais (tool) | Tracking de retorno |
| Dashboard Colaborador | Dashboard especifico para role COLABORADOR |
| Consignados (impressao) | Secao de templates consignados |
| Identify Images (AI/ML) | Identificacao de materiais por camera com TensorFlow |

---

## 12. Regras de Qualidade

- **TypeScript**: strict: true, zero `any`, use `unknown` + type guards
- **ESLint**: Regras restritivas conforme CLAUDE.md
- **Prettier**: Semi false, single quotes, print width 300, arrow parens avoid
- **Commits**: Conventional commits (commitlint + husky)
- **Pre-commit hooks**: lint + type-check + testes afetados
- **Testes**: Playwright E2E para cada tela/componente

---

## 13. Metodologia de Trabalho

Para CADA unidade de trabalho (tela/componente):

1. **Analise** (superpowers): Analisar v1, identificar regras de negocio, propor melhorias
2. **Design** (ui-ux-pro-max + igreen-design): Definir interface, gerar preview para validacao
3. **Implementacao**: Codigo com stack definida, mock data, TypeScript estrito
4. **Testes**: Playwright E2E (happy path + edge cases)
5. **Validacao**: Apresentar resultado, aguardar OK explicito antes de avancar

**Regra absoluta**: Nenhuma tela/componente avanca sem aprovacao explicita do usuario.
