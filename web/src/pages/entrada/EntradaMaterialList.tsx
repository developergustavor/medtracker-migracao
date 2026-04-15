// packages
import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { SearchNormal1, Add, Lock1, DocumentText } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
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
  onReport
}: EntradaMaterialListProps) {
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const registeredCount = materials.filter(m => m.recorded).length
  const firstKitIndex = useMemo(() => materials.findIndex(m => m.materialType === 'KIT'), [materials])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered mock materials for combobox
  const filteredMaterials = useMemo(() => {
    const val = inputValue.trim().toLowerCase()
    if (!val) return mockMaterials.filter(m => m.status === 'ATIVO')
    return mockMaterials.filter(m =>
      m.status === 'ATIVO' && (
        m.name.toLowerCase().includes(val) ||
        (m.code && m.code.toLowerCase().includes(val))
      )
    )
  }, [inputValue])

  const handleSelectMaterial = useCallback((code: string) => {
    onAddMaterial(code)
    setInputValue('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }, [onAddMaterial])

  const handleSubmit = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    // Try exact code match first
    const exactMatch = mockMaterials.find(m => m.status === 'ATIVO' && m.code === trimmed)
    if (exactMatch) {
      onAddMaterial(exactMatch.code!)
    } else {
      onAddMaterial(trimmed)
    }

    setInputValue('')
    setShowDropdown(false)
    inputRef.current?.focus()
  }, [inputValue, onAddMaterial])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const typeBadgeColors: Record<string, { bg: string; text: string }> = {
    KIT: { bg: 'var(--primary)', text: 'white' },
    AVULSO: { bg: 'var(--muted)', text: 'var(--fg-dim)' },
    QUANTIDADE: { bg: 'var(--muted)', text: 'var(--fg-dim)' }
  }

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
          <div className="relative flex-1">
            <SearchNormal1
              size={16}
              color="var(--fg-muted)"
              className="absolute left-[12px] top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Bipar código ou buscar material..."
              className="pl-[36px] !border-2 !border-primary !rounded-[10px]"
              style={{ padding: '10px 14px 10px 36px' }}
              autoFocus={isFormValid}
              disabled={!isFormValid}
            />

            {/* Combobox dropdown */}
            {showDropdown && isFormValid && inputValue.trim() && filteredMaterials.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-[4px] z-50 max-h-[240px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
              >
                {filteredMaterials.map(mat => {
                  const colors = typeBadgeColors[mat.type] || typeBadgeColors.AVULSO
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => handleSelectMaterial(mat.code || mat.name)}
                      className="w-full flex items-center gap-sm px-sm py-[8px] text-left hover:bg-elevated transition-colors cursor-pointer border-none bg-transparent"
                    >
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
                    </button>
                  )
                })}
              </div>
            )}
          </div>
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
          <div className="flex-1 flex items-center justify-center">
            <span className="text-body text-fg-dim">Nenhum material adicionado</span>
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
