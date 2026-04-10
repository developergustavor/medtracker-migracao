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
  name: string; onNameChange: (name: string) => void
  category: string; onCategoryChange: (category: string) => void
  type: string; onTypeChange: (type: string) => void
  widthMm: number; heightMm: number
  onDimensionChange: (w: number, h: number) => void
  unit: DimensionUnit; onUnitChange: (unit: DimensionUnit) => void
  onCancel: () => void
}

function EditorToolbar({ name, onNameChange, category, onCategoryChange, type, onTypeChange, widthMm, heightMm, onDimensionChange, unit, onUnitChange, onCancel }: EditorToolbarProps) {
  return (
    <div className="shrink-0 flex items-center gap-md px-md py-[6px] border-b border-separator bg-card overflow-x-auto">
      <button type="button" onClick={onCancel} className="shrink-0 w-[30px] h-[30px] rounded-sm border border-subtle flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
        <ArrowLeft2 size={14} color="var(--foreground)" />
      </button>
      <Input value={name} onChange={e => onNameChange(e.target.value)} placeholder="Nome do modelo" className="text-xs font-semibold w-[160px] shrink-0" style={{ height: 30 }} />

      <div className="separator-v h-[20px] shrink-0" />

      <div className="flex items-center gap-[4px] shrink-0">
        <Label className="text-xxs text-muted-foreground">Cat.</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="text-xs w-[110px]" style={{ height: 30 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ENTRADA">Entrada</SelectItem>
            <SelectItem value="DESINFECCAO">Desinfecção</SelectItem>
            <SelectItem value="ESTERILIZACAO">Esterilização</SelectItem>
            <SelectItem value="SAIDA">Saída</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-[4px] shrink-0">
        <Label className="text-xxs text-muted-foreground">Tipo</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="text-xs w-[130px]" style={{ height: 30 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="COM_INDICADOR">Com Indicador</SelectItem>
            <SelectItem value="SEM_INDICADOR">Sem Indicador</SelectItem>
            <SelectItem value="RELATORIO">Relatório</SelectItem>
            <SelectItem value="CHECKLIST">Checklist</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="separator-v h-[20px] shrink-0" />

      <div className="flex items-center gap-[4px] shrink-0">
        <Select onValueChange={v => { const p = LABEL_PRESETS.find(x => x.label === v); if (p && p.widthMm > 0) onDimensionChange(p.widthMm, p.heightMm) }}>
          <SelectTrigger className="text-xs w-[100px]" style={{ height: 30 }}><SelectValue placeholder="Preset" /></SelectTrigger>
          <SelectContent>{LABEL_PRESETS.map(p => <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="text" inputMode="numeric" value={String(widthMm)} onChange={e => onDimensionChange(Number(e.target.value.replace(/\D/g, '')) || 0, heightMm)} className="text-xs text-center w-[44px]" style={{ height: 30 }} />
        <span className="text-xxs text-muted-foreground">×</span>
        <Input type="text" inputMode="numeric" value={String(heightMm)} onChange={e => onDimensionChange(widthMm, Number(e.target.value.replace(/\D/g, '')) || 0)} className="text-xs text-center w-[44px]" style={{ height: 30 }} />
        <Select value={unit} onValueChange={v => onUnitChange(v as DimensionUnit)}>
          <SelectTrigger className="text-xs w-[48px]" style={{ height: 30 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mm">mm</SelectItem>
            <SelectItem value="cm">cm</SelectItem>
            <SelectItem value="px">px</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export { EditorToolbar }
