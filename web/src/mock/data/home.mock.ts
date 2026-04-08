export type MockMetricProps = {
  label: string
  value: number
  delta: number
  deltaLabel: string
  period: string
}

export type MockUpdateNoteProps = {
  title: string
  description: string
}

export type MockNotificationProps = {
  id: number
  title: string
  time: string
}

export type MockSupportLinkProps = {
  id: number
  label: string
  icon: string
}

export type MockWorkflowDescriptionProps = {
  description: string
  topics: string[]
}

export const mockMetrics: MockMetricProps[] = [
  { label: 'Ciclos hoje', value: 12, delta: 3, deltaLabel: 'vs ontem', period: 'Hoje' },
  { label: 'Etiquetas hoje', value: 8, delta: 2, deltaLabel: 'vs ontem', period: 'Hoje' },
  { label: 'Ciclos na semana', value: 47, delta: -5, deltaLabel: 'vs semana anterior', period: 'Semana' },
  { label: 'Ciclos no mês', value: 189, delta: 12, deltaLabel: '% vs mês anterior', period: 'Mês' }
]

export const mockUpdateNote: MockUpdateNoteProps = {
  title: 'Novidades v2.1 — Novo módulo de conferência',
  description: 'Conferência de materiais agora conta com scan automático e verificação por foto.'
}

export const mockNotifications: MockNotificationProps[] = [
  { id: 1, title: 'Ciclo #812 pendente de finalização', time: 'Há 2 horas' },
  { id: 2, title: '3 materiais com validade próxima', time: 'Hoje' },
  { id: 3, title: 'Nova ocorrência registrada', time: 'Ontem' }
]

export const mockSupportLinks: MockSupportLinkProps[] = [
  { id: 1, label: 'Manual do sistema', icon: 'Book1' },
  { id: 2, label: 'Treinamentos', icon: 'VideoPlay' },
  { id: 3, label: 'Relatórios rápidos', icon: 'DocumentText' }
]

export const mockSubrouteDescriptions: Record<string, string> = {
  '/cadastros/materiais': 'Gerencie materiais e instrumentais',
  '/cadastros/colaboradores': 'Equipe e permissões',
  '/cadastros/equipamentos': 'Autoclaves e lavadoras',
  '/cadastros/embalagens': 'Embalagens e validades',
  '/cadastros/tipos-de-ciclo': 'Tipos de processos',
  '/cadastros/tipos-de-ocorrencia': 'Categorias de incidentes',
  '/cadastros/indicadores': 'Indicadores de qualidade',
  '/cadastros/insumos': 'Insumos e suprimentos',
  '/cadastros/terceiros': 'Fornecedores e parceiros',
  '/cadastros/setores': 'Departamentos do hospital',
  '/cadastros/medicos': 'Cadastro de médicos',
  '/cadastros/pacientes': 'Cadastro de pacientes',
  '/cadastros/checklists': 'Listas de verificação',
  '/cadastros/modelos': 'Templates de etiquetas',
  '/ciclos/desinfeccao': 'Processos de desinfecção',
  '/ciclos/esterilizacao': 'Processos de esterilização',
}

export const mockWorkflowDescriptions: Record<string, MockWorkflowDescriptionProps> = {
  '/dashboard-cme': {
    description: 'Painel analítico com KPIs de inventário, movimentações, ciclos por período, gráficos de indicadores e ocorrências.',
    topics: ['KPIs', 'Gráficos', 'Indicadores']
  },
  '/dashboard': {
    description: 'Painel analítico com KPIs de inventário, movimentações, ciclos por período, gráficos de indicadores e ocorrências.',
    topics: ['KPIs', 'Gráficos', 'Indicadores']
  },
  '/entrada-de-materiais': {
    description: 'Registre a entrada de materiais na CME, associe médicos, pacientes e confira submateriais.',
    topics: ['Recebimento', 'Triagem', 'Rastreamento']
  },
  '/ciclos': {
    description: 'Gerencie ciclos de desinfecção e esterilização, adicione materiais, indicadores e finalize processos.',
    topics: ['Desinfecção', 'Esterilização', 'Indicadores']
  },
  '/saida-de-materiais': {
    description: 'Controle a saída de materiais esterilizados para setores, médicos ou CMEs externas.',
    topics: ['Distribuição', 'Setores', 'Rastreio']
  },
  '/conferencia': {
    description: 'Verifique materiais no centro cirúrgico com conferência de submateriais e autenticação.',
    topics: ['Verificação', 'Autenticação', 'Centro cirúrgico']
  },
  '/impressao-de-etiquetas': {
    description: 'Crie e imprima etiquetas de materiais com templates personalizáveis.',
    topics: ['Etiquetas', 'Templates', 'Impressão']
  },
  '/cadastros': {
    description: 'Gerencie todos os cadastros do sistema: materiais, colaboradores, equipamentos, embalagens e muito mais.',
    topics: ['Materiais', 'Colaboradores', 'Equipamentos']
  }
}
