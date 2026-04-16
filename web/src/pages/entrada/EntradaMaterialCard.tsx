// packages
import { useState } from 'react'
import { TickSquare, Camera, Edit2, Trash, Add, Minus, TickCircle, ArrowDown2, User } from 'iconsax-react'

// mock
import { mockSubmaterials } from '@/mock/data'

// types
import type { EntryMaterialProps } from '@/entities'

const _loc = '@/pages/entrada/EntradaMaterialCard'

type EntradaMaterialCardProps = {
  material: EntryMaterialProps
  onConference: () => void
  onImages: () => void
  onRegister: () => void
  onRemove: () => void
  onAmountChange: (amount: number) => void
  defaultExpanded?: boolean
  checkedSubmaterials?: Record<number, number>
}

function EntradaMaterialCard({
  material,
  onConference,
  onImages,
  onRegister,
  onRemove,
  onAmountChange,
  defaultExpanded = false,
  checkedSubmaterials
}: EntradaMaterialCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const isKit = material.materialType === 'KIT'
  const isRegistered = material.recorded

  // -- Registered card (read-only)
  if (isRegistered) {
    const timeStr = material.recordedAt
      ? new Date(material.recordedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : ''

    return (
      <div className="rounded-sm border border-[#bbf7d0] bg-[#f0fdf4] opacity-75 p-sm">
        <div className="flex items-center gap-sm">
          {/* Thumbnail */}
          <div className="w-[44px] h-[44px] shrink-0 rounded-sm bg-[#dcfce7] flex items-center justify-center">
            <TickCircle size={20} color="#16a34a" variant="Bold" />
          </div>

          {/* Name + badge + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-xs">
              <span className="text-body font-semibold text-[#166534] truncate">{material.materialName}</span>
              <span className="shrink-0 bg-[#dcfce7] text-[#15803d] text-xxs px-sm rounded font-medium">REGISTRADO</span>
            </div>
            <div className="text-xs text-[#166534]/70 mt-[2px] flex items-center gap-[4px]">
              Qtd: {material.amount}
              {material.recordedBy && (
                <>
                  {' '}&middot;{' '}
                  <User size={12} color="currentColor" className="shrink-0" />
                  {material.recordedBy}
                </>
              )}
              {timeStr && <> &middot; {timeStr}</>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const subs = isKit ? mockSubmaterials.filter(s => s.materialId === material.materialId) : []

  // Shared button classes
  const btnBase = 'inline-flex items-center gap-[4px] px-md py-[5px] rounded-sm text-xs font-medium transition-colors cursor-pointer'
  const btnRegular = `${btnBase} border border-border bg-card hover:bg-elevated`
  const btnDestructive = `${btnBase} border border-destructive bg-destructive/5 text-destructive hover:bg-destructive/10`

  return (
    <div className="rounded-sm border border-border bg-card p-sm">
      {/* 3-row CSS Grid layout */}
      <div className="grid grid-cols-[auto_1fr] gap-x-sm">
        {/* Thumbnail spanning 3 rows */}
        <div className="row-span-3 w-[56px] min-h-[80px] shrink-0 rounded-sm bg-muted flex items-center justify-center self-stretch">
          <span className="text-xxs text-fg-dim">Foto</span>
        </div>

        {/* Row 1: Name + action buttons */}
        <div className="flex items-center gap-xs min-w-0">
          <span className="text-body font-semibold text-foreground truncate">{material.materialName}</span>
          <div className="flex gap-[6px] ml-auto shrink-0">
            {isKit && (
              <button type="button" onClick={onConference} className={btnRegular}>
                <TickSquare size={14} color="var(--primary)" />
                <span>Conferir</span>
              </button>
            )}
            <button type="button" onClick={onImages} className={btnRegular}>
              <Camera size={14} color="var(--primary)" />
              <span>Imagens</span>
              {material.images.length > 0 && (
                <span className="ml-[2px] min-w-[14px] h-[14px] rounded-full bg-primary text-on-solid text-[9px] font-bold flex items-center justify-center px-[2px]">
                  {material.images.length}
                </span>
              )}
            </button>
            <button type="button" onClick={onRegister} className={btnRegular}>
              <Edit2 size={14} color="var(--primary)" />
              <span>Registrar</span>
            </button>
            <button type="button" onClick={onRemove} className={btnDestructive}>
              <Trash size={14} color="currentColor" />
              <span>Remover</span>
            </button>
          </div>
        </div>

        {/* Row 2: Code · Package + quantity control (AVULSO only) */}
        <div className="flex items-center gap-xs min-w-0">
          <span className="text-xs text-fg-dim truncate">
            {material.materialCode && <>{material.materialCode}</>}
            {material.materialCode && material.packageName && <> &middot; </>}
            {material.packageName && <>{material.packageName}</>}
          </span>
          {!isKit && (
            <div className="flex items-center gap-[2px] ml-auto shrink-0">
              <button
                type="button"
                onClick={() => onAmountChange(Math.max(1, material.amount - 1))}
                className="w-[24px] h-[24px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
              >
                <Minus size={12} color="var(--fg-muted)" />
              </button>
              <div className="w-[36px] h-[24px] flex items-center justify-center text-xs font-semibold text-foreground">
                {material.amount}
              </div>
              <button
                type="button"
                onClick={() => onAmountChange(material.amount + 1)}
                className="w-[24px] h-[24px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
              >
                <Add size={12} color="var(--fg-muted)" />
              </button>
            </div>
          )}
        </div>

        {/* Row 3: Type badge + progress bar (KIT) */}
        <div className="flex items-center gap-xs min-w-0">
          {isKit ? (
            <span className="shrink-0 bg-primary text-on-solid text-xxs px-sm rounded">KIT</span>
          ) : (
            <span className="shrink-0 bg-muted text-fg-dim text-xxs px-sm rounded">{material.materialType}</span>
          )}
          {isKit && (
            <div className="flex items-center gap-xs ml-auto w-[100px]">
              <div className="flex-1 h-[6px] rounded-pill bg-muted overflow-hidden">
                <div
                  className="h-full rounded-pill bg-primary transition-all"
                  style={{ width: material.totalCount > 0 ? `${(material.checkedCount / material.totalCount) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-primary font-bold text-xs whitespace-nowrap">
                {material.checkedCount}/{material.totalCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submaterials (KIT only) */}
      {isKit && (
        <>
          <div className="mt-sm flex items-center gap-sm cursor-pointer" onClick={() => setExpanded(prev => !prev)}>
            <div className="flex-1 h-px bg-border" />
            <span className="flex items-center gap-[4px] text-xxs text-fg-dim font-medium whitespace-nowrap">
              <ArrowDown2 size={12} color="currentColor" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              {expanded ? 'Ocultar' : 'Ver'} submateriais ({subs.length})
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {expanded && (
            <div className="mt-xs max-h-[120px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-sm gap-y-[4px]">
                {subs.map(sub => {
                  const checkedAmount = checkedSubmaterials?.[sub.id] ?? 0
                  const isChecked = checkedAmount >= sub.amount
                  return (
                    <div key={sub.id} className="flex items-center gap-xs min-w-0">
                      {isChecked ? (
                        <TickCircle size={12} color="#16a34a" variant="Bold" className="shrink-0" />
                      ) : (
                        <div className="w-[12px] h-[12px] shrink-0 rounded-full border-2 border-yellow-400" />
                      )}
                      <span className="text-xs font-semibold text-foreground truncate">{sub.name}</span>
                      <span className="text-xxs text-fg-dim shrink-0">({checkedAmount}/{sub.amount})</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { EntradaMaterialCard }
export type { EntradaMaterialCardProps }
