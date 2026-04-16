// packages
import { useState, useRef, useCallback, useMemo } from 'react'
import { SearchNormal1, Add, Lock1, DocumentText, Box1 } from 'iconsax-react'

// components
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { EntradaMaterialCard } from './EntradaMaterialCard'

// mock
import { mockMaterials } from '@/mock/data'

// types
import type { EntryMaterialProps } from '@/entities'

const _loc = '@/pages/entrada/EntradaMaterialList'

type EntradaMaterialListProps = {
  materials: EntryMaterialProps[]
  isFormValid: boolean
  onAddMaterial: (code: string) => void
  onConference: (index: number) => void
  onImages: (index: number) => void
  onRegister: (index: number) => void
  onRemove: (index: number) => void
  onAmountChange: (index: number, amount: number) => void
  onReport: () => void
  getCheckedSubmaterials: (materialId: number) => Record<number, number>
}

function EntradaMaterialList({
  materials,
  isFormValid,
  onAddMaterial,
  onConference,
  onImages,
  onRegister,
  onRemove,
  onAmountChange,
  onReport,
  getCheckedSubmaterials
}: EntradaMaterialListProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const registeredCount = materials.filter(m => m.recorded).length
  const firstKitIndex = useMemo(() => materials.findIndex(m => m.materialType === 'KIT'), [materials])

  const activeMaterials = useMemo(() => mockMaterials.filter(m => m.status === 'ATIVO'), [])

  const typeBadgeColors: Record<string, { bg: string; text: string }> = {
    KIT: { bg: 'var(--primary)', text: 'white' },
    AVULSO: { bg: 'var(--muted)', text: 'var(--fg-dim)' },
    QUANTIDADE: { bg: 'var(--muted)', text: 'var(--fg-dim)' }
  }

  const handleSelectMaterial = useCallback((code: string) => {
    onAddMaterial(code)
    setInputValue('')
    setOpen(false)
    inputRef.current?.focus()
  }, [onAddMaterial])

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const exactMatch = mockMaterials.find(m => m.status === 'ATIVO' && m.code === trimmed)
    if (exactMatch) {
      onAddMaterial(exactMatch.code!)
    } else {
      onAddMaterial(trimmed)
    }

    setInputValue('')
    setOpen(false)
    inputRef.current?.focus()
  }, [inputValue, onAddMaterial])

  return (
    <div className="relative flex flex-col h-full">
      {/* Disabled overlay */}
      {!isFormValid && (
        <div className="absolute inset-0 bg-background/60 z-10 flex flex-col items-center justify-center gap-sm">
          <Lock1 size={32} color="var(--fg-dim)" />
          <span className="text-body text-fg-dim text-center px-lg">
            Preencha os dados da entrada para adicionar materiais
          </span>
        </div>
      )}

      {/* Scan bar */}
      <div className="shrink-0 px-md pt-md pb-sm sticky top-0 z-[5] bg-background">
        <div className="flex items-center gap-sm">
          <Popover open={open && isFormValid} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
              <div className="relative flex-1">
                <SearchNormal1
                  size={16}
                  color="var(--fg-muted)"
                  className="absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none z-[1]"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => {
                    setInputValue(e.target.value)
                    setOpen(true)
                  }}
                  onFocus={() => setOpen(true)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setOpen(false); return }
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="Bipar código ou buscar material..."
                  className="w-full pl-[36px] pr-[14px] py-[10px] text-body bg-input border-2 border-primary rounded-[10px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus={isFormValid}
                  disabled={!isFormValid}
                />
              </div>
            </PopoverAnchor>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandList>
                  <CommandEmpty>Nenhum resultado</CommandEmpty>
                  <CommandGroup>
                    {activeMaterials
                      .filter(m => {
                        const val = inputValue.trim().toLowerCase()
                        if (!val) return true
                        return m.name.toLowerCase().includes(val) || (m.code && m.code.toLowerCase().includes(val))
                      })
                      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                      .map(mat => {
                        const colors = typeBadgeColors[mat.type] || typeBadgeColors.AVULSO
                        return (
                          <CommandItem key={mat.id} value={mat.code || mat.name} onSelect={() => handleSelectMaterial(mat.code || mat.name)}>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium text-foreground truncate block">{mat.name}</span>
                              <span className="text-xxs text-fg-dim">{mat.code || '\u2014'}</span>
                            </div>
                            <span
                              className="shrink-0 px-[6px] py-[1px] rounded text-xxs font-bold"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {mat.type}
                            </span>
                          </CommandItem>
                        )
                      })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || !inputValue.trim()}
            className="w-[36px] h-[36px] shrink-0 bg-primary rounded-lg flex items-center justify-center cursor-pointer border-none transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Add size={18} color="white" />
          </button>
        </div>
      </div>

      {/* Material cards */}
      <div className="flex-1 overflow-y-auto px-md py-sm flex flex-col gap-md">
        {materials.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-lg py-3xl">
            <Box1 size={48} color="var(--fg-ghost)" />
            <div className="flex flex-col items-center gap-xs">
              <span className="text-body font-medium text-fg-dim">Nenhum material adicionado</span>
              <span className="text-caption text-fg-ghost">Bipe ou busque um material para começar</span>
            </div>
          </div>
        )}
        {materials.map((material, index) => (
          <EntradaMaterialCard
            key={material.id}
            material={material}
            onConference={() => onConference(index)}
            onImages={() => onImages(index)}
            onRegister={() => onRegister(index)}
            onRemove={() => onRemove(index)}
            onAmountChange={(amount) => onAmountChange(index, amount)}
            defaultExpanded={index === firstKitIndex}
            checkedSubmaterials={getCheckedSubmaterials(material.materialId)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-card px-lg py-sm flex items-center justify-between">
        <span className="text-xs text-fg-dim">
          {materials.length} materiais &middot; {registeredCount} registrados
        </span>
        <button
          type="button"
          onClick={onReport}
          className="flex items-center gap-xs text-primary text-xs font-medium border border-primary/20 rounded-sm px-sm py-[4px] bg-transparent cursor-pointer hover:bg-primary-8 transition-colors"
        >
          <DocumentText size={14} color="var(--primary)" />
          Relatório
        </button>
      </div>
    </div>
  )
}

export { EntradaMaterialList }
export type { EntradaMaterialListProps }
