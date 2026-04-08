// packages
import { Loader2 } from 'lucide-react'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const _loc = '@/components/domain/ConfirmDialog'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  loading?: boolean
  confirmLabel?: string
  variant?: 'destructive' | 'default'
}

function ConfirmDialog({ open, onClose, onConfirm, title, description, loading = false, confirmLabel = 'Confirmar', variant = 'default' }: ConfirmDialogProps) {
  const isDestructive = variant === 'destructive'

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent
        className="sm:max-w-[420px] rounded-md"
      >
        <DialogHeader>
          <DialogTitle className="text-heading" style={{ color: 'var(--fg)' }}>
            {title}
          </DialogTitle>
          <DialogDescription className="text-body mt-sm" style={{ color: 'var(--fg-muted)' }}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={cn(
              'inline-flex items-center justify-center font-medium transition-colors',
              'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
              'rounded-sm text-body bg-transparent px-lg'
            )}
            style={{
              height: 36,
              border: '1px solid var(--border-subtle)',
              color: 'var(--fg-secondary)'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex items-center justify-center gap-2 font-medium transition-colors',
              'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
              'rounded-sm text-body px-lg border-none',
              isDestructive ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'
            )}
            style={{ height: 36 }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmDialog }
export type { ConfirmDialogProps }
