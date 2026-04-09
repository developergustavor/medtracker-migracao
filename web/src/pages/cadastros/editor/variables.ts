const _loc = '@/pages/cadastros/editor/variables'

export type VariableCategory = {
  key: string
  label: string
  variables: VariableDefinition[]
}

export type VariableDefinition = {
  key: string
  path: string
  label: string
  placeholder: string
}

export const TEMPLATE_VARIABLES: VariableCategory[] = [
  {
    key: 'cme',
    label: 'CME',
    variables: [
      { key: 'cme.corporateName', path: 'tag.cme.corporateName', label: 'Razão Social', placeholder: 'CME' },
      { key: 'cme.name', path: 'tag.cme.name', label: 'Nome', placeholder: 'Nome CME' }
    ]
  },
  {
    key: 'material',
    label: 'Material',
    variables: [
      { key: 'material.name', path: 'tag.material.name', label: 'Nome do Material', placeholder: 'Material' },
      { key: 'material.submaterialsAmount', path: 'tag.material.submaterialsAmount', label: 'Qtd. Submateriais', placeholder: 'Qtd' },
      { key: 'materialsQuantityRatio', path: 'tag.materialsQuantityRatio', label: 'Qtd. Peças', placeholder: 'Qt. peças' }
    ]
  },
  {
    key: 'cycle',
    label: 'Ciclo',
    variables: [
      { key: 'cycle.batch', path: 'tag.cycle.batch', label: 'Nº Lote', placeholder: 'Lote' },
      { key: 'cycle.dateTime', path: 'tag.cycle.dateTime', label: 'Data do Ciclo', placeholder: 'Data ciclo' },
      { key: 'cycle.equipament.name', path: 'tag.cycle.equipament.name', label: 'Equipamento', placeholder: 'Equipamento' },
      { key: 'cycle.cycleType.name', path: 'tag.cycle.cycleType.name', label: 'Tipo de Ciclo', placeholder: 'Ciclo' },
      { key: 'cycle.materials[0].amount', path: 'tag.cycle.materials[0].amount', label: 'Qtd. Materiais', placeholder: 'Qtd' }
    ]
  },
  {
    key: 'tag',
    label: 'Etiqueta',
    variables: [
      { key: 'tag.id', path: 'tag.id', label: 'ID da Etiqueta', placeholder: 'ID' },
      { key: 'expirationDate', path: 'tag.expirationDate', label: 'Validade', placeholder: 'Validade' },
      { key: 'procedureDatetime', path: 'tag.procedureDatetime', label: 'Data Procedimento', placeholder: 'Procedimento' }
    ]
  },
  {
    key: 'user',
    label: 'Colaborador',
    variables: [
      { key: 'user.name', path: 'tag.user.name', label: 'Nome', placeholder: 'Colaborador' },
      { key: 'user.coren', path: 'tag.user.coren', label: 'Coren', placeholder: 'Coren' }
    ]
  },
  {
    key: 'patient',
    label: 'Paciente',
    variables: [
      { key: 'patient.name', path: 'tag.patient.name', label: 'Nome', placeholder: 'Paciente' }
    ]
  },
  {
    key: 'doctor',
    label: 'Médico',
    variables: [
      { key: 'doctor.name', path: 'tag.doctor.name', label: 'Nome', placeholder: 'Médico' }
    ]
  },
  {
    key: 'owner',
    label: 'Terceiro',
    variables: [
      { key: 'owner.name', path: 'tag.owner.name', label: 'Nome', placeholder: 'Terceiro' }
    ]
  },
  {
    key: 'system',
    label: 'Sistema',
    variables: [
      { key: 'dia_atual', path: 'tag.dia_atual', label: 'Dia Atual', placeholder: 'Dia' },
      { key: 'mes_atual', path: 'tag.mes_atual', label: 'Mês Atual', placeholder: 'Mês' },
      { key: 'ano_atual', path: 'tag.ano_atual', label: 'Ano Atual', placeholder: 'Ano' },
      { key: 'data_atual', path: 'tag.data_atual', label: 'Data Atual', placeholder: 'Data' }
    ]
  },
  {
    key: 'withheld',
    label: 'Materiais Retidos',
    variables: [
      { key: 'withheldMaterialsLength', path: 'withheldMaterialsLength', label: 'Total Retidos', placeholder: 'Total' },
      { key: 'withheldMaterialName', path: 'withheldMaterialName', label: 'Nome Material Retido', placeholder: 'Material' },
      { key: 'withheldMaterialAmount', path: 'withheldMaterialAmount', label: 'Qtd. Material Retido', placeholder: 'Qtd' }
    ]
  }
]

// Helper to create variable HTML
export function createVariableHtml(variable: VariableDefinition): string {
  return `<span nome-variavel="@@${variable.path}@@" class="variable">${variable.placeholder}</span>`
}
