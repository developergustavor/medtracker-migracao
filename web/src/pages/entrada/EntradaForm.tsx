// packages
import { useCallback, useMemo } from 'react'
import { TickCircle } from 'iconsax-react'

// components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// libs
import { cn } from '@/libs/shadcn.utils'

// mock
import { mockDepartments, mockDoctors, mockPatients, mockOwners, mockCmes } from '@/mock/data'

// entities
import { entry_type } from '@/entities'

// types
import type { EntryFormData } from '@/entities'

const _loc = '@/pages/entrada/EntradaForm'

type EntradaFormProps = {
  formData: EntryFormData
  onChange: (data: Partial<EntryFormData>) => void
  materialsAdded: boolean
  onCreateInline: (entity: 'doctor' | 'patient' | 'owner') => void
}

type BadgeField = {
  key: string
  label: string
  filled: boolean
}

function EntradaForm({ formData, onChange, materialsAdded, onCreateInline }: EntradaFormProps) {
  // -- Filtered options
  const departmentOptions = useMemo(
    () => mockDepartments.filter(d => d.status === 'ATIVO').map(d => ({ value: String(d.id), label: d.name })),
    []
  )

  const cmeOptions = useMemo(
    () => mockCmes.map(c => ({ value: String(c.id), label: c.corporateName })),
    []
  )

  const doctorOptions = useMemo(
    () => mockDoctors.filter(d => d.status === 'ATIVO').map(d => ({ value: String(d.id), label: d.name })),
    []
  )

  const patientOptions = useMemo(
    () => mockPatients.filter(p => p.status === 'ATIVO').map(p => ({ value: String(p.id), label: p.name })),
    []
  )

  const ownerOptions = useMemo(
    () => mockOwners.filter(o => o.status === 'ATIVO').map(o => ({ value: String(o.id), label: o.name })),
    []
  )

  // -- Progress badges
  const badges: BadgeField[] = useMemo(() => {
    const sectorLabel = formData.type === entry_type.EXTERNA ? 'CME' : 'Setor'
    const sectorFilled = formData.type === entry_type.EXTERNA ? !!formData.sourceCmeId : !!formData.departmentId
    const procedureFilled = !!formData.procedureDate && !!formData.procedureTime

    return [
      { key: 'type', label: 'Tipo', filled: !!formData.type },
      { key: 'sector', label: sectorLabel, filled: sectorFilled },
      { key: 'doctor', label: 'Médico', filled: !!formData.doctorId },
      { key: 'patient', label: 'Paciente', filled: !!formData.patientId },
      { key: 'procedure', label: 'Procedimento', filled: procedureFilled },
      { key: 'owner', label: 'Terceiro', filled: !!formData.ownerId }
    ]
  }, [formData])

  // -- Handlers
  const handleTypeChange = useCallback((value: string) => {
    const partial: Partial<EntryFormData> = { type: value as entry_type }
    // Reset conditional fields when type changes
    if (value === entry_type.INTERNA) partial.sourceCmeId = ''
    if (value === entry_type.EXTERNA) partial.departmentId = ''
    onChange(partial)
  }, [onChange])

  const handleDepartmentChange = useCallback((value: string) => {
    onChange({ departmentId: value })
  }, [onChange])

  const handleCmeChange = useCallback((value: string) => {
    onChange({ sourceCmeId: value })
  }, [onChange])

  const handleDoctorChange = useCallback((value: string) => {
    onChange({ doctorId: value })
  }, [onChange])

  const handlePatientChange = useCallback((value: string) => {
    onChange({ patientId: value })
  }, [onChange])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ procedureDate: e.target.value })
  }, [onChange])

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ procedureTime: e.target.value })
  }, [onChange])

  const handleOwnerChange = useCallback((value: string) => {
    onChange({ ownerId: value })
  }, [onChange])

  const handleOwnerTypeChange = useCallback((value: string) => {
    onChange({ ownerType: value })
  }, [onChange])

  // -- Field style helpers
  const isRequiredFilled = useCallback((value: string) => !!value, [])

  const getSelectTriggerStyle = useCallback((value: string, required: boolean) => {
    const filled = required && !!value
    return {
      height: 38,
      borderColor: filled ? '#22c55e' : 'var(--input-border)',
      backgroundColor: filled ? 'rgba(34, 197, 94, 0.05)' : 'var(--input)'
    }
  }, [])

  return (
    <div className="flex flex-col gap-lg p-lg">
      {/* Header */}
      <div>
        <h2 className="text-subheading font-semibold text-foreground">Dados da Entrada</h2>
        <p className="text-caption text-muted-foreground mt-[2px]">Preencha para liberar a conferência</p>
      </div>

      {/* Progress badges */}
      <div className="flex flex-wrap gap-[6px]">
        {badges.map(badge => (
          <span
            key={badge.key}
            className={cn(
              'inline-flex items-center gap-[4px] rounded-pill px-[8px] py-[2px] text-xxs font-medium',
              badge.filled
                ? 'bg-[rgba(34,197,94,0.1)] text-[#16a34a]'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {badge.filled ? <TickCircle size={12} color="currentColor" variant="Bold" /> : <span className="text-[10px]">&#9675;</span>}
            {badge.label}
          </span>
        ))}
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-md">
        {/* Tipo */}
        <div className="flex flex-col gap-[6px]">
          <Label className="text-caption text-foreground font-medium">Tipo <span className="text-destructive">*</span></Label>
          <Select value={formData.type} onValueChange={handleTypeChange} disabled={materialsAdded}>
            <SelectTrigger
              className={cn('w-full text-body', materialsAdded && 'opacity-50 cursor-not-allowed')}
              style={getSelectTriggerStyle(formData.type, true)}
            >
              <SelectValue placeholder="Selecione..." />
              {isRequiredFilled(formData.type) && (
                <TickCircle size={16} color="#22c55e" variant="Bold" className="ml-auto shrink-0" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={entry_type.INTERNA}>Interna</SelectItem>
              <SelectItem value={entry_type.EXTERNA}>Externa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Setor (INTERNA only) */}
        {formData.type === entry_type.INTERNA && (
          <div className="flex flex-col gap-[6px]">
            <Label className="text-caption text-foreground font-medium">Setor <span className="text-destructive">*</span></Label>
            <Select value={formData.departmentId} onValueChange={handleDepartmentChange} disabled={materialsAdded}>
              <SelectTrigger
                className={cn('w-full text-body', materialsAdded && 'opacity-50 cursor-not-allowed')}
                style={getSelectTriggerStyle(formData.departmentId, true)}
              >
                <SelectValue placeholder="Selecione..." />
                {isRequiredFilled(formData.departmentId) && (
                  <TickCircle size={16} color="#22c55e" variant="Bold" className="ml-auto shrink-0" />
                )}
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* CME Origem (EXTERNA only) */}
        {formData.type === entry_type.EXTERNA && (
          <div className="flex flex-col gap-[6px]">
            <Label className="text-caption text-foreground font-medium">CME Origem <span className="text-destructive">*</span></Label>
            <Select value={formData.sourceCmeId} onValueChange={handleCmeChange} disabled={materialsAdded}>
              <SelectTrigger
                className={cn('w-full text-body', materialsAdded && 'opacity-50 cursor-not-allowed')}
                style={getSelectTriggerStyle(formData.sourceCmeId, true)}
              >
                <SelectValue placeholder="Selecione..." />
                {isRequiredFilled(formData.sourceCmeId) && (
                  <TickCircle size={16} color="#22c55e" variant="Bold" className="ml-auto shrink-0" />
                )}
              </SelectTrigger>
              <SelectContent>
                {cmeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Medico */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <Label className="text-caption text-foreground font-medium">Médico</Label>
            <button
              type="button"
              onClick={() => onCreateInline('doctor')}
              className="text-caption text-primary font-medium hover:underline cursor-pointer"
            >
              + Criar
            </button>
          </div>
          <Select value={formData.doctorId} onValueChange={handleDoctorChange}>
            <SelectTrigger className="w-full text-body" style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {doctorOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Paciente */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <Label className="text-caption text-foreground font-medium">Paciente</Label>
            <button
              type="button"
              onClick={() => onCreateInline('patient')}
              className="text-caption text-primary font-medium hover:underline cursor-pointer"
            >
              + Criar
            </button>
          </div>
          <Select value={formData.patientId} onValueChange={handlePatientChange}>
            <SelectTrigger className="w-full text-body" style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {patientOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data Procedimento + Hora Procedimento */}
        <div className="flex gap-sm">
          <div className="flex flex-col gap-[6px] flex-1">
            <Label className="text-caption text-foreground font-medium">Data Procedimento</Label>
            <Input
              value={formData.procedureDate}
              onChange={handleDateChange}
              placeholder="DD/MM/AAAA"
              className="text-body"
              style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}
            />
          </div>
          <div className="flex flex-col gap-[6px] flex-1">
            <Label className="text-caption text-foreground font-medium">Hora Procedimento</Label>
            <Input
              value={formData.procedureTime}
              onChange={handleTimeChange}
              placeholder="HH:MM"
              className="text-body"
              style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}
            />
          </div>
        </div>

        {/* Terceiro */}
        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between">
            <Label className="text-caption text-foreground font-medium">Terceiro</Label>
            <button
              type="button"
              onClick={() => onCreateInline('owner')}
              className="text-caption text-primary font-medium hover:underline cursor-pointer"
            >
              + Criar
            </button>
          </div>
          <Select value={formData.ownerId} onValueChange={handleOwnerChange}>
            <SelectTrigger className="w-full text-body" style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {ownerOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo Terceiro */}
        <div className={cn('flex flex-col gap-[6px]', !formData.ownerId && 'opacity-50')}>
          <Label className="text-caption text-foreground font-medium">Tipo Terceiro</Label>
          <Select value={formData.ownerType} onValueChange={handleOwnerTypeChange} disabled={!formData.ownerId}>
            <SelectTrigger
              className={cn('w-full text-body', !formData.ownerId && 'cursor-not-allowed')}
              style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}
            >
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEDICO">Médico</SelectItem>
              <SelectItem value="EMPRESA">Empresa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export { EntradaForm }
