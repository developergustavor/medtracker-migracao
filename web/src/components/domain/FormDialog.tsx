// packages
import { Loader2 } from 'lucide-react'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const _loc = '@/components/domain/FormDialog'

type FormDialogProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: () => void
  loading?: boolean
  submitLabel?: string
  maxWidth?: number
}

function FormDialog({ open, onClose, title, description, children, onSubmit, loading = false, submitLabel = 'Salvar', maxWidth = 540 }: FormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent
        style={{
          maxWidth,
          borderRadius: 'var(--radius-md)'
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontSize: 'var(--text-heading)',
              color: 'var(--fg)'
            }}
          >
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--fg-muted)',
                marginTop: 'var(--space-xs)'
              }}
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4" style={{ marginTop: 'var(--space-sm)' }}>
            {children}
          </div>

          <DialogFooter className="gap-2 sm:gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                'inline-flex items-center justify-center font-medium transition-colors',
                'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              style={{
                height: 36,
                padding: '0 var(--space-lg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-body)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--fg-secondary)'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'inline-flex items-center justify-center gap-2 font-medium transition-colors',
                'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              style={{
                height: 36,
                padding: '0 var(--space-lg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-body)',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-70))',
                color: 'var(--primary-fg)',
                border: 'none'
              }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { FormDialog }
export type { FormDialogProps }
