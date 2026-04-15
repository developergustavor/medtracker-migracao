// packages
import { useState } from 'react'
import { TickSquare, Camera, Edit2, Trash, Add, Minus, TickCircle, ArrowDown2 } from 'iconsax-react'

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
}

function EntradaMaterialCard({
  material,
  onConference,
  onImages,
  onRegister,
  onRemove,
  onAmountChange,
  defaultExpanded = false
}: EntradaMaterialCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const isKit = material.materialType === 'KIT'
  const isRegistered = material.recorded

  // -- Registered card (read-only, no changes)
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
            <div className="text-xs text-[#166534]/70 mt-[2px]">
              Qtd: {material.amount}
              {material.recordedBy && <> &middot; Registrado por {material.recordedBy}</>}
              {timeStr && <> &middot; {timeStr}</>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // -- KIT card
  if (isKit) {
    const subs = mockSubmaterials.filter(s => s.materialId === material.materialId)

    return (
      <div className="rounded-sm border border-border bg-card p-sm">
        {/* Main row */}
        <div className="flex items-start gap-sm">
          {/* Thumbnail */}
          <div className="w-[44px] h-[44px] shrink-0 rounded-sm bg-muted flex items-center justify-center">
            <span className="text-xxs text-fg-dim">Foto</span>
          </div>

          {/* Name + info + action buttons + progress */}
          <div className="flex-1 min-w-0">
            {/* Name line */}
            <div className="flex items-center gap-xs">
              <span className="text-body font-semibold text-foreground truncate">{material.materialName}</span>
              <span className="shrink-0 bg-primary text-on-solid text-xxs px-sm rounded">KIT</span>
            </div>
            <div className="text-xs text-fg-dim mt-[2px] truncate">
              {material.materialCode && <>{material.materialCode}</>}
              {material.materialCode && material.packageName && <> &middot; </>}
              {material.packageName && <>{material.packageName}</>}
            </div>

            {/* Action buttons (pill style) */}
            <div className="flex flex-wrap gap-[6px] mt-sm">
              <button
                type="button"
                onClick={onConference}
                className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-border bg-card hover:bg-elevated transition-colors cursor-pointer"
              >
                <TickSquare size={12} color="var(--primary)" />
                <span>Conferir</span>
              </button>
              <button
                type="button"
                onClick={onImages}
                className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-border bg-card hover:bg-elevated transition-colors cursor-pointer"
              >
                <Camera size={12} color="var(--primary)" />
                <span>Imagens</span>
                {material.images.length > 0 && (
                  <span className="ml-[2px] min-w-[14px] h-[14px] rounded-full bg-primary text-on-solid text-[9px] font-bold flex items-center justify-center px-[2px]">
                    {material.images.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={onRegister}
                className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-border bg-card hover:bg-elevated transition-colors cursor-pointer"
              >
                <Edit2 size={12} color="var(--primary)" />
                <span>Registrar</span>
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash size={12} color="currentColor" />
                <span>Remover</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-xs mt-sm">
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
          </div>
        </div>

        {/* Separator toggle for submaterials */}
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
                const checked = false
                return (
                  <div key={sub.id} className="flex items-center gap-xs min-w-0">
                    {checked ? (
                      <TickCircle size={12} color="#16a34a" variant="Bold" className="shrink-0" />
                    ) : (
                      <div className="w-[12px] h-[12px] shrink-0 rounded-full border-2 border-yellow-400" />
                    )}
                    <span className="text-xxs text-foreground truncate">{sub.name}</span>
                    <span className="text-xxs text-fg-dim shrink-0">({sub.amount})</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // -- AVULSO / QUANTIDADE card
  return (
    <div className="rounded-sm border border-border bg-card p-sm">
      <div className="flex items-start gap-sm">
        {/* Thumbnail */}
        <div className="w-[44px] h-[44px] shrink-0 rounded-sm bg-muted flex items-center justify-center">
          <span className="text-xxs text-fg-dim">Foto</span>
        </div>

        {/* Name + info + action buttons + quantity */}
        <div className="flex-1 min-w-0">
          {/* Name line */}
          <div className="flex items-center gap-xs">
            <span className="text-body font-semibold text-foreground truncate">{material.materialName}</span>
            <span className="shrink-0 bg-muted text-fg-dim text-xxs px-sm rounded">{material.materialType}</span>
          </div>
          <div className="text-xs text-fg-dim mt-[2px] truncate">
            {material.materialCode && <>{material.materialCode}</>}
            {material.materialCode && material.packageName && <> &middot; </>}
            {material.packageName && <>{material.packageName}</>}
          </div>

          {/* Action buttons (pill style) */}
          <div className="flex flex-wrap gap-[6px] mt-sm">
            <button
              type="button"
              onClick={onImages}
              className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-border bg-card hover:bg-elevated transition-colors cursor-pointer"
            >
              <Camera size={12} color="var(--primary)" />
              <span>Imagens</span>
              {material.images.length > 0 && (
                <span className="ml-[2px] min-w-[14px] h-[14px] rounded-full bg-primary text-on-solid text-[9px] font-bold flex items-center justify-center px-[2px]">
                  {material.images.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-border bg-card hover:bg-elevated transition-colors cursor-pointer"
            >
              <Edit2 size={12} color="var(--primary)" />
              <span>Registrar</span>
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-[4px] px-sm py-[4px] rounded-sm text-xxs font-medium border border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash size={12} color="currentColor" />
              <span>Remover</span>
            </button>
          </div>

          {/* Quantity control */}
          <div className="flex items-center gap-[2px] mt-sm">
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
        </div>
      </div>
    </div>
  )
}

export { EntradaMaterialCard }
export type { EntradaMaterialCardProps }
