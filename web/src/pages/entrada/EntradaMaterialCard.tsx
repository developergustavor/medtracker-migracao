// packages
import { useState } from 'react'
import { TickSquare, Camera, Edit2, Trash, Add, Minus, TickCircle } from 'iconsax-react'

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

  // -- Registered card
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
        <div className="flex items-center gap-sm">
          {/* Thumbnail */}
          <div className="w-[44px] h-[44px] shrink-0 rounded-sm bg-muted flex items-center justify-center">
            <span className="text-xxs text-fg-dim">Foto</span>
          </div>

          {/* Name + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-xs">
              <span className="text-body font-semibold text-foreground truncate">{material.materialName}</span>
              <span className="shrink-0 bg-primary text-on-solid text-xxs px-sm rounded">KIT</span>
            </div>
            <div className="text-xs text-fg-dim mt-[2px] truncate">
              {material.materialCode && <>{material.materialCode}</>}
              {material.materialCode && material.packageName && <> &middot; </>}
              {material.packageName && <>{material.packageName}</>}
            </div>
          </div>

          {/* Progress bar section */}
          <div className="shrink-0 flex items-center gap-xs">
            <div className="w-[60px] h-[6px] rounded-pill bg-muted overflow-hidden">
              <div
                className="h-full rounded-pill bg-primary transition-all"
                style={{ width: material.totalCount > 0 ? `${(material.checkedCount / material.totalCount) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-primary font-bold text-xs whitespace-nowrap">
              {material.checkedCount}/{material.totalCount}
            </span>
          </div>

          {/* Action buttons */}
          <div className="shrink-0 flex gap-[4px]">
            <button
              type="button"
              onClick={onConference}
              className="w-[28px] h-[28px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
              title="Conferir"
            >
              <TickSquare size={14} color="var(--fg-muted)" />
            </button>
            <button
              type="button"
              onClick={onImages}
              className="w-[28px] h-[28px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
              title="Imagens"
            >
              <Camera size={14} color="var(--fg-muted)" />
            </button>
            <button
              type="button"
              onClick={onRegister}
              className="w-[28px] h-[28px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
              title="Registrar"
            >
              <Edit2 size={14} color="var(--fg-muted)" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="w-[28px] h-[28px] rounded-xs border border-destructive/40 flex items-center justify-center bg-transparent cursor-pointer hover-destructive-subtle transition-colors"
              title="Remover"
            >
              <Trash size={14} color="var(--destructive)" />
            </button>
          </div>
        </div>

        {/* Accordion: submaterials */}
        <div className="mt-sm">
          <button
            type="button"
            onClick={() => setExpanded(prev => !prev)}
            className="text-xxs text-primary font-semibold cursor-pointer bg-transparent border-none p-0 hover:underline"
          >
            {expanded ? 'Ocultar' : 'Ver'} submateriais ({subs.length})
          </button>

          {expanded && (
            <div className="mt-xs max-h-[120px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-sm gap-y-[4px]">
                {subs.map(sub => {
                  // For demo, treat as unchecked (yellow circle)
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
      </div>
    )
  }

  // -- AVULSO / QUANTIDADE card
  return (
    <div className="rounded-sm border border-border bg-card p-sm">
      <div className="flex items-center gap-sm">
        {/* Thumbnail */}
        <div className="w-[44px] h-[44px] shrink-0 rounded-sm bg-muted flex items-center justify-center">
          <span className="text-xxs text-fg-dim">Foto</span>
        </div>

        {/* Name + info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-xs">
            <span className="text-body font-semibold text-foreground truncate">{material.materialName}</span>
            <span className="shrink-0 bg-muted text-fg-dim text-xxs px-sm rounded">{material.materialType}</span>
          </div>
          <div className="text-xs text-fg-dim mt-[2px] truncate">
            {material.materialCode && <>{material.materialCode}</>}
            {material.materialCode && material.packageName && <> &middot; </>}
            {material.packageName && <>{material.packageName}</>}
          </div>
        </div>

        {/* Quantity control */}
        <div className="shrink-0 flex items-center gap-[2px]">
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

        {/* Action buttons (no Conferir) */}
        <div className="shrink-0 flex gap-[4px]">
          <button
            type="button"
            onClick={onImages}
            className="w-[28px] h-[28px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
            title="Imagens"
          >
            <Camera size={14} color="var(--fg-muted)" />
          </button>
          <button
            type="button"
            onClick={onRegister}
            className="w-[28px] h-[28px] rounded-xs border border-border flex items-center justify-center bg-transparent cursor-pointer hover-elevated transition-colors"
            title="Registrar"
          >
            <Edit2 size={14} color="var(--fg-muted)" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="w-[28px] h-[28px] rounded-xs border border-destructive/40 flex items-center justify-center bg-transparent cursor-pointer hover-destructive-subtle transition-colors"
            title="Remover"
          >
            <Trash size={14} color="var(--destructive)" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { EntradaMaterialCard }
export type { EntradaMaterialCardProps }
