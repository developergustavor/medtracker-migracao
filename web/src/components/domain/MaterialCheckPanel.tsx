// packages
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { CloseCircle, TickCircle, SearchNormal1 } from 'iconsax-react'

// components
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'

// -- Types

export type CheckItem = {
  id: number
  code: string
  name: string
  amount: number
  checkedAmount: number
  images: string[]
}

export type MaterialCheckPanelProps = {
  materialName: string
  items: CheckItem[]
  onUpdate: (items: CheckItem[]) => void
  onClose: () => void
}

// -- Helpers

type ItemStatus = 'pending' | 'partial' | 'complete'

function getStatus(item: CheckItem): ItemStatus {
  if (item.checkedAmount <= 0) return 'pending'
  if (item.checkedAmount >= item.amount) return 'complete'
  return 'partial'
}

const statusConfig: Record<ItemStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: '#fef3c7', text: '#d97706', label: 'PENDENTE' },
  partial: { bg: '#fff7ed', text: '#ea580c', label: 'PARCIAL' },
  complete: { bg: '#dcfce7', text: '#16a34a', label: 'COMPLETO' }
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 880
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.1)
  } catch {
    // AudioContext not available
  }
}

// -- Component

function MaterialCheckPanel({ materialName, items, onUpdate, onClose }: MaterialCheckPanelProps) {
  // Local state for items
  const [localItems, setLocalItems] = useState<CheckItem[]>(items)
  const [scanValue, setScanValue] = useState('')
  const [scanError, setScanError] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [tooltipId, setTooltipId] = useState<number | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync items from parent when they change reference
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  // Clean up tooltip timer
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    }
  }, [])

  // -- Derived values
  const totalAmount = useMemo(() => localItems.reduce((s, i) => s + i.amount, 0), [localItems])
  const totalChecked = useMemo(() => localItems.reduce((s, i) => s + i.checkedAmount, 0), [localItems])
  const progressPct = totalAmount > 0 ? Math.min(100, (totalChecked / totalAmount) * 100) : 0

  // Sorted items: pending first, then partial, then complete
  const { pendingPartial, complete } = useMemo(() => {
    const pending: CheckItem[] = []
    const partial: CheckItem[] = []
    const comp: CheckItem[] = []
    for (const item of localItems) {
      const s = getStatus(item)
      if (s === 'pending') pending.push(item)
      else if (s === 'partial') partial.push(item)
      else comp.push(item)
    }
    return { pendingPartial: [...pending, ...partial], complete: comp }
  }, [localItems])

  const pendingNames = useMemo(() =>
    pendingPartial.filter(i => getStatus(i) === 'pending').map(i => i.name),
  [pendingPartial])

  const pendingCount = pendingNames.length

  const lastChecked = useMemo(() => {
    // Find the last item that has any checks
    const checked = localItems.filter(i => i.checkedAmount > 0)
    return checked.length > 0 ? checked[checked.length - 1] : null
  }, [localItems])

  // -- Mutation helper
  const updateItem = useCallback((itemId: number, delta: number) => {
    setLocalItems(prev => {
      const next = prev.map(i => {
        if (i.id !== itemId) return i
        const newChecked = Math.max(0, Math.min(i.amount, i.checkedAmount + delta))
        return { ...i, checkedAmount: newChecked }
      })
      onUpdate(next)
      return next
    })
  }, [onUpdate])

  // -- Scan handler
  const handleScan = useCallback(() => {
    const val = scanValue.trim()
    if (!val) return

    // Try exact code match
    let found = localItems.find(i => i.code === val)
    // Try partial name match
    if (!found) {
      found = localItems.find(i => i.name.toLowerCase().includes(val.toLowerCase()))
    }

    if (found) {
      updateItem(found.id, 1)
      setScanValue('')
      playBeep()
      setScanError(false)
    } else {
      setScanError(true)
      setTimeout(() => setScanError(false), 800)
    }
    scanRef.current?.focus()
  }, [scanValue, localItems, updateItem])

  const handleScanKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleScan()
    }
  }, [handleScan])

  // -- Click handlers
  const handleCardClick = useCallback((item: CheckItem) => {
    const status = getStatus(item)
    setSelectedId(prev => prev === item.id ? null : item.id)

    // Show tooltip for pending/partial
    if (status !== 'complete') {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
      setTooltipId(item.id)
      tooltipTimer.current = setTimeout(() => setTooltipId(null), 3000)
    }
  }, [])

  const handleCardDoubleClick = useCallback((item: CheckItem) => {
    console.log('TODO: open MaterialPreview for', item.name)
  }, [])

  // -- Dismiss tooltip on outside click
  const handlePanelClick = useCallback(() => {
    if (tooltipId !== null) {
      setTooltipId(null)
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    }
  }, [tooltipId])

  // -- Drag & Drop
  const handleDragStart = useCallback((e: React.DragEvent, item: CheckItem) => {
    setIsDragging(true)
    setDraggedItemId(item.id)
    e.dataTransfer.setData('text/plain', String(item.id))
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedItemId(null)
  }, [])

  const handleDropToChecked = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const itemId = Number(e.dataTransfer.getData('text/plain'))
    if (!isNaN(itemId)) {
      updateItem(itemId, 1)
    }
    setIsDragging(false)
    setDraggedItemId(null)
  }, [updateItem])

  const handleDropToUnchecked = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const itemId = Number(e.dataTransfer.getData('text/plain'))
    if (!isNaN(itemId)) {
      updateItem(itemId, -1)
    }
    setIsDragging(false)
    setDraggedItemId(null)
  }, [updateItem])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // Is the dragged item a complete item?
  const draggedItem = draggedItemId !== null ? localItems.find(i => i.id === draggedItemId) : null
  const isDraggingComplete = draggedItem ? getStatus(draggedItem) === 'complete' : false

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-[900px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden"
        onClick={handlePanelClick}
      >
        {/* Accessible title (visually hidden) */}
        <DialogTitle className="sr-only">Conferência - {materialName}</DialogTitle>
        <DialogDescription className="sr-only">
          Painel de conferência de submateriais do material {materialName}
        </DialogDescription>

        {/* 1. Scan bar + Progress (sticky top) */}
        <div className="shrink-0 px-lg pt-lg pb-sm border-b border-border bg-card">
          {/* Title row */}
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-subheading font-bold text-foreground truncate pr-lg">
              {materialName}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-[28px] h-[28px] flex items-center justify-center rounded-xs border-none bg-transparent cursor-pointer hover:bg-overlay-8 transition-colors"
            >
              <CloseCircle size={18} color="var(--fg-muted)" />
            </button>
          </div>

          {/* Scan input */}
          <div className="relative mb-sm">
            <SearchNormal1
              size={16}
              color="var(--fg-muted)"
              className="absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              ref={scanRef}
              type="text"
              value={scanValue}
              onChange={e => setScanValue(e.target.value)}
              onKeyDown={handleScanKeyDown}
              placeholder="Bipar código ou digitar nome do submaterial..."
              autoFocus
              className={`
                w-full h-[40px] pl-[36px] pr-md text-body bg-input rounded-[10px] border-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary/20
                ${scanError ? 'border-destructive' : 'border-primary'}
              `}
              style={{ color: 'var(--fg)' }}
            />
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-sm">
            <div className="flex-1 h-[8px] rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--primary-70))'
                }}
              />
            </div>
            <span className="text-primary font-bold text-sm shrink-0">
              {totalChecked}/{totalAmount}
            </span>
          </div>
        </div>

        {/* 2. Highlight strip */}
        <div
          className="shrink-0 px-lg py-sm flex items-center justify-between gap-sm"
          style={{
            backgroundColor: 'var(--primary-7)',
            borderBottom: '1px solid var(--primary-12)'
          }}
        >
          {/* Left: pending info */}
          <div className="flex items-center gap-sm min-w-0">
            <div className="w-[8px] h-[8px] rounded-full bg-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-primary">
                {pendingCount} submateriais faltando
              </span>
              {pendingNames.length > 0 && (
                <p className="text-xxs text-primary/60 truncate mt-[1px]">
                  {pendingNames.slice(0, 3).join(', ')}
                  {pendingNames.length > 3 && ` +${pendingNames.length - 3}`}
                </p>
              )}
            </div>
          </div>

          {/* Right: last checked badge */}
          {lastChecked && (
            <div
              className="shrink-0 flex items-center gap-xs px-sm py-[3px] rounded-sm text-xxs"
              style={{
                backgroundColor: 'var(--primary-8)',
                border: '1px solid var(--primary-15)',
                color: 'var(--primary)'
              }}
            >
              <span className="font-medium">Último conferido</span>
              <span className="font-bold truncate max-w-[120px]">
                {lastChecked.name} ({lastChecked.checkedAmount}/{lastChecked.amount})
              </span>
              <TickCircle size={12} color="var(--primary)" variant="Bold" />
            </div>
          )}
        </div>

        {/* 3. Grid of submaterial cards (scrollable) */}
        <div className="flex-1 overflow-y-auto px-lg py-md">
          {/* Uncheck drop zone — only when dragging a complete item */}
          {isDragging && isDraggingComplete && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropToUnchecked}
              className="mb-md border-2 border-dashed border-[#d97706] rounded-[10px] bg-[#d97706]/5 flex items-center justify-center gap-sm py-md text-xs text-[#d97706] font-medium transition-colors"
            >
              <span className="text-body">&#x2B06;</span>
              Solte aqui para desconferir
            </div>
          )}

          {/* Pending + Partial cards */}
          {pendingPartial.length > 0 && (
            <div className="grid grid-cols-1 mdAndUp:grid-cols-2 lgAndUp:grid-cols-3 gap-[10px]">
              {pendingPartial.map(item => (
                <CheckCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  showTooltip={tooltipId === item.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleCardClick}
                  onDoubleClick={handleCardDoubleClick}
                />
              ))}
            </div>
          )}

          {/* Separator between pending/partial and complete */}
          {complete.length > 0 && (
            <div className="flex items-center gap-sm my-lg">
              <div className="flex-1 h-[1px] bg-[#16a34a]/30" />
              <span className="text-xxs font-bold text-[#16a34a] uppercase tracking-wider shrink-0">
                Conferidos ({complete.length})
              </span>
              <div className="flex-1 h-[1px] bg-[#16a34a]/30" />
            </div>
          )}

          {/* Check drop zone — only when dragging a non-complete item */}
          {isDragging && !isDraggingComplete && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropToChecked}
              className="mb-md border-2 border-dashed border-[#16a34a] rounded-[10px] bg-[#16a34a]/5 flex items-center justify-center gap-sm py-md text-xs text-[#16a34a] font-medium transition-colors"
            >
              <span className="text-body">&#x2B07;</span>
              Solte aqui para marcar como conferido
            </div>
          )}

          {/* Complete cards */}
          {complete.length > 0 && (
            <div className="grid grid-cols-1 mdAndUp:grid-cols-2 lgAndUp:grid-cols-3 gap-[10px]">
              {complete.map(item => (
                <CheckCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  showTooltip={false}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleCardClick}
                  onDoubleClick={handleCardDoubleClick}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// -- CheckCard sub-component

type CheckCardProps = {
  item: CheckItem
  isSelected: boolean
  showTooltip: boolean
  onDragStart: (e: React.DragEvent, item: CheckItem) => void
  onDragEnd: () => void
  onClick: (item: CheckItem) => void
  onDoubleClick: (item: CheckItem) => void
}

function CheckCard({ item, isSelected, showTooltip, onDragStart, onDragEnd, onClick, onDoubleClick }: CheckCardProps) {
  const status = getStatus(item)
  const config = statusConfig[status]
  const isComplete = status === 'complete'

  return (
    <div className="relative">
      <div
        draggable
        onDragStart={(e) => onDragStart(e, item)}
        onDragEnd={onDragEnd}
        onClick={(e) => { e.stopPropagation(); onClick(item) }}
        onDoubleClick={() => onDoubleClick(item)}
        className={`
          flex items-center gap-sm p-sm rounded-lg cursor-grab transition-all duration-150
          ${isComplete ? 'bg-[#f0fdf4] opacity-75' : 'bg-card'}
          ${isSelected
            ? 'border-2 border-primary'
            : 'border border-border hover:border-primary'
          }
        `}
        style={isSelected ? { boxShadow: '0 0 0 3px rgba(33,85,252,0.08)' } : undefined}
      >
        {/* Thumbnail */}
        <div className="w-[52px] h-[52px] shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center">
          {item.images.length > 0 ? (
            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-xxs text-fg-dim">Foto</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
          <p className="text-xxs text-fg-dim truncate">{item.code || '\u2014'}</p>
          <span
            className="inline-flex items-center gap-[3px] px-[6px] py-[1px] rounded-pill text-xxs font-bold mt-[3px]"
            style={{ backgroundColor: config.bg, color: config.text }}
          >
            {item.checkedAmount}/{item.amount} {config.label}
          </span>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-[6px] z-tooltip px-sm py-[5px] rounded-md text-[10px] text-white whitespace-nowrap animate-fade-in"
          style={{ backgroundColor: '#1e293b' }}
        >
          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-[5px] w-0 h-0"
            style={{
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid #1e293b'
            }}
          />
          &#x2195; Arraste para Conferidos &middot; 2x para visualizar
        </div>
      )}
    </div>
  )
}

export { MaterialCheckPanel }
