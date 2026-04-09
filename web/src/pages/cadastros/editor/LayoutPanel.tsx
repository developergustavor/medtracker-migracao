// packages
import { useState, useCallback } from 'react'
import { RowHorizontal, RowVertical, Minus, Grid1 } from 'iconsax-react'

// libs
import { cn } from '@/libs/shadcn.utils'

// local
import { ImageTool } from './ImageTool'
import { getPresetGroups, loadPresetHtml, BLANK_TEMPLATES, type TemplatePreset } from './template-presets'

const _loc = '@/pages/cadastros/editor/LayoutPanel'

type LayoutPanelProps = {
  onLoadTemplate: (html: string, css: string, widthMm: number, heightMm: number, type: string, category: string) => void
  onInsertRow: () => void
  onInsertColumn: () => void
  onInsertSeparatorH: () => void
  onInsertSeparatorV: () => void
  onInsertImage: (src: string, width: number, height: number) => void
}

function LayoutPanel({ onLoadTemplate, onInsertRow, onInsertColumn, onInsertSeparatorH, onInsertSeparatorV, onInsertImage }: LayoutPanelProps) {
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null)
  const presetGroups = getPresetGroups()

  const handleLoadBlank = useCallback((key: 'blank' | 'bipartida') => {
    const template = BLANK_TEMPLATES[key]
    onLoadTemplate(template.html, template.css, 90, 35, 'SEM_INDICADOR', 'ESTERILIZACAO')
  }, [onLoadTemplate])

  const handleLoadPreset = useCallback(async (preset: TemplatePreset) => {
    setLoadingPreset(preset.key)
    const { html, css } = await loadPresetHtml(preset.fileName)
    onLoadTemplate(html, css, preset.widthMm, preset.heightMm, preset.type, preset.category)
    setLoadingPreset(null)
  }, [onLoadTemplate])

  return (
    <div className="flex flex-col">
      {/* Quick tools */}
      <div className="px-md py-sm">
        <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">Ferramentas</span>
      </div>
      <div className="grid grid-cols-2 gap-xs px-md pb-md">
        <button type="button" onClick={onInsertRow} className="flex items-center gap-xs px-sm py-[6px] text-xs text-foreground bg-elevated border border-subtle rounded-xs cursor-pointer hover-nav transition-colors">
          <RowHorizontal size={14} color="var(--primary)" />
          Linha
        </button>
        <button type="button" onClick={onInsertColumn} className="flex items-center gap-xs px-sm py-[6px] text-xs text-foreground bg-elevated border border-subtle rounded-xs cursor-pointer hover-nav transition-colors">
          <RowVertical size={14} color="var(--primary)" />
          Coluna
        </button>
        <button type="button" onClick={onInsertSeparatorH} className="flex items-center gap-xs px-sm py-[6px] text-xs text-foreground bg-elevated border border-subtle rounded-xs cursor-pointer hover-nav transition-colors">
          <Minus size={14} color="var(--primary)" />
          Sep. Horizontal
        </button>
        <button type="button" onClick={onInsertSeparatorV} className="flex items-center gap-xs px-sm py-[6px] text-xs text-foreground bg-elevated border border-subtle rounded-xs cursor-pointer hover-nav transition-colors">
          <Grid1 size={14} color="var(--primary)" />
          Sep. Vertical
        </button>
      </div>

      {/* Divider */}
      <div className="separator-h mx-md" />

      {/* Images */}
      <ImageTool onInsertImage={onInsertImage} />

      {/* Divider */}
      <div className="separator-h mx-md" />

      {/* Blank templates */}
      <div className="px-md py-sm">
        <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">Templates Base</span>
      </div>
      <div className="flex flex-col gap-xs px-md pb-md">
        <button
          type="button"
          onClick={() => handleLoadBlank('blank')}
          className="flex items-center gap-sm px-sm py-[8px] text-xs text-foreground bg-transparent border border-subtle rounded-sm cursor-pointer hover-nav transition-colors"
        >
          <div className="w-[32px] h-[20px] border border-subtle rounded-xs bg-white shrink-0" />
          Em branco
        </button>
        <button
          type="button"
          onClick={() => handleLoadBlank('bipartida')}
          className="flex items-center gap-sm px-sm py-[8px] text-xs text-foreground bg-transparent border border-subtle rounded-sm cursor-pointer hover-nav transition-colors"
        >
          <div className="w-[32px] h-[20px] border border-subtle rounded-xs bg-white shrink-0 flex flex-col">
            <div className="flex-1 border-b border-subtle" />
            <div className="flex-1" />
          </div>
          Bipartida (2 linhas)
        </button>
      </div>

      {/* Divider */}
      <div className="separator-h mx-md" />

      {/* Template examples */}
      <div className="px-md py-sm">
        <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">Exemplos ({presetGroups.reduce((s, g) => s + g.presets.length, 0)})</span>
      </div>
      <div className="flex flex-col overflow-y-auto">
        {presetGroups.map(({ group, presets }) => (
          <div key={group}>
            <div className="px-md py-[5px]">
              <span className="text-xs font-semibold text-foreground">{group}</span>
            </div>
            {presets.map(preset => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                disabled={loadingPreset === preset.key}
                className={cn(
                  'w-full flex items-center gap-sm px-lg py-[5px] text-left border-none cursor-pointer bg-transparent hover-nav transition-colors',
                  loadingPreset === preset.key && 'opacity-50'
                )}
              >
                <div className="w-[6px] h-[6px] rounded-full bg-primary-20 shrink-0" />
                <span className="text-xs text-foreground">{preset.label}</span>
                <span className="text-xxs text-fg-dim ml-auto">{preset.heightMm}×{preset.widthMm}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { LayoutPanel }
