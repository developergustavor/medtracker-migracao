const _loc = '@/pages/cadastros/editor/template-presets'

export type TemplatePreset = {
  key: string
  label: string
  group: string
  widthMm: number
  heightMm: number
  type: 'COM_INDICADOR' | 'SEM_INDICADOR'
  category: string
  fileName: string
}

// All 27 templates from /templates-examples/
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  // Vapor 35x90
  { key: 'vapor-35-90', label: 'Vapor 35×90', group: 'Vapor', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-35-90.html' },
  { key: 'vapor-35-90-consignado', label: 'Vapor 35×90 Consignado', group: 'Vapor', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-35-90-consignado.html' },
  { key: 'vapor-35-90-invalida', label: 'Vapor 35×90 Inválida', group: 'Vapor', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-35-90-invalida.html' },
  { key: 'vapor-35-90-retidos', label: 'Vapor 35×90 Retidos', group: 'Vapor', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-35-90-retidos.html' },
  // Vapor 50x90
  { key: 'vapor-50-90-1', label: 'Vapor 50×90 (1)', group: 'Vapor', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-50-90 (1).html' },
  { key: 'vapor-50-90-2', label: 'Vapor 50×90 (2)', group: 'Vapor', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-50-90 (2).html' },
  { key: 'vapor-50-90-consignado', label: 'Vapor 50×90 Consignado', group: 'Vapor', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-50-90-consignado.html' },
  { key: 'vapor-50-90-invalida', label: 'Vapor 50×90 Inválida', group: 'Vapor', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-50-90-invalida.html' },
  { key: 'vapor-50-90-retidos', label: 'Vapor 50×90 Retidos', group: 'Vapor', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'vapor-50-90-retidos.html' },
  // Peróxido 35x90
  { key: 'peroxido-35-90', label: 'Peróxido 35×90', group: 'Peróxido', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-35-90.html' },
  { key: 'peroxido-35-90-consignado', label: 'Peróxido 35×90 Consignado', group: 'Peróxido', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-35-90-consignado.html' },
  { key: 'peroxido-35-90-invalida', label: 'Peróxido 35×90 Inválida', group: 'Peróxido', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-35-90-invalida.html' },
  { key: 'peroxido-35-90-retidos', label: 'Peróxido 35×90 Retidos', group: 'Peróxido', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-35-90-retidos.html' },
  // Peróxido 50x90
  { key: 'peroxido-50-90-1', label: 'Peróxido 50×90 (1)', group: 'Peróxido', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-50-90 (1).html' },
  { key: 'peroxido-50-90-2', label: 'Peróxido 50×90 (2)', group: 'Peróxido', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-50-90 (2).html' },
  { key: 'peroxido-50-90-consignado', label: 'Peróxido 50×90 Consignado', group: 'Peróxido', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-50-90-consignado.html' },
  { key: 'peroxido-50-90-invalida', label: 'Peróxido 50×90 Inválida', group: 'Peróxido', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-50-90-invalida.html' },
  { key: 'peroxido-50-90-retidos', label: 'Peróxido 50×90 Retidos', group: 'Peróxido', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'ESTERILIZACAO', fileName: 'peroxido-50-90-retidos.html' },
  // Desinfectado 35x90
  { key: 'desinfectado-35-90', label: 'Desinfectado 35×90', group: 'Desinfectado', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-35-90.html' },
  { key: 'desinfectado-35-90-consignado', label: 'Desinfectado 35×90 Consignado', group: 'Desinfectado', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-35-90-consignado.html' },
  { key: 'desinfectado-35-90-invalida', label: 'Desinfectado 35×90 Inválida', group: 'Desinfectado', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-35-90-invalida.html' },
  { key: 'desinfectado-35-90-retidos', label: 'Desinfectado 35×90 Retidos', group: 'Desinfectado', widthMm: 90, heightMm: 35, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-35-90-retidos.html' },
  // Desinfectado 50x90
  { key: 'desinfectado-50-90-1', label: 'Desinfectado 50×90 (1)', group: 'Desinfectado', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-50-90 (1).html' },
  { key: 'desinfectado-50-90-2', label: 'Desinfectado 50×90 (2)', group: 'Desinfectado', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-50-90 (2).html' },
  { key: 'desinfectado-50-90-consignado', label: 'Desinfectado 50×90 Consignado', group: 'Desinfectado', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-50-90-consignado.html' },
  { key: 'desinfectado-50-90-invalida', label: 'Desinfectado 50×90 Inválida', group: 'Desinfectado', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-50-90-invalida.html' },
  { key: 'desinfectado-50-90-retidos', label: 'Desinfectado 50×90 Retidos', group: 'Desinfectado', widthMm: 90, heightMm: 50, type: 'COM_INDICADOR', category: 'DESINFECCAO', fileName: 'desinfectado-50-90-retidos.html' }
]

// Group presets by group name
export function getPresetGroups(): { group: string; presets: TemplatePreset[] }[] {
  const groups: Record<string, TemplatePreset[]> = {}
  for (const preset of TEMPLATE_PRESETS) {
    if (!groups[preset.group]) groups[preset.group] = []
    groups[preset.group].push(preset)
  }
  return Object.entries(groups).map(([group, presets]) => ({ group, presets }))
}

// Load template HTML from /templates-examples/ folder
export async function loadPresetHtml(fileName: string): Promise<{ html: string; css: string }> {
  try {
    const response = await fetch(`/templates-examples/${fileName}`)
    if (!response.ok) return { html: '', css: '' }
    const fullHtml = await response.text()

    // Split HTML and CSS from the <style> tag
    const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
    const css = styleMatch ? styleMatch[1].trim() : ''
    const html = fullHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim()

    return { html, css }
  } catch {
    return { html: '', css: '' }
  }
}

// Built-in blank templates
export const BLANK_TEMPLATES = {
  blank: {
    label: 'Em branco',
    html: '<div class="content-container" style="width:100%;height:100%;display:flex;flex-direction:column;padding:4px;"></div>',
    css: '.content-container { width: 100%; height: 100%; display: flex; flex-direction: column; padding: 4px; }'
  },
  bipartida: {
    label: 'Bipartida (2 linhas)',
    html: `<div class="content-container" style="width:100%;height:100%;display:flex;flex-direction:column;">
  <div class="row" style="flex:1;display:flex;border-bottom:1px solid #000;padding:4px;"></div>
  <div class="row" style="flex:1;display:flex;padding:4px;"></div>
</div>`,
    css: '.content-container { width: 100%; height: 100%; display: flex; flex-direction: column; } .row { flex: 1; display: flex; padding: 4px; }'
  }
}
