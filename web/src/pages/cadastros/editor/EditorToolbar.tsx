// packages
import { Maximize4, Minus, Add, ArrowLeft2, Eye } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// local
import { LABEL_PRESETS, type DimensionUnit } from './dimensions'

const _loc = '@/pages/cadastros/editor/EditorToolbar'

type EditorToolbarProps = {
  name: string
  onNameChange: (name: string) => void
  category: string
  onCategoryChange: (category: string) => void
  type: string
  onTypeChange: (type: string) => void
  widthMm: number
  heightMm: number
  onDimensionChange: (w: number, h: number) => void
  unit: DimensionUnit
  onUnitChange: (unit: DimensionUnit) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  onPreview: () => void
  onSave: () => void
  onCancel: () => void
}

function EditorToolbar({
  name, onNameChange,
  category, onCategoryChange,
  type, onTypeChange,
  widthMm, heightMm, onDimensionChange,
  unit, onUnitChange,
  zoom, onZoomChange,
  onPreview, onSave, onCancel
}: EditorToolbarProps) {

  const handlePresetChange = (preset: string) => {
    const found = LABEL_PRESETS.find(p => p.label === preset)
    if (found && found.widthMm > 0) {
      onDimensionChange(found.widthMm, found.heightMm)
    }
  }

  return (
    <div className="shrink-0 flex items-center gap-md px-lg py-sm border-b border-separator bg-card overflow-x-auto">
      {/* Back + Name */}
      <button type="button" onClick={onCancel} className="shrink-0 w-[32px] h-[32px] rounded-sm border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
        <ArrowLeft2 size={16} color="var(--foreground)" />
      </button>
      <Input
        value={name}
        onChange={e => onNameChange(e.target.value)}
        placeholder="Nome do modelo"
        className="text-body font-semibold w-[180px] shrink-0"
        style={{ height: 32 }}
      />

      {/* Separator */}
      <div className="separator-v h-[24px] shrink-0" />

      {/* Category */}
      <div className="flex items-center gap-xs shrink-0">
        <Label className="text-xxs text-muted-foreground whitespace-nowrap">Categoria</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="text-xs w-[120px]" style={{ height: 32 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ENTRADA">Entrada</SelectItem>
            <SelectItem value="DESINFECCAO">Desinfecção</SelectItem>
            <SelectItem value="ESTERILIZACAO">Esterilização</SelectItem>
            <SelectItem value="SAIDA">Saída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="flex items-center gap-xs shrink-0">
        <Label className="text-xxs text-muted-foreground whitespace-nowrap">Tipo</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="text-xs w-[140px]" style={{ height: 32 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COM_INDICADOR">Com Indicador</SelectItem>
            <SelectItem value="SEM_INDICADOR">Sem Indicador</SelectItem>
            <SelectItem value="RELATORIO">Relatório</SelectItem>
            <SelectItem value="CHECKLIST">Checklist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="separator-v h-[24px] shrink-0" />

      {/* Preset */}
      <div className="flex items-center gap-xs shrink-0">
        <Label className="text-xxs text-muted-foreground whitespace-nowrap">Tamanho</Label>
        <Select onValueChange={handlePresetChange}>
          <SelectTrigger className="text-xs w-[120px]" style={{ height: 32 }}>
            <SelectValue placeholder="Preset..." />
          </SelectTrigger>
          <SelectContent>
            {LABEL_PRESETS.map(p => (
              <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dimensions */}
      <div className="flex items-center gap-[4px] shrink-0">
        <Input
          type="text"
          inputMode="numeric"
          value={String(widthMm)}
          onChange={e => onDimensionChange(Number(e.target.value.replace(/\D/g, '')) || 0, heightMm)}
          className="text-xs text-center w-[50px]"
          style={{ height: 32 }}
        />
        <span className="text-xxs text-muted-foreground">×</span>
        <Input
          type="text"
          inputMode="numeric"
          value={String(heightMm)}
          onChange={e => onDimensionChange(widthMm, Number(e.target.value.replace(/\D/g, '')) || 0)}
          className="text-xs text-center w-[50px]"
          style={{ height: 32 }}
        />
        <Select value={unit} onValueChange={v => onUnitChange(v as DimensionUnit)}>
          <SelectTrigger className="text-xs w-[55px]" style={{ height: 32 }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mm">mm</SelectItem>
            <SelectItem value="cm">cm</SelectItem>
            <SelectItem value="px">px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Separator */}
      <div className="separator-v h-[24px] shrink-0" />

      {/* Zoom */}
      <div className="flex items-center gap-[4px] shrink-0">
        <button type="button" onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))} className="w-[28px] h-[28px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
          <Minus size={12} color="var(--foreground)" />
        </button>
        <span className="text-xs text-muted-foreground w-[40px] text-center">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => onZoomChange(Math.min(3, zoom + 0.25))} className="w-[28px] h-[28px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
          <Add size={12} color="var(--foreground)" />
        </button>
        <button type="button" onClick={() => onZoomChange(1)} className="w-[28px] h-[28px] rounded-xs border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors" title="Reset zoom">
          <Maximize4 size={12} color="var(--foreground)" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-sm shrink-0">
        <button type="button" onClick={onPreview} className="inline-flex items-center gap-[4px] text-xs text-primary bg-primary-8 px-md border-none cursor-pointer rounded-sm hover-primary-subtle transition-colors" style={{ height: 32 }}>
          <Eye size={14} color="currentColor" />
          Preview
        </button>
        <button type="button" onClick={onSave} className="inline-flex items-center gap-[4px] text-xs text-on-solid gradient-primary px-md border-none cursor-pointer rounded-sm" style={{ height: 32 }}>
          Salvar
        </button>
      </div>
    </div>
  )
}

export { EditorToolbar }
