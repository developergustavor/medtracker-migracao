// packages
import { useEffect, useRef } from 'react'
import { Copy, Trash, DocumentCopy, ArrowUp, ArrowDown } from 'iconsax-react'

const _loc = '@/pages/cadastros/editor/ContextMenu'

type ContextMenuProps = {
  x: number
  y: number
  onClose: () => void
  onCut: () => void
  onCopy: () => void
  onPaste: () => void
  onDuplicate: () => void
  onDelete: () => void
  onGroup: () => void
  onUngroup: () => void
  onLock: () => void
  onBringForward: () => void
  onSendBackward: () => void
  isLocked: boolean
  hasSelection: boolean
  canUngroup: boolean
}

type MenuItem = {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  separator?: boolean
}

function ContextMenu({
  x, y, onClose, onCut, onCopy, onPaste, onDuplicate, onDelete,
  onGroup, onUngroup, onLock, onBringForward, onSendBackward,
  isLocked, hasSelection, canUngroup
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const items: MenuItem[] = [
    { label: 'Recortar', shortcut: 'Ctrl+X', icon: <Copy size={14} color="currentColor" />, onClick: () => { onCut(); onClose() }, disabled: !hasSelection },
    { label: 'Copiar', shortcut: 'Ctrl+C', icon: <Copy size={14} color="currentColor" />, onClick: () => { onCopy(); onClose() }, disabled: !hasSelection },
    { label: 'Colar', shortcut: 'Ctrl+V', icon: <DocumentCopy size={14} color="currentColor" />, onClick: () => { onPaste(); onClose() } },
    { label: 'Duplicar', shortcut: 'Ctrl+D', icon: <DocumentCopy size={14} color="currentColor" />, onClick: () => { onDuplicate(); onClose() }, disabled: !hasSelection },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Agrupar', shortcut: 'Ctrl+G', onClick: () => { onGroup(); onClose() }, disabled: !hasSelection },
    { label: 'Desagrupar', shortcut: 'Ctrl+Shift+G', onClick: () => { onUngroup(); onClose() }, disabled: !canUngroup },
    { label: isLocked ? 'Desbloquear' : 'Bloquear', onClick: () => { onLock(); onClose() }, disabled: !hasSelection },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Trazer para frente', icon: <ArrowUp size={14} color="currentColor" />, onClick: () => { onBringForward(); onClose() }, disabled: !hasSelection },
    { label: 'Enviar para trás', icon: <ArrowDown size={14} color="currentColor" />, onClick: () => { onSendBackward(); onClose() }, disabled: !hasSelection },
    { label: '', separator: true, onClick: () => {} },
    { label: 'Excluir', shortcut: 'Del', icon: <Trash size={14} color="currentColor" />, onClick: () => { onDelete(); onClose() }, disabled: !hasSelection, destructive: true }
  ]

  return (
    <div
      ref={ref}
      className="fixed bg-popover border border-popover rounded-md shadow-popover py-[4px] min-w-[200px]"
      style={{ left: x, top: y, zIndex: 9999 }}
    >
      {items.map((item, i) => {
        if (item.separator) return <div key={i} className="separator-h my-[3px] mx-sm" />
        return (
          <button
            key={i}
            type="button"
            onClick={item.onClick}
            disabled={item.disabled}
            className={`w-full flex items-center gap-sm px-md py-[5px] text-xs border-none cursor-pointer transition-colors text-left ${
              item.disabled ? 'opacity-30 cursor-not-allowed' : 'hover-nav'
            } ${item.destructive ? 'text-destructive' : 'text-foreground'} bg-transparent`}
          >
            {item.icon && <span className="shrink-0 w-[16px]">{item.icon}</span>}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && <span className="text-xxs text-fg-dim">{item.shortcut}</span>}
          </button>
        )
      })}
    </div>
  )
}

export { ContextMenu }
