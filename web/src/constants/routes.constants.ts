// entities
import { user_role, cme_module } from '@/entities'

// types
import type { RouteMetadataProps } from '@/types'

const allRoles = Object.values(user_role)
const nonColabRoles = [user_role.DEV, user_role.ADMINISTRADOR, user_role.COLABORADOR_CHEFE, user_role.REPRESENTANTE]
const adminOnly = [user_role.DEV, user_role.ADMINISTRADOR]
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
    name: 'Dashboard CME',
    path: '/dashboard-cme',
    icon: 'Chart',
    allowedRoles: allRoles,
    allowedModules: allModules,
    showInSidebar: true
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
    contextualActions: [
      { label: 'Novo Registro', icon: 'Add', action: 'new-record', variant: 'primary', position: 'start' },
      { label: 'Exportar', icon: 'DocumentDownload', action: 'export', position: 'end', disabled: true },
      { label: 'Filtros', icon: 'Filter', action: 'filters', position: 'end' }
    ],
    children: [
      { name: 'Materiais', path: '/cadastros/materiais', icon: 'Scissor', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Colaboradores', path: '/cadastros/colaboradores', icon: 'People', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Equipamentos', path: '/cadastros/equipamentos', icon: 'Cpu', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Embalagens', path: '/cadastros/embalagens', icon: 'Box1', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Tipos de Ciclo', path: '/cadastros/tipos-de-ciclo', icon: 'Refresh2', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Tipos de Ocorrência', path: '/cadastros/tipos-de-ocorrencia', icon: 'Danger', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Indicadores', path: '/cadastros/indicadores', icon: 'Chart', allowedRoles: nonColabRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Insumos', path: '/cadastros/insumos', icon: 'Health', allowedRoles: nonColabRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Terceiros', path: '/cadastros/terceiros', icon: 'ProfileCircle', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Setores', path: '/cadastros/setores', icon: 'Building4', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Médicos', path: '/cadastros/medicos', icon: 'Health', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Pacientes', path: '/cadastros/pacientes', icon: 'Profile2User', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true },
      { name: 'Checklists', path: '/cadastros/checklists', icon: 'TickSquare', allowedRoles: nonColabRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Modelos', path: '/cadastros/modelos', icon: 'DocumentText', allowedRoles: nonColabRoles, allowedModules: allModules, showInSidebar: true }
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
    mobileTabRoles: [user_role.COLABORADOR],
    contextualActions: [
      { label: 'Nova Entrada', icon: 'Add', action: 'new-entry', variant: 'primary', position: 'start' },
      { label: 'Gerar Relatório', icon: 'DocumentText', action: 'report', position: 'center' }
    ]
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
    contextualActions: [
      { label: 'Novo Ciclo', icon: 'Add', action: 'new-cycle', variant: 'primary', position: 'start' },
      { label: 'Rack Virtual', icon: 'Box1', action: 'rack-virtual', position: 'center' },
      { label: 'Relatório', icon: 'DocumentText', action: 'report', position: 'center' },
      { label: 'Filtros', icon: 'Filter', action: 'filters', position: 'end' }
    ],
    children: [
      { name: 'Desinfecção', path: '/ciclos/desinfeccao', icon: 'Refresh2', allowedRoles: allRoles, allowedModules: workflowModules, showInSidebar: true },
      { name: 'Esterilização', path: '/ciclos/esterilizacao', icon: 'Flash', allowedRoles: allRoles, allowedModules: workflowModules, showInSidebar: true }
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
    mobileTabRoles: [user_role.COLABORADOR],
    contextualActions: [
      { label: 'Nova Carga', icon: 'Add', action: 'new-output', variant: 'primary', position: 'start' }
    ]
  },
  {
    name: 'Conferência',
    path: '/conferencia',
    icon: 'TaskSquare',
    allowedRoles: allRoles,
    allowedModules: [cme_module.COMPLETO],
    showInSidebar: true
  },
  {
    name: 'Impressão de Etiquetas',
    path: '/impressao-de-etiquetas',
    icon: 'Tag',
    allowedRoles: allRoles,
    allowedModules: [cme_module.IMPRESSAO],
    showInSidebar: true
  },
  {
    name: 'Relatórios',
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
    name: 'Configurações',
    path: '/configuracoes',
    icon: 'Setting',
    allowedRoles: nonColabRoles,
    allowedModules: allModules,
    showInSidebar: true
  }
]
