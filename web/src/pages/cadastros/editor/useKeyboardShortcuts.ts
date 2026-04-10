import { useEffect, useCallback } from 'react'

const _loc = '@/pages/cadastros/editor/useKeyboardShortcuts'

type ShortcutHandlers = {
  onDelete: () => void
  onCopy: () => void
  onPaste: () => void
  onSelectAll: () => void
  onUndo: () => void
  onRedo: () => void
  onDuplicate: () => void
  onEscape: () => void
  onGroup: () => void
  onUngroup: () => void
}

export function useKeyboardShortcuts(
  containerRef: React.RefObject<HTMLElement | null>,
  handlers: ShortcutHandlers,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    // Don't capture if user is typing in an input/textarea
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

    const ctrl = e.ctrlKey || e.metaKey
    const shift = e.shiftKey

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault()
        handlers.onDelete()
        break
      case 'c':
        if (ctrl) { e.preventDefault(); handlers.onCopy() }
        break
      case 'v':
        if (ctrl) { e.preventDefault(); handlers.onPaste() }
        break
      case 'a':
        if (ctrl) { e.preventDefault(); handlers.onSelectAll() }
        break
      case 'z':
        if (ctrl && shift) { e.preventDefault(); handlers.onRedo() }
        else if (ctrl) { e.preventDefault(); handlers.onUndo() }
        break
      case 'y':
        if (ctrl) { e.preventDefault(); handlers.onRedo() }
        break
      case 'd':
        if (ctrl) { e.preventDefault(); handlers.onDuplicate() }
        break
      case 'Escape':
        handlers.onEscape()
        break
      case 'g':
        if (ctrl && shift) { e.preventDefault(); handlers.onUngroup() }
        else if (ctrl) { e.preventDefault(); handlers.onGroup() }
        break
    }
  }, [enabled, handlers])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, handleKeyDown])
}
