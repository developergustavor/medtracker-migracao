// packages
import { useState, useCallback } from 'react'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const _loc = '@/components/domain/CreateInlineDrawer'

type CreateInlineDrawerProps = {
  open: boolean
  entityType: 'doctor' | 'patient' | 'owner' | null
  onClose: () => void
  onCreated: (entity: { id: number; name: string; type?: string }) => void
}

const ENTITY_CONFIG = {
  doctor: { title: 'Novo Médico', description: 'Preencha os dados para criar um novo médico.' },
  patient: { title: 'Novo Paciente', description: 'Preencha os dados para criar um novo paciente.' },
  owner: { title: 'Novo Terceiro', description: 'Preencha os dados para criar um novo terceiro.' }
} as const

type DrawerFormProps = {
  entityType: 'doctor' | 'patient' | 'owner'
  onClose: () => void
  onCreated: (entity: { id: number; name: string; type?: string }) => void
}

function DrawerForm({ entityType, onClose, onCreated }: DrawerFormProps) {
  const fullLoc = `${_loc}/DrawerForm`

  const [name, setName] = useState('')
  const [ownerType, setOwnerType] = useState('')

  const config = ENTITY_CONFIG[entityType]

  const isValid = entityType === 'owner'
    ? name.trim().length > 0 && ownerType.length > 0
    : name.trim().length > 0

  const handleSave = useCallback(() => {
    if (!isValid) return
    const entity: { id: number; name: string; type?: string } = {
      id: Date.now(),
      name: name.trim()
    }
    if (entityType === 'owner' && ownerType) {
      entity.type = ownerType
    }
    console.log(`[${fullLoc}] created ${entityType}:`, entity)
    onCreated(entity)
  }, [isValid, entityType, name, ownerType, fullLoc, onCreated])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault()
      handleSave()
    }
  }, [isValid, handleSave])

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-heading" style={{ color: 'var(--fg)' }}>
          {config.title}
        </SheetTitle>
        <SheetDescription className="text-body mt-sm" style={{ color: 'var(--fg-muted)' }}>
          {config.description}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-4 py-4 flex-1">
        {/* Nome field - all entity types */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-caption text-foreground font-medium">Nome</Label>
          <Input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={entityType === 'doctor' ? 'Nome do médico' : entityType === 'patient' ? 'Nome do paciente' : 'Nome do terceiro'}
            style={{ height: 38 }}
          />
        </div>

        {/* Tipo field - only for owner */}
        {entityType === 'owner' && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-caption text-foreground font-medium">Tipo</Label>
            <Select value={ownerType} onValueChange={setOwnerType}>
              <SelectTrigger style={{ height: 38 }}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDICO">Médico</SelectItem>
                <SelectItem value="EMPRESA">Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <SheetFooter className="gap-2 sm:gap-2 mt-2">
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
          onClick={handleSave}
          disabled={!isValid}
          className={cn(
            'inline-flex items-center justify-center font-medium transition-colors',
            'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
            'rounded-sm text-body px-lg border-none',
            'bg-primary text-primary-foreground'
          )}
          style={{ height: 36 }}
        >
          Salvar
        </button>
      </SheetFooter>
    </>
  )
}

function CreateInlineDrawer({ open, entityType, onClose, onCreated }: CreateInlineDrawerProps) {
  if (!entityType) return null

  return (
    <Sheet open={open} onOpenChange={val => !val && onClose()}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[380px] flex flex-col">
        {/* Key on entityType forces remount, resetting form state */}
        <DrawerForm
          key={entityType}
          entityType={entityType}
          onClose={onClose}
          onCreated={onCreated}
        />
      </SheetContent>
    </Sheet>
  )
}

export { CreateInlineDrawer }
export type { CreateInlineDrawerProps }
