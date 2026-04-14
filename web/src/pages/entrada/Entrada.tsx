// packages
import { useState, useEffect, useCallback } from 'react'

// components
import { EntradaForm } from './EntradaForm'
import { EntradaMaterialList } from './EntradaMaterialList'

// hooks
import { useIsDesktop } from '@/hooks'

// entities
import { entry_type } from '@/entities'

// mock
import { mockMaterials, mockSubmaterials, mockPackages } from '@/mock/data'

// types
import type { EntryFormData, EntryMaterialProps } from '@/entities'

const _loc = '@/pages/entrada/Entrada'

function Entrada() {
  const isDesktop = useIsDesktop()

  // -- Form state
  const [formData, setFormData] = useState<EntryFormData>({
    type: '' as entry_type,
    departmentId: '',
    sourceCmeId: '',
    doctorId: '',
    patientId: '',
    procedureDate: '',
    procedureTime: '',
    ownerId: '',
    ownerType: ''
  })
  const [materialsAdded, setMaterialsAdded] = useState(false)
  const [_drawerEntity, setDrawerEntity] = useState<'doctor' | 'patient' | 'owner' | null>(null)

  const isFormValid = !!(formData.type && (formData.departmentId || formData.sourceCmeId))

  // -- Materials state
  const [materials, setMaterials] = useState<EntryMaterialProps[]>([])

  const handleFormChange = useCallback((partial: Partial<EntryFormData>) => {
    setFormData(prev => ({ ...prev, ...partial }))
  }, [])

  const handleNewEntry = useCallback(() => {
    window.location.reload()
  }, [])

  const handleReport = useCallback(() => {
    // TODO: open report dialog
    console.log(`[${_loc}] report`)
  }, [])

  const handleAddMaterial = useCallback((code: string) => {
    const found = mockMaterials.find(m => m.code === code || m.name.toLowerCase().includes(code.toLowerCase()))
    if (!found) return // TODO: show not-found feedback

    const pkg = mockPackages.find(p => p.id === found.packageId)
    const subs = found.type === 'KIT' ? mockSubmaterials.filter(s => s.materialId === found.id) : []

    const newMaterial: EntryMaterialProps = {
      id: Date.now(),
      materialId: found.id,
      materialName: found.name,
      materialCode: found.code,
      materialType: found.type,
      packageName: pkg?.name || null,
      amount: found.amount || 1,
      images: [],
      recorded: false,
      recordedBy: null,
      recordedAt: null,
      checkedCount: 0,
      totalCount: subs.reduce((sum, s) => sum + s.amount, 0)
    }

    setMaterials(prev => [...prev, newMaterial])
    if (!materialsAdded) setMaterialsAdded(true)
  }, [materialsAdded])

  const handleRemoveMaterial = useCallback((index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAmountChange = useCallback((index: number, amount: number) => {
    setMaterials(prev => prev.map((m, i) => i === index ? { ...m, amount } : m))
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
          <EntradaForm
            formData={formData}
            onChange={handleFormChange}
            materialsAdded={materialsAdded}
            onCreateInline={setDrawerEntity}
          />
        </div>
      )}

      {/* Right: materials area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <EntradaMaterialList
          materials={materials}
          isFormValid={isFormValid}
          onAddMaterial={handleAddMaterial}
          onConference={(i) => console.log('conference', i)}
          onImages={(i) => console.log('images', i)}
          onRegister={(i) => console.log('register', i)}
          onRemove={handleRemoveMaterial}
          onAmountChange={handleAmountChange}
        />
      </div>
    </div>
  )
}

export { Entrada }
