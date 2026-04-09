// packages
import { useState, useRef, useCallback } from 'react'
import { Add, Edit2, Copy, Trash, Camera } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// libs
import { cn } from '@/libs/shadcn.utils'

// hooks
import { useIsMobile } from '@/hooks'

const _loc = '@/pages/cadastros/MaterialSubmaterialsPanel'

export type Submaterial = {
  id?: number
  code: string
  name: string
  amount: number
  images: string[]
}

type MaterialSubmaterialsPanelProps = {
  submaterials: Submaterial[]
  onAdd: (sub: Omit<Submaterial, 'id'>) => void
  onEdit: (index: number, sub: Submaterial) => void
  onDelete: (index: number) => void
  onDuplicate: (index: number) => void
  disabled: boolean
  disabledMessage?: string
}

function MaterialSubmaterialsPanel({
  submaterials,
  onAdd,
  onEdit,
  onDelete,
  onDuplicate,
  disabled,
  disabledMessage
}: MaterialSubmaterialsPanelProps) {
  const isMobile = useIsMobile()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(1)
  const nameRef = useRef<HTMLInputElement>(null)
  const codeRef = useRef<HTMLInputElement>(null)

  const hasCode = code.trim().length > 0
  const isValid = name.trim().length > 0

  const totalItems = submaterials.length
  const totalUnits = submaterials.reduce((sum, s) => sum + s.amount, 0)

  const handleCodeChange = useCallback((val: string) => {
    setCode(val)
    if (val.trim()) {
      setAmount(1)
    }
    // Debounce auto-focus: after user stops typing code, focus name
    // This is handled by onBlur instead for simplicity
  }, [])

  const handleCodeBlur = useCallback(() => {
    if (code.trim()) {
      nameRef.current?.focus()
    }
  }, [code])

  const handleAdd = useCallback(() => {
    if (!isValid) return
    onAdd({ code: code.trim(), name: name.trim(), amount: hasCode ? 1 : amount, images: [] })
    setCode('')
    setName('')
    setAmount(1)
    codeRef.current?.focus()
  }, [code, name, amount, hasCode, isValid, onAdd])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault()
      handleAdd()
    }
  }, [isValid, handleAdd])

  const handleDuplicate = useCallback((index: number) => {
    onDuplicate(index)
    // After duplicating, focus code input for the new entry
    setTimeout(() => codeRef.current?.focus(), 50)
  }, [onDuplicate])

  return (
    <div className={cn('flex flex-col gap-sm h-full transition-opacity', disabled && 'opacity-30 pointer-events-none')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-primary font-bold tracking-wider uppercase">Composição do Kit</span>
        {disabled ? (
          <span className="text-xxs font-bold text-on-solid bg-warning px-sm py-[2px] rounded-pill">{disabledMessage || 'Registre primeiro'}</span>
        ) : (
          <span className="text-xs text-fg-dim">{totalItems} itens · {totalUnits} un.</span>
        )}
      </div>

      {/* Inline add form */}
      <div className="bg-card rounded-sm border border-primary-12 p-sm flex flex-col gap-xs shrink-0" onKeyDown={handleKeyDown}>
        <div className="flex gap-xs">
          <div className={isMobile ? 'w-[80px]' : 'w-[75px]'}>
            <Label className="text-xxs text-muted-foreground">Código</Label>
            <Input
              ref={codeRef}
              type="text"
              value={code}
              onChange={e => handleCodeChange(e.target.value)}
              onBlur={handleCodeBlur}
              placeholder="opc."
              className="text-xs text-center"
              style={{ height: 32 }}
              disabled={disabled}
            />
          </div>
          <div className="flex-1">
            <Label className="text-xxs text-muted-foreground">Nome <span className="text-destructive">*</span></Label>
            <Input
              ref={nameRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome do submaterial..."
              className="text-xs"
              style={{ height: 32 }}
              disabled={disabled}
            />
          </div>
          <div className="w-[42px]">
            <Label className="text-xxs text-muted-foreground">Qtd</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={String(hasCode ? 1 : amount)}
              onChange={e => {
                if (!hasCode) {
                  const raw = e.target.value.replace(/\D/g, '')
                  setAmount(raw === '' ? 1 : Math.max(1, Number(raw)))
                }
              }}
              className={cn('text-xs text-center', hasCode && 'opacity-50')}
              style={{ height: 32 }}
              disabled={disabled || hasCode}
            />
          </div>
          <div className="flex gap-[3px] items-end pb-[1px]">
            <button
              type="button"
              className="w-[30px] h-[32px] rounded-xs bg-primary-8 flex items-center justify-center border-none cursor-pointer"
              disabled={disabled}
            >
              <Camera size={14} color="var(--primary)" />
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={disabled || !isValid}
              className={cn(
                'w-[30px] h-[32px] rounded-xs flex items-center justify-center border-none cursor-pointer transition-opacity',
                isValid ? 'bg-primary' : 'bg-elevated',
                (!isValid || disabled) && 'opacity-40 cursor-not-allowed'
              )}
            >
              <Add size={14} color={isValid ? 'white' : 'var(--fg-dim)'} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 bg-card rounded-sm border border-border overflow-hidden flex flex-col">
        {/* Table header */}
        {!isMobile && (
          <div className="flex items-center px-md py-xs border-b border-separator bg-overlay-3 shrink-0">
            <div className="w-[65px] text-xxs text-muted-foreground font-semibold uppercase">Cód</div>
            <div className="flex-1 text-xxs text-muted-foreground font-semibold uppercase">Nome</div>
            <div className="w-[35px] text-center text-xxs text-muted-foreground font-semibold uppercase">Qtd</div>
            <div className="w-[30px] text-center text-xxs text-muted-foreground font-semibold uppercase">Img</div>
            <div className="w-[76px]"></div>
          </div>
        )}

        {/* Rows */}
        <div className="flex-1 overflow-y-auto">
          {submaterials.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-xs py-3xl text-muted-foreground">
              <span className="text-body">{disabled ? 'Registre o material para habilitar' : 'Nenhum submaterial'}</span>
              <span className="text-caption text-fg-dim">Adicione itens usando o formulário acima</span>
            </div>
          )}
          {submaterials.map((sub, idx) => (
            isMobile ? (
              // Mobile: card layout
              <div key={idx} className="px-md py-sm border-b border-separator">
                <div className="flex items-center justify-between mb-[3px]">
                  <span className="text-body text-foreground font-medium">{sub.name}</span>
                  <div className="flex gap-[3px]">
                    <button type="button" onClick={() => onEdit(idx, sub)} className="w-[24px] h-[24px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer">
                      <Edit2 size={12} color="var(--fg-muted)" />
                    </button>
                    <button type="button" onClick={() => handleDuplicate(idx)} className="w-[24px] h-[24px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer">
                      <Copy size={12} color="var(--fg-muted)" />
                    </button>
                    <button type="button" onClick={() => onDelete(idx)} className="w-[24px] h-[24px] rounded-xs border border-destructive/40 flex items-center justify-center bg-transparent cursor-pointer">
                      <Trash size={12} color="var(--destructive)" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-md items-center">
                  <span className="text-xs text-fg-muted">Cód: <span className={sub.code ? 'text-foreground font-mono' : 'text-fg-ghost'}>{sub.code || '—'}</span></span>
                  <span className="text-xs text-fg-muted">Qtd: <span className={cn('text-foreground', !sub.code && sub.amount > 1 && 'font-bold')}>{sub.amount}</span></span>
                  {sub.images.length > 0 && (
                    <div className="w-[18px] h-[18px] rounded-xs bg-elevated border border-subtle flex items-center justify-center">
                      <Camera size={10} color="var(--fg-muted)" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Desktop: table row
              <div key={idx} className="flex items-center px-md py-[7px] border-b border-separator/50 hover-nav transition-colors">
                <div className="w-[65px] text-xs font-mono text-fg-secondary">{sub.code || <span className="text-fg-ghost">—</span>}</div>
                <div className="flex-1 text-body text-foreground">{sub.name}</div>
                <div className={cn('w-[35px] text-center text-xs', !sub.code && sub.amount > 1 ? 'text-foreground font-bold' : 'text-fg-muted')}>{sub.amount}</div>
                <div className="w-[30px] text-center">
                  {sub.images.length > 0 ? (
                    <div className="w-[22px] h-[22px] rounded-xs bg-elevated border border-subtle mx-auto flex items-center justify-center">
                      <Camera size={10} color="var(--fg-muted)" />
                    </div>
                  ) : (
                    <span className="text-fg-ghost text-xs">—</span>
                  )}
                </div>
                <div className="w-[76px] flex gap-[3px] justify-end">
                  <button type="button" onClick={() => onEdit(idx, sub)} className="w-[24px] h-[24px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
                    <Edit2 size={12} color="var(--fg-muted)" />
                  </button>
                  <button type="button" onClick={() => handleDuplicate(idx)} className="w-[24px] h-[24px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors">
                    <Copy size={12} color="var(--fg-muted)" />
                  </button>
                  <button type="button" onClick={() => onDelete(idx)} className="w-[24px] h-[24px] rounded-xs border border-destructive/40 flex items-center justify-center bg-transparent cursor-pointer hover-destructive-subtle transition-colors">
                    <Trash size={12} color="var(--destructive)" />
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export { MaterialSubmaterialsPanel }
export type { MaterialSubmaterialsPanelProps }
