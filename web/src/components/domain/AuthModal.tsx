// packages
import { useState, useEffect, useCallback } from 'react'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

// mock
import { mockUsers } from '@/mock/data'

const _loc = '@/components/domain/AuthModal'

type AuthModalProps = {
  open: boolean
  onClose: () => void
  onAuthenticate: (userId: number, userName: string, remember: boolean) => void
  rememberedUserId?: number | null
}

function AuthModalInner({ onClose, onAuthenticate }: Pick<AuthModalProps, 'onClose' | 'onAuthenticate'>) {
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState(false)

  const handleConfirm = useCallback(() => {
    const user = mockUsers.find(u => u.code === code)
    if (!user) {
      setError(true)
      return
    }
    setError(false)
    onAuthenticate(user.id, user.name, remember)
  }, [code, remember, onAuthenticate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
  }, [handleConfirm])

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-heading" style={{ color: 'var(--fg)' }}>
          Autenticar para registrar
        </DialogTitle>
        <DialogDescription className="text-body mt-sm" style={{ color: 'var(--fg-muted)' }}>
          Informe seu código para registrar este material.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-md mt-sm">
        <Input
          value={code}
          onChange={e => {
            setCode(e.target.value)
            if (error) setError(false)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Código do usuário"
          autoFocus
        />
        {error && (
          <p className="text-xs text-destructive mt-xs">Usuário não encontrado</p>
        )}

        <div className="flex items-center gap-sm">
          <Checkbox
            id="auth-remember"
            checked={remember}
            onCheckedChange={checked => setRemember(checked === true)}
          />
          <Label htmlFor="auth-remember" className="text-body cursor-pointer" style={{ color: 'var(--fg-secondary)' }}>
            Lembrar de mim nesta sessão
          </Label>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
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
          onClick={handleConfirm}
          className={cn(
            'inline-flex items-center justify-center gap-2 font-medium transition-colors',
            'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
            'rounded-sm text-body px-lg border-none',
            'bg-primary text-primary-foreground'
          )}
          style={{ height: 36 }}
        >
          Confirmar
        </button>
      </DialogFooter>
    </>
  )
}

function AuthModal({ open, onClose, onAuthenticate, rememberedUserId }: AuthModalProps) {
  // Auto-authenticate when rememberedUserId is set
  useEffect(() => {
    if (!open) return
    if (rememberedUserId != null) {
      const user = mockUsers.find(u => u.id === rememberedUserId)
      if (user) {
        onAuthenticate(user.id, user.name, true)
      }
    }
  }, [open, rememberedUserId, onAuthenticate])

  // If rememberedUserId is set, don't render dialog
  if (rememberedUserId != null) return null

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent className="sm:max-w-[420px] rounded-md">
        {/* Key forces fresh state on each open */}
        {open && (
          <AuthModalInner
            onClose={onClose}
            onAuthenticate={onAuthenticate}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { AuthModal }
export type { AuthModalProps }
