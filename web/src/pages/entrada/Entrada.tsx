// packages
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ArrowDown2, DocumentText, Camera, CloseCircle } from 'iconsax-react'

// components
import { EntradaForm } from './EntradaForm'
import { EntradaMaterialList } from './EntradaMaterialList'
import { AuthModal, CreateInlineDrawer, MaterialCheckPanel } from '@/components/domain'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog'

// libs
import { cn } from '@/libs/shadcn.utils'

// store
import { useAuthStore } from '@/store'

// hooks
import { useIsDesktop } from '@/hooks'

// entities
import { entry_type } from '@/entities'

// mock
import { mockMaterials, mockSubmaterials, mockPackages } from '@/mock/data'

// types
import type { EntryFormData, EntryMaterialProps } from '@/entities'
import type { CheckItem } from '@/components/domain'

const _loc = '@/pages/entrada/Entrada'

function Entrada() {
  const isDesktop = useIsDesktop()
  const { cme } = useAuthStore()
  const isModuloCompleto = cme?.module === 'COMPLETO'

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
  const [drawerEntity, setDrawerEntity] = useState<'doctor' | 'patient' | 'owner' | null>(null)

  const isFormValid = !!(formData.type && (formData.departmentId || formData.sourceCmeId))

  // -- Mobile accordion state
  const [mobileFormExpanded, setMobileFormExpanded] = useState(!isFormValid)

  const filledCount = useMemo(() => {
    const fields = [formData.type, formData.departmentId || formData.sourceCmeId, formData.doctorId, formData.patientId, formData.procedureDate, formData.ownerId]
    return fields.filter(Boolean).length
  }, [formData])

  // -- Materials state
  const [materials, setMaterials] = useState<EntryMaterialProps[]>([])
  const hasRegisteredMaterial = useMemo(() => materials.some(m => m.recorded), [materials])

  // -- Auth state
  const [authTarget, setAuthTarget] = useState<number | null>(null)
  const [rememberedUserId, setRememberedUserId] = useState<number | null>(null)

  // -- Report dialog state
  const [reportOpen, setReportOpen] = useState(false)

  // -- Images dialog state
  const [imagesTarget, setImagesTarget] = useState<number | null>(null) // index of material
  const imagesFileRef = useRef<HTMLInputElement>(null)

  // -- Conference state
  const [conferenceTarget, setConferenceTarget] = useState<number | null>(null)
  const [conferenceItems, setConferenceItems] = useState<CheckItem[]>([])

  const handleFormChange = useCallback((partial: Partial<EntryFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...partial }
      // Auto-collapse mobile accordion when form becomes valid
      const willBeValid = !!(next.type && (next.departmentId || next.sourceCmeId))
      const wasValid = !!(prev.type && (prev.departmentId || prev.sourceCmeId))
      if (willBeValid && !wasValid) {
        setMobileFormExpanded(false)
      }
      return next
    })
  }, [])

  const handleInlineCreated = useCallback((entity: { id: number; name: string; type?: string }) => {
    if (drawerEntity === 'doctor') {
      setFormData(prev => ({ ...prev, doctorId: String(entity.id) }))
    } else if (drawerEntity === 'patient') {
      setFormData(prev => ({ ...prev, patientId: String(entity.id) }))
    } else if (drawerEntity === 'owner') {
      setFormData(prev => ({ ...prev, ownerId: String(entity.id), ownerType: entity.type || '' }))
    }
    setDrawerEntity(null)
  }, [drawerEntity])

  const handleNewEntry = useCallback(() => {
    window.location.reload()
  }, [])

  // TODO: implement report preview + export/download/print (was Electron in v1)
  const handleReport = useCallback(() => {
    setReportOpen(true)
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

    setMaterials(prev => {
      const newList = [...prev, newMaterial]
      // Auto-abrir conferência para KIT quando módulo é COMPLETO
      if (found.type === 'KIT' && isModuloCompleto) {
        const newIndex = newList.length - 1
        setTimeout(() => {
          setConferenceTarget(newIndex)
          setConferenceItems(subs.map(s => ({
            id: s.id, code: s.code, name: s.name, amount: s.amount, checkedAmount: 0, images: s.images || []
          })))
        }, 0)
      }
      return newList
    })
  }, [isModuloCompleto])

  const handleRemoveMaterial = useCallback((index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleAmountChange = useCallback((index: number, amount: number) => {
    setMaterials(prev => prev.map((m, i) => i === index ? { ...m, amount } : m))
  }, [])

  const handleRegisterClick = useCallback((index: number) => {
    setAuthTarget(index)
  }, [])

  const handleAuthenticate = useCallback((userId: number, userName: string, remember: boolean) => {
    if (authTarget === null) return
    if (remember) setRememberedUserId(userId)
    setMaterials(prev => prev.map((m, i) => i === authTarget ? {
      ...m,
      recorded: true,
      recordedBy: userName,
      recordedAt: new Date().toISOString()
    } : m))
    setAuthTarget(null)
  }, [authTarget])

  // -- Conference handlers
  const handleConferenceOpen = useCallback((index: number) => {
    setConferenceTarget(index)
    const material = materials[index]
    if (!material) return
    const subs = mockSubmaterials.filter(s => s.materialId === material.materialId)
    setConferenceItems(subs.map(s => ({
      id: s.id, code: s.code, name: s.name, amount: s.amount, checkedAmount: 0, images: s.images || []
    })))
  }, [materials])

  const handleConferenceUpdate = useCallback((updatedItems: CheckItem[]) => {
    if (conferenceTarget === null) return
    const totalChecked = updatedItems.reduce((sum, item) => sum + item.checkedAmount, 0)
    setConferenceItems(updatedItems)
    setMaterials(prev => prev.map((m, i) => i === conferenceTarget ? { ...m, checkedCount: totalChecked } : m))
  }, [conferenceTarget])

  const handleConferenceClose = useCallback(() => {
    setConferenceTarget(null)
    setConferenceItems([])
  }, [])

  // -- Images handlers
  const handleImagesClick = useCallback((index: number) => {
    setImagesTarget(index)
  }, [])

  const handleAddImage = useCallback((base64: string) => {
    if (imagesTarget === null) return
    setMaterials(prev => prev.map((m, i) => {
      if (i !== imagesTarget) return m
      if (m.images.length >= 3) return m
      return { ...m, images: [...m.images, base64] }
    }))
  }, [imagesTarget])

  const handleRemoveImage = useCallback((imgIndex: number) => {
    if (imagesTarget === null) return
    setMaterials(prev => prev.map((m, i) => {
      if (i !== imagesTarget) return m
      return { ...m, images: m.images.filter((_, j) => j !== imgIndex) }
    }))
  }, [imagesTarget])

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleAddImage(reader.result)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [handleAddImage])

  const imagesTargetMaterial = imagesTarget !== null ? materials[imagesTarget] : null


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
    <div className={`flex h-full overflow-hidden ${isDesktop ? 'flex-row' : 'flex-col'}`}>
      {/* Form panel */}
      {isDesktop ? (
        <div className="w-[320px] shrink-0 border-r border-border bg-card overflow-y-auto">
          <EntradaForm
            formData={formData}
            onChange={handleFormChange}
            materialsAdded={hasRegisteredMaterial}
            onCreateInline={setDrawerEntity}
          />
        </div>
      ) : (
        <div className="shrink-0 border-b border-border bg-card">
          <button
            type="button"
            onClick={() => setMobileFormExpanded(prev => !prev)}
            className="w-full flex items-center justify-between px-lg py-sm"
          >
            <span className="text-body font-semibold text-foreground">Dados da Entrada</span>
            <div className="flex items-center gap-sm">
              <span className="text-xs text-muted-foreground">{filledCount}/6 preenchidos</span>
              <ArrowDown2
                size={16}
                color="currentColor"
                className={`text-muted-foreground transition-transform duration-200 ${mobileFormExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </button>
          {mobileFormExpanded && (
            <div className="px-md pb-md overflow-y-auto max-h-[60vh]">
              <EntradaForm
                formData={formData}
                onChange={handleFormChange}
                materialsAdded={hasRegisteredMaterial}
                onCreateInline={setDrawerEntity}
              />
            </div>
          )}
        </div>
      )}

      {/* Materials area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <EntradaMaterialList
          materials={materials}
          isFormValid={isFormValid}
          onAddMaterial={handleAddMaterial}
          onConference={handleConferenceOpen}
          onImages={handleImagesClick}
          onRegister={handleRegisterClick}
          onRemove={handleRemoveMaterial}
          onAmountChange={handleAmountChange}
          onReport={handleReport}
        />
      </div>

      <AuthModal
        open={authTarget !== null}
        onClose={() => setAuthTarget(null)}
        onAuthenticate={handleAuthenticate}
        rememberedUserId={rememberedUserId}
      />

      <CreateInlineDrawer
        open={drawerEntity !== null}
        entityType={drawerEntity}
        onClose={() => setDrawerEntity(null)}
        onCreated={handleInlineCreated}
      />

      {conferenceTarget !== null && (
        <MaterialCheckPanel
          materialName={materials[conferenceTarget]?.materialName || ''}
          items={conferenceItems}
          onUpdate={handleConferenceUpdate}
          onClose={handleConferenceClose}
        />
      )}

      {/* Report placeholder dialog */}
      {/* TODO: implement report preview + export/download/print (was Electron in v1) */}
      <Dialog open={reportOpen} onOpenChange={val => !val && setReportOpen(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-md">
          <DialogHeader className="flex flex-col items-center text-center">
            <DocumentText size={48} color="var(--primary)" className="mb-sm" />
            <DialogTitle className="text-heading" style={{ color: 'var(--fg)' }}>
              Relatório de Entrada
            </DialogTitle>
            <DialogDescription className="text-body mt-sm" style={{ color: 'var(--fg-muted)' }}>
              Funcionalidade em desenvolvimento. Em breve será possível visualizar, exportar e imprimir o relatório da entrada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-2">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className={cn(
                'inline-flex items-center justify-center font-medium transition-colors',
                'hover:opacity-80 rounded-sm text-body bg-transparent px-lg'
              )}
              style={{
                height: 36,
                border: '1px solid var(--border-subtle)',
                color: 'var(--fg-secondary)'
              }}
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Images dialog */}
      <Dialog open={imagesTarget !== null} onOpenChange={val => !val && setImagesTarget(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-md">
          <DialogHeader>
            <DialogTitle className="text-heading" style={{ color: 'var(--fg)' }}>
              Imagens {imagesTargetMaterial ? `\u2014 ${imagesTargetMaterial.materialName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-md">
            {/* Image grid */}
            {imagesTargetMaterial && imagesTargetMaterial.images.length > 0 && (
              <div className="grid grid-cols-2 gap-sm">
                {imagesTargetMaterial.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative w-[100px] h-[100px] rounded-sm overflow-hidden border border-subtle">
                    <img src={img} alt={`Imagem ${imgIdx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(imgIdx)}
                      className="absolute top-[4px] right-[4px] w-[20px] h-[20px] rounded-full bg-destructive/80 flex items-center justify-center border-none cursor-pointer"
                    >
                      <CloseCircle size={12} color="white" variant="Bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add image button or max reached message */}
            {imagesTargetMaterial && imagesTargetMaterial.images.length >= 3 ? (
              <span className="text-xs text-fg-dim text-center">Máximo de 3 imagens</span>
            ) : (
              <>
                <input
                  ref={imagesFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <button
                  type="button"
                  onClick={() => imagesFileRef.current?.click()}
                  className={cn(
                    'inline-flex items-center justify-center gap-xs font-medium transition-colors',
                    'hover:opacity-80 rounded-sm text-body px-lg',
                    'bg-primary-8 text-primary border-none cursor-pointer'
                  )}
                  style={{ height: 36 }}
                >
                  <Camera size={16} color="var(--primary)" />
                  Adicionar Foto
                </button>
              </>
            )}
          </div>

          <DialogFooter className="sm:justify-end mt-2">
            <button
              type="button"
              onClick={() => setImagesTarget(null)}
              className={cn(
                'inline-flex items-center justify-center font-medium transition-colors',
                'hover:opacity-80 rounded-sm text-body bg-transparent px-lg'
              )}
              style={{
                height: 36,
                border: '1px solid var(--border-subtle)',
                color: 'var(--fg-secondary)'
              }}
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { Entrada }
