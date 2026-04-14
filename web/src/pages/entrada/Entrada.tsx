// packages
import { useEffect, useCallback } from 'react'

// hooks
import { useIsDesktop } from '@/hooks'

const _loc = '@/pages/entrada/Entrada'

function Entrada() {
  const isDesktop = useIsDesktop()

  const handleNewEntry = useCallback(() => {
    window.location.reload()
  }, [])

  const handleReport = useCallback(() => {
    // TODO: open report dialog
    console.log(`[${_loc}] report`)
  }, [])

  // Listen for contextual-action events
  useEffect(() => {
    const handler = (e: Event) => {
      const actionId = (e as CustomEvent).detail as string
      if (actionId === 'new-entry') handleNewEntry()
      if (actionId === 'report') handleReport()
    }
    window.addEventListener('contextual-action', handler)
    return () => window.removeEventListener('contextual-action', handler)
  }, [handleNewEntry, handleReport])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: form panel */}
      {isDesktop && (
        <div className="w-[320px] shrink-0 border-r border-border bg-card overflow-y-auto">
          <div className="p-lg text-center text-muted-foreground text-body">Form placeholder</div>
        </div>
      )}

      {/* Right: materials area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <div className="p-lg text-center text-muted-foreground text-body">Materials placeholder</div>
      </div>
    </div>
  )
}

export { Entrada }
