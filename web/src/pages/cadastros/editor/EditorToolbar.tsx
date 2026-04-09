// packages
import { ArrowLeft2 } from 'iconsax-react'

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
  onCancel: () => void
}

function EditorToolbar({
  name, onNameChange,
  category, onCategoryChange,
  type, onTypeChange,
  widthMm, heightMm, onDimensionChange,
  unit, onUnitChange,
  onCancel
}: EditorToolbarProps) {

  const handlePresetChange = (preset: string) => {
    const found = LABEL_PRESETS.find(p => p.label === preset)
    if (found && found.widthMm > 0) onDimensionChange(found.widthMm, found.heightMm)
  }

  return (
    <div className="flex-1 flex flex-col gap-lg p-md overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-sm">
        <button type="button" onClick={onCancel} className="shrink-0 w-[30px] h-[30px] rounded-sm border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
          <ArrowLeft2 size={14} color="var(--foreground)" />
        </button>
        <span className="text-caption font-semibold text-foreground">Editor de Template</span>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-[4px]">
        <Label className="text-xxs text-muted-foreground">Nome do modelo</Label>
        <Input value={name} onChange={e => onNameChange(e.target.value)} placeholder="Nome..." className="text-xs" style={{ height: 32 }} />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-[4px]">
        <Label className="text-xxs text-muted-foreground">Categoria</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="text-xs" style={{ height: 32 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ENTRADA">Entrada</SelectItem>
            <SelectItem value="DESINFECCAO">Desinfecção</SelectItem>
            <SelectItem value="ESTERILIZACAO">Esterilização</SelectItem>
            <SelectItem value="SAIDA">Saída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="flex flex-col gap-[4px]">
        <Label className="text-xxs text-muted-foreground">Tipo de etiqueta</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="text-xs" style={{ height: 32 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="COM_INDICADOR">Com Indicador</SelectItem>
            <SelectItem value="SEM_INDICADOR">Sem Indicador</SelectItem>
            <SelectItem value="RELATORIO">Relatório</SelectItem>
            <SelectItem value="CHECKLIST">Checklist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Preset */}
      <div className="flex flex-col gap-[4px]">
        <Label className="text-xxs text-muted-foreground">Tamanho predefinido</Label>
        <Select onValueChange={handlePresetChange}>
          <SelectTrigger className="text-xs" style={{ height: 32 }}><SelectValue placeholder="Selecione..." /></SelectTrigger>
          <SelectContent>
            {LABEL_PRESETS.map(p => <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Custom dimensions */}
      <div className="flex flex-col gap-[4px]">
        <Label className="text-xxs text-muted-foreground">Dimensões</Label>
        <div className="flex items-center gap-[4px]">
          <Input type="text" inputMode="numeric" value={String(widthMm)} onChange={e => onDimensionChange(Number(e.target.value.replace(/\D/g, '')) || 0, heightMm)} className="text-xs text-center flex-1" style={{ height: 32 }} />
          <span className="text-xxs text-muted-foreground">×</span>
          <Input type="text" inputMode="numeric" value={String(heightMm)} onChange={e => onDimensionChange(widthMm, Number(e.target.value.replace(/\D/g, '')) || 0)} className="text-xs text-center flex-1" style={{ height: 32 }} />
          <Select value={unit} onValueChange={v => onUnitChange(v as DimensionUnit)}>
            <SelectTrigger className="text-xs w-[52px] shrink-0" style={{ height: 32 }}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="mm">mm</SelectItem>
              <SelectItem value="cm">cm</SelectItem>
              <SelectItem value="px">px</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export { EditorToolbar }
