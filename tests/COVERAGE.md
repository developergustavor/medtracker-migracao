# Medtracker v2 — Mapa de Cobertura de Testes

## Regra Absoluta

**Todo código deve ter testes automatizados correspondentes.**
Qualquer mudança em código existente DEVE atualizar os testes afetados.
Nenhum componente, tela ou funcionalidade pode existir sem cobertura.

## Estrutura de Testes

```
tests/
├── e2e/                              # Testes E2E (Playwright)
│   ├── helpers/
│   │   └── auth.ts                   # Helper de login reutilizável
│   ├── login.spec.ts                 # Fluxos de autenticação
│   ├── home.spec.ts                  # Página Home + métricas + cards
│   ├── cadastros.spec.ts             # CRUD de cadastros (14 entidades)
│   ├── entrada-de-materiais.spec.ts  # Entrada completa (form + materiais + conferência)
│   └── layout.spec.ts               # Sidebar, Topbar, BottomTabBar, SpotlightSearch
├── COVERAGE.md                       # Este documento
```

## Como Rodar

```bash
# Todos os testes
pnpm test

# Testes E2E
pnpm test:e2e

# Com interface visual
pnpm test:e2e:ui

# Com browser visível
pnpm test:e2e:headed

# Relatório HTML
pnpm test:report
```

## Cobertura por Arquivo de Teste

### login.spec.ts — Autenticação
| Cenário | Status |
|---------|--------|
| Login por código válido (gg, ff) | ✅ |
| Login por código inválido | ✅ |
| Login por código com 2FA (mt) | ✅ |
| Login por CPF + senha válidos | ✅ |
| Login por CPF + senha inválidos | ✅ |
| Login por CME válido | ✅ |
| 2FA — 5 campos OTP | ✅ |
| 2FA — código correto (12345) | ✅ |
| 2FA — botão voltar | ✅ |
| Guard — redirecionar não autenticado para /login | ✅ |
| Guard — redirecionar / para /home | ✅ |
| Guard — 404 para rota inexistente | ✅ |
| Troca entre 4 abas de login | ✅ |

### home.spec.ts — Página Home
| Cenário | Status |
|---------|--------|
| Saudação com nome do usuário | ✅ |
| Data formatada (desktop) | ✅ |
| 4 cards de métricas com valores | ✅ |
| Indicadores de tendência (+/-) | ✅ |
| Banner de novidades | ✅ |
| 5 cards de workflow | ✅ |
| Navegação via card de workflow | ✅ |
| Imagens nos cards (desktop) | ✅ |
| Botões ações rápidas (Dashboard, Cadastros, Relatórios) | ✅ |
| Navegação via ação rápida | ✅ |
| Botão helpdesk flutuante | ✅ |
| Mobile — saudação sem data | ✅ |
| Mobile — métricas 2 colunas | ✅ |
| Mobile — cards sem imagens | ✅ |
| Mobile — bottom tab bar | ✅ |

### cadastros.spec.ts — CRUD de Cadastros
| Cenário | Status |
|---------|--------|
| Sidebar de entidades com contagem | ✅ |
| Navegação entre abas | ✅ |
| Aba ativa destacada | ✅ |
| DataTable com materiais | ✅ |
| Busca/filtro com debounce | ✅ |
| Limpar busca | ✅ |
| Formulário de criação | ✅ |
| Validação de campos obrigatórios | ✅ |
| Formulário de edição | ✅ |
| Dialog de confirmação de exclusão | ✅ |
| Cancelar exclusão | ✅ |
| Selects populados em Materiais | ✅ |
| Navegação entre entidades com dados | ✅ |
| Reset de form ao trocar aba | ✅ |
| Mobile — pills horizontais | ✅ |
| Mobile — busca | ✅ |

### entrada-de-materiais.spec.ts — Entrada de Materiais
| Cenário | Status |
|---------|--------|
| Acesso via URL direta | ✅ |
| Breadcrumb "Entrada de Materiais" | ✅ |
| Ações contextuais (Nova Entrada, Gerar Relatório) | ✅ |
| Badges de progresso (6 campos) | ✅ |
| Campo Setor ao selecionar Interna | ✅ |
| Campo CME Origem ao selecionar Externa | ✅ |
| Tipo Terceiro desabilitado sem terceiro | ✅ |
| Botões "+ Criar" (3 entidades) | ✅ |
| Campos Data/Hora procedimento | ✅ |
| Bloqueio da área sem form preenchido | ✅ |
| Desbloqueio após preencher tipo + setor | ✅ |
| Adicionar KIT por código | ✅ |
| Adicionar AVULSO por código | ✅ |
| Adicionar por busca de nome | ✅ |
| Contagem no footer | ✅ |
| Limpar input após adição | ✅ |
| Travar campos após adicionar material | ✅ |
| Card KIT — accordion de submateriais | ✅ |
| Card KIT — progress bar de conferência | ✅ |
| Card KIT — botão Conferir | ✅ |
| Card AVULSO — controle de quantidade | ✅ |
| Remover material com confirmação | ✅ |
| Conferência — abrir painel | ✅ |
| Conferência — listar submateriais | ✅ |
| Conferência — badges PENDENTE | ✅ |
| Conferência — contagem de faltantes | ✅ |
| Conferência — scan por código | ✅ |
| Conferência — progress bar | ✅ |
| Conferência — fechar painel | ✅ |
| AuthModal — abrir ao registrar | ✅ |
| AuthModal — erro com código inválido | ✅ |
| AuthModal — registrar com código válido | ✅ |
| AuthModal — checkbox "Lembrar de mim" | ✅ |
| AuthModal — pular auth com "Lembrar" ativo | ✅ |
| AuthModal — fechar ao cancelar | ✅ |
| CreateInlineDrawer — abrir para Médico | ✅ |
| CreateInlineDrawer — criar e auto-selecionar | ✅ |
| CreateInlineDrawer — abrir para Paciente | ✅ |
| CreateInlineDrawer — abrir para Terceiro | ✅ |
| CreateInlineDrawer — campo Tipo no Terceiro | ✅ |
| CreateInlineDrawer — validar Nome obrigatório | ✅ |
| CreateInlineDrawer — fechar ao cancelar | ✅ |
| Dialog de imagens — abrir | ✅ |
| Dialog de imagens — botão Adicionar Foto | ✅ |
| Dialog de imagens — mensagem sem imagens | ✅ |
| Relatório — abrir via botão | ✅ |
| Relatório — abrir via ação contextual | ✅ |
| Relatório — fechar | ✅ |
| Nova Entrada — recarregar página | ✅ |
| Golden path completo | ✅ |
| Mobile — accordion colapsável | ✅ |
| Mobile — auto-colapsar ao validar form | ✅ |
| Mobile — adicionar material | ✅ |

### layout.spec.ts — Layout e Navegação
| Cenário | Status |
|---------|--------|
| Sidebar visível no desktop | ✅ |
| Logo na sidebar | ✅ |
| Avatar do usuário na sidebar | ✅ |
| Ícones de navegação na sidebar | ✅ |
| Breadcrumbs com Home | ✅ |
| Breadcrumb da página atual | ✅ |
| Trigger de busca Ctrl+K | ✅ |
| Seletor de CME | ✅ |
| Badge de notificações | ✅ |
| SpotlightSearch — abrir via click | ✅ |
| SpotlightSearch — abrir via Ctrl+K | ✅ |
| SpotlightSearch — fechar com Escape | ✅ |
| Popover do seletor de CME | ✅ |
| Navegação Home ↔ Cadastros | ✅ |
| Navegação Home ↔ Entrada | ✅ |
| Mobile — BottomTabBar visível | ✅ |
| Mobile — navegação por tabs | ✅ |
| Mobile — botão Tools | ✅ |
| Mobile — sem sidebar | ✅ |
| Mobile — sem topbar | ✅ |

## Próximos Testes (quando telas forem implementadas)

| Tela/Feature | Arquivo de Teste |
|-------------|-----------------|
| Ciclos (Desinfecção) | ciclos-desinfeccao.spec.ts |
| Ciclos (Esterilização) | ciclos-esterilizacao.spec.ts |
| Saída de Materiais | saida-de-materiais.spec.ts |
| Conferência (Centro Cirúrgico) | conferencia.spec.ts |
| Dashboard | dashboard.spec.ts |
| Relatórios | relatorios.spec.ts |
| Gerenciamento | gerenciamento.spec.ts |
| Impressão de Etiquetas | impressao-etiquetas.spec.ts |
| Configurações | configuracoes.spec.ts |
| Recuperação de senha | recuperacao-senha.spec.ts |
| Alteração de senha | alteracao-senha.spec.ts |
| Páginas de erro (401/403/500) | error-pages.spec.ts |
