// packages
import { useState, useMemo } from 'react'
import { TickCircle, CloseCircle, SearchNormal1 } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// libs
import { cn } from '@/libs/shadcn.utils'

// mock
import { mockCmes } from '@/mock'

const _loc = '@/pages/cadastros/editor/TemplateCmeLinker'

type TemplateCmeLinkerProps = {
  open: boolean
  onClose: () => void
  templateName: string
  linkedCmeIds: number[]
  onToggleCme: (cmeId: number) => void
}

function TemplateCmeLinker({ open, onClose, templateName, linkedCmeIds, onToggleCme }: TemplateCmeLinkerProps) {
  const [search, setSearch] = useState('')

  const filteredCmes = useMemo(() => {
    const cmes = mockCmes || []
    if (!search.trim()) return cmes
    const term = search.toLowerCase()
    return cmes.filter((c: { corporateName: string; module: string }) =>
      c.corporateName.toLowerCase().includes(term) ||
      c.module.toLowerCase().includes(term)
    )
  }, [search])

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-heading text-foreground">
            Vincular CMEs — {templateName}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <SearchNormal1 size={14} color="var(--fg-muted)" className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar CME..."
            className="pl-[32px] text-body"
            style={{ height: 36 }}
          />
        </div>

        {/* CME list */}
        <div className="flex flex-col gap-xs max-h-[400px] overflow-y-auto">
          {filteredCmes.map(cme => {
            const isLinked = linkedCmeIds.includes(cme.id)
            return (
              <button
                key={cme.id}
                type="button"
                onClick={() => onToggleCme(cme.id)}
                className={cn(
                  'flex items-center gap-md px-md py-sm rounded-sm border cursor-pointer transition-colors text-left',
                  isLinked
                    ? 'bg-primary-8 border-primary-20'
                    : 'bg-transparent border-subtle hover-nav'
                )}
              >
                {isLinked
                  ? <TickCircle size={18} color="var(--primary)" variant="Bold" />
                  : <CloseCircle size={18} color="var(--fg-dim)" variant="Linear" />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-body text-foreground font-medium truncate">{cme.corporateName}</div>
                  <div className="text-caption text-muted-foreground">{cme.module}</div>
                </div>
              </button>
            )
          })}
          {filteredCmes.length === 0 && (
            <div className="text-center py-lg text-muted-foreground text-caption">
              Nenhuma CME encontrada
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-sm border-t border-separator text-xs text-muted-foreground">
          <span>{linkedCmeIds.length} CME(s) vinculada(s)</span>
          <button type="button" onClick={onClose} className="text-primary bg-transparent border-none cursor-pointer text-xs font-medium">
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { TemplateCmeLinker }
