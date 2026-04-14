# PRD: Entrada de Materiais v2

## Introduction

Tela de registro de entrada de materiais na CME (Central de Material e Esterilizacao). Permite receber materiais de setores internos ou CMEs externas, conferir submateriais de KITs via scan de codigo de barras, registrar com autenticacao por item, e gerar relatorio. Migracao da v1 com melhorias significativas de UX.

## Goals

- Reproduzir 100% das funcionalidades ativas da v1 de Entrada de Materiais
- Layout split: form de metadados fixo a esquerda + area de materiais a direita
- Componente de conferencia de submateriais reutilizavel com drag & drop, scan, multi-coluna
- Autenticacao por material com opcao "Lembrar de mim"
- Criacao inline de medico/paciente/terceiro via drawer lateral
- Dados 100% mockados (sem backend)

## User Stories

### US-001: Setup da pagina e roteamento
**Description:** Como desenvolvedor, preciso da estrutura base da pagina de Entrada de Materiais integrada ao sistema de rotas.

**Acceptance Criteria:**
- [ ] Pagina `Entrada.tsx` criada em `src/pages/entrada/`
- [ ] Registrada no PAGE_MAP do App.tsx com lazy loading
- [ ] Rota `/entrada-de-materiais` funciona e renderiza a pagina
- [ ] ContextualBar mostra acoes "Nova Entrada" e "Gerar Relatorio"
- [ ] Eventos de contextual-action tratados na pagina
- [ ] Typecheck passa

### US-002: Tipos, schemas e mock data
**Description:** Como desenvolvedor, preciso dos tipos, schemas Zod e dados mock para a entidade de Entrada.

**Acceptance Criteria:**
- [ ] Tipos: IEntry, IEntryMaterial, entry_status, entry_type em `src/entities/entries/`
- [ ] Schemas Zod para validacao do form de metadados
- [ ] Mock data em `src/mock/data/entrada.mock.ts` com entradas realistas
- [ ] MSW handlers em `src/mock/handlers/entrada.handlers.ts` (GET/POST stubs)
- [ ] Exports no barrel de entities e mock/data
- [ ] Typecheck passa

### US-003: Form de metadados (painel esquerdo)
**Description:** Como operador, quero preencher os dados da entrada (tipo, setor, medico, paciente, etc.) para contextualizar os materiais que serao registrados.

**Acceptance Criteria:**
- [ ] Painel esquerdo fixo com 320px de largura
- [ ] Badges de progresso no topo (verde/cinza) refletindo campos preenchidos
- [ ] Select de Tipo (INTERNA/EXTERNA) muda campo destino (Setor vs CME)
- [ ] Comboboxes com busca para Medico, Paciente, Terceiro
- [ ] Inputs mascarados para Data (DD/MM/AAAA) e Hora (HH:MM) acoplados
- [ ] Tipo Terceiro condicional (habilitado apenas com Terceiro selecionado)
- [ ] Tipo e Setor/CME travam apos primeiro material adicionado
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-004: Drawer lateral para criar inline
**Description:** Como operador, quero criar um medico/paciente/terceiro sem sair da tela de entrada, para nao perder meu contexto de trabalho.

**Acceptance Criteria:**
- [ ] Componente `CreateInlineDrawer` reutilizavel
- [ ] Botao "+ Criar" nos comboboxes de Medico, Paciente e Terceiro
- [ ] Drawer lateral direito com form completo do respectivo cadastro
- [ ] Reusar schemas e fields de `cadastros.forms.ts`
- [ ] Ao salvar: fecha drawer, seleciona item criado no combobox automaticamente
- [ ] Ao cancelar: fecha sem alteracao
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-005: Area de materiais e scan bar
**Description:** Como operador, quero bipar ou buscar materiais para adiciona-los a entrada.

**Acceptance Criteria:**
- [ ] Area de materiais bloqueada ate Tipo + Setor/CME preenchidos (overlay + opacity)
- [ ] Scan bar com auto-focus, borda primary, placeholder descritivo
- [ ] Botao "+" para busca/adicao manual
- [ ] Bipar codigo: busca material nos mocks, adiciona a lista
- [ ] Codigo nao encontrado: abre dialog de busca por nome
- [ ] Material adicionado aparece como card na lista
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-006: Cards de material na lista
**Description:** Como operador, quero ver os materiais adicionados com informacoes claras e acoes disponiveis.

**Acceptance Criteria:**
- [ ] Card KIT: foto, nome, badge "KIT" primary, codigo, embalagem, progress bar conferencia (X/Y), botoes (Conferir, Imagens, Registrar, Remover), accordion de submateriais (multi-col, scroll, altura fixa ~120px)
- [ ] Card AVULSO/QTD: foto, nome, badge tipo cinza, input quantidade (-/+), botoes (Imagens, Registrar, Remover)
- [ ] Card REGISTRADO: borda verde, fundo verde sutil, opacity reduzida, info "Registrado por [nome] · [hora]", acoes desabilitadas
- [ ] Footer com contagem "X materiais · Y registrados" + botao Relatorio
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-007: Componente de conferencia de submateriais
**Description:** Como operador, quero conferir os submateriais de um KIT bipando codigos ou arrastando cards, vendo progresso visual em tempo real.

**Acceptance Criteria:**
- [ ] Componente `MaterialCheckPanel` reutilizavel em `src/components/domain/`
- [ ] Scan bar auto-focus + progress bar gradient (X/Y) no topo
- [ ] Highlight strip (bg primary-7): contagem faltantes + ultimo conferido (cores primary, foto + nome)
- [ ] Grid responsivo: 3 cols (lg), 2 cols (md), 1 col (mobile)
- [ ] Cards com thumbnail 52x52, nome, codigo, badge quantitativo (0/1, 1/3, 2/2)
- [ ] Ordenacao: Pendentes → Parciais → Separador verde → Conferidos
- [ ] Hover: border-primary. 1x click: border-primary border-2 + tip animado. 2x click: TODO MaterialPreview
- [ ] Drag & drop bilateral: pendente → conferidos (drop zone dentro da secao conferidos) e conferido → pendente
- [ ] Scan (bipar): auto-confere submaterial + beep sonoro
- [ ] Conferidos com opacity reduzida
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-008: Auth modal para registrar material
**Description:** Como operador, quero autenticar minha identidade ao registrar cada material, com opcao de lembrar para nao repetir a cada item.

**Acceptance Criteria:**
- [ ] Componente `AuthModal` reutilizavel em `src/components/domain/`
- [ ] Dialog com input de credencial (codigo ou CPF + senha)
- [ ] Toggle "Lembrar de mim" — se ativo, pula auth nos proximos registros da sessao
- [ ] Apos auth: material marcado como registrado, card muda para estado verde
- [ ] Mock: aceitar qualquer credencial valida dos mockUsers
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-009: Imagens de material
**Description:** Como operador, quero adicionar fotos de evidencia a cada material da entrada.

**Acceptance Criteria:**
- [ ] Botao "Imagens" no card do material
- [ ] Dialog/sheet para adicionar fotos (file input + camera mobile)
- [ ] Ate 3 imagens por material (base64)
- [ ] Visualizacao das imagens ja adicionadas com opcao de remover
- [ ] Badge de contagem de imagens no botao
- [ ] Typecheck passa
- [ ] Verificar no browser

### US-010: Relatorio placeholder
**Description:** Como operador, quero acessar o relatorio da entrada (placeholder para implementacao futura).

**Acceptance Criteria:**
- [ ] Botao "Relatorio" no footer da area de materiais
- [ ] Abre dialog com mensagem placeholder "Relatorio em desenvolvimento"
- [ ] TODO sinalizado no codigo para implementacao futura (preview + export/download/print)
- [ ] Typecheck passa

### US-011: Mobile layout
**Description:** Como operador mobile, quero usar a tela de entrada adaptada ao meu dispositivo.

**Acceptance Criteria:**
- [ ] Form de metadados colapsa em accordion no topo (< 1024px)
- [ ] Area de materiais ocupa tela inteira
- [ ] Scan bar funcional em mobile
- [ ] Cards de material responsivos
- [ ] Conferencia de submateriais: 1 coluna em mobile
- [ ] Typecheck passa
- [ ] Verificar no browser em viewport mobile

## Functional Requirements

- FR-1: Pagina acessivel em `/entrada-de-materiais` para todos os roles, modulos ETIQUETAGEM e COMPLETO
- FR-2: Form de metadados com validacao Zod, campos condicionais, e lock apos adicao de material
- FR-3: Comboboxes de Medico/Paciente/Terceiro com busca e criacao inline via drawer lateral
- FR-4: Scan bar com auto-focus para bipar codigos de barras (input como teclado)
- FR-5: Lista de materiais com cards diferenciados por tipo (KIT, AVULSO, QUANTIDADE)
- FR-6: KITs mostram accordion de submateriais com grid multi-coluna e status por item
- FR-7: Conferencia de submateriais via componente reutilizavel com drag & drop bilateral, scan, e progresso visual
- FR-8: Autenticacao por material via AuthModal com opcao "Lembrar de mim"
- FR-9: Upload de ate 3 imagens por material (base64)
- FR-10: Relatorio placeholder com TODO para implementacao futura
- FR-11: Acoes contextuais "Nova Entrada" (reset) e "Gerar Relatorio" via ContextualBar
- FR-12: Layout responsivo: split desktop, accordion mobile

## Non-Goals

- Backend real / API calls (tudo mock)
- Geracao de PDF real (placeholder)
- Impressao via Electron
- Persistencia entre sessoes (state local apenas)
- Features desabilitadas da v1 (consultar material tool, ocorrencias tool, retorno)

## Design Considerations

- Spec visual detalhada em `docs/superpowers/specs/2026-04-14-entrada-de-materiais-design.md`
- Mockups interativos em `.superpowers/brainstorm/` (conferencia v4, layout entrada)
- Reusar componentes existentes: DataTable, ConfirmDialog, StatusBadge, shadcn Select/Input/Dialog
- Reusar schemas e forms de `cadastros.forms.ts` no drawer de criacao inline
- Tokens e cores do igreen-design + primary Medtracker

## Technical Considerations

- `MaterialCheckPanel` deve ser componente isolado em `src/components/domain/` para reuso em Saida e Conferencia
- `AuthModal` deve ser componente isolado para reuso em qualquer tela que exija auth por acao
- `CreateInlineDrawer` deve aceitar entity type como prop para renderizar form correto
- Drag & drop: usar HTML5 drag API ou lib leve (dnd-kit)
- Beep sonoro: Web Audio API ou `<audio>` element
- State local via useState (sem store dedicado — nao persiste entre navegacao)

## Success Metrics

- Operador consegue completar fluxo completo: preencher form → bipar materiais → conferir KIT → registrar → ver resumo
- Conferencia de submateriais funciona tanto por scan quanto por drag & drop
- Criacao inline de medico/paciente/terceiro nao perde contexto do form
- Layout responsivo funciona em desktop, tablet e mobile

## Open Questions

1. Relatorio: qual formato final de export quando sairmos do Electron? (PDF via browser, HTML print, outro?)
2. MaterialPreview: qual nivel de detalhe mostrar? (TODO componente)
3. Beep sonoro: usar arquivo .mp3 ou sintetizar via Web Audio API?
