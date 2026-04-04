# Medtracker v2 — Backlog de Features Futuras

Features que existem no codigo da v1 mas estao desabilitadas/comentadas. Devem ser migradas em ciclos futuros apos a v2 inicial estar completa.

## Features Desabilitadas da v1

| # | Feature | Origem v1 | Descricao | Prioridade |
|---|---------|-----------|-----------|------------|
| 1 | Consultar Material (tool) | routes-util.ts:341-351 | Modal de busca rapida de material acessivel via toolbar (icone de lupa no header) | Media |
| 2 | Ocorrencias (tool) | routes-util.ts:352-362 | Atalho para registrar ocorrencia rapidamente via toolbar | Media |
| 3 | Retorno de Materiais (tool) | routes-util.ts:363-373 | Tracking de retorno de materiais via toolbar | Media |
| 4 | Dashboard Colaborador | routes-util.ts:411 | Dashboard especifico para o role COLABORADOR (diferente do dashboard admin) | Baixa |
| 5 | Consignados (impressao) | impressao-de-etiquetas.vue | Secao de templates para materiais consignados na tela de impressao | Media |
| 6 | Identify Images (AI/ML) | identify-images-form.vue | Identificacao de materiais por camera usando TensorFlow.js + MobileNet + COCO-SSD + KNN Classifier. Condicional ao setting useAI da CME | Baixa |
| 7 | Modo Manutencao | middleware/routes.global.ts:18-19 | Redirect global para pagina de manutencao (comentado) | Baixa |

## Notas

- Cada feature deve passar pelo mesmo fluxo de analise → design → implementacao → testes → validacao
- Prioridades sao preliminares e devem ser reavaliadas quando o backlog for ativado
- Features 1-3 (tools) podem ser agrupadas em um unico ciclo de trabalho
- Feature 6 (AI/ML) depende de decisao sobre manter TensorFlow.js ou migrar para outra abordagem
