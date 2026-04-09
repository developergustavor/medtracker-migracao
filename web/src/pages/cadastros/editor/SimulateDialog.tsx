// packages
import { useState, useMemo, useCallback } from 'react'
import { TickCircle, Trash } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// local
import { TEMPLATE_VARIABLES, type VariableDefinition } from './variables'

const _loc = '@/pages/cadastros/editor/SimulateDialog'

type SimulateDialogProps = {
  open: boolean
  onClose: () => void
  onApply: (values: Record<string, string>) => void
  onClear: () => void
  isSimulating: boolean
}

function SimulateDialog({ open, onClose, onApply, onClear, isSimulating }: SimulateDialogProps) {
  // All variables flattened
  const allVariables = useMemo(() => {
    const vars: VariableDefinition[] = []
    for (const cat of TEMPLATE_VARIABLES) {
      for (const v of cat.variables) {
        // Skip logo (it's an image, not text)
        if (v.key === 'cme.logo') continue
        vars.push(v)
      }
    }
    return vars
  }, [])

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const v of allVariables) init[v.path] = ''
    return init
  })

  const handleChange = useCallback((path: string, value: string) => {
    setValues(prev => ({ ...prev, [path]: value }))
  }, [])

  const handleApply = useCallback(() => {
    onApply(values)
    onClose()
  }, [values, onApply, onClose])

  const handleFillSample = useCallback(() => {
    const sampleData: Record<string, string> = {
      'tag.cme.corporateName': 'Hospital Santa Maria',
      'tag.cme.name': 'CME Central',
      'tag.material.name': 'CX VASCULAR Nº1',
      'tag.material.submaterialsAmount': '14',
      'tag.materialsQuantityRatio': '14/14',
      'tag.cycle.batch': '2024001',
      'tag.cycle.dateTime': '09/04/2026 14:30',
      'tag.cycle.equipament.name': 'CISA 2',
      'tag.cycle.cycleType.name': 'VAPOR',
      'tag.cycle.materials[0].amount': '1',
      'tag.id': '12345',
      'tag.expirationDate': '09/04/2027',
      'tag.procedureDatetime': '09/04/2026',
      'tag.user.name': 'Ana Clara Souza',
      'tag.user.coren': 'COREN-SP 123456',
      'tag.patient.name': 'João Silva',
      'tag.doctor.name': 'Dr. Carlos Mendes',
      'tag.owner.name': 'Medtronic LTDA',
      'tag.dia_atual': '09',
      'tag.mes_atual': 'Abril',
      'tag.ano_atual': '2026',
      'tag.data_atual': '09/04/2026',
      'withheldMaterialsLength': '2',
      'withheldMaterialName': 'Pinça Kelly',
      'withheldMaterialAmount': '1'
    }
    setValues(prev => {
      const next = { ...prev }
      for (const [key, val] of Object.entries(sampleData)) {
        if (key in next) next[key] = val
      }
      return next
    })
  }, [])

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-heading text-foreground">
            {isSimulating ? 'Editar Simulação' : 'Simular Variáveis'}
          </DialogTitle>
        </DialogHeader>

        {/* Quick fill */}
        <div className="flex items-center gap-sm mb-sm">
          <button
            type="button"
            onClick={handleFillSample}
            className="text-xxs text-primary bg-primary-8 border border-primary-20 px-md py-[4px] rounded-xs cursor-pointer hover-primary-subtle transition-colors"
          >
            Preencher com dados de exemplo
          </button>
          {isSimulating && (
            <button
              type="button"
              onClick={() => { onClear(); onClose() }}
              className="text-xxs text-destructive bg-destructive-8 border border-destructive/20 px-md py-[4px] rounded-xs cursor-pointer transition-colors flex items-center gap-[4px]"
            >
              <Trash size={10} color="currentColor" />
              Limpar simulação
            </button>
          )}
        </div>

        {/* Variables form */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-md">
          {TEMPLATE_VARIABLES.map(cat => {
            const visibleVars = cat.variables.filter(v => v.key !== 'cme.logo')
            if (visibleVars.length === 0) return null
            return (
              <div key={cat.key}>
                <span className="text-xxs text-muted-foreground uppercase font-semibold tracking-wider">{cat.label}</span>
                <div className="grid grid-cols-2 gap-x-sm gap-y-xs mt-xs">
                  {visibleVars.map(v => (
                    <div key={v.key} className="flex flex-col gap-[2px]">
                      <Label className="text-xxs text-fg-dim">{v.label}</Label>
                      <Input
                        value={values[v.path] || ''}
                        onChange={e => handleChange(v.path, e.target.value)}
                        placeholder={v.placeholder}
                        className="text-xs"
                        style={{ height: 28 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-sm pt-sm border-t border-separator mt-sm">
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-[4px] text-xs text-on-solid gradient-primary px-lg border-none cursor-pointer rounded-sm"
            style={{ height: 34 }}
          >
            <TickCircle size={14} color="currentColor" variant="Bold" />
            Aplicar simulação
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground bg-transparent border border-subtle px-lg cursor-pointer rounded-sm"
            style={{ height: 34 }}
          >
            Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { SimulateDialog }
