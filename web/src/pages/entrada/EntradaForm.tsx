// packages
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { TickCircle } from 'iconsax-react'

// components
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

type ComboboxOption = {
  value: string
  label: string
}

type ComboboxProps = {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  onCreate?: () => void
  createLabel?: string
}

function Combobox({ options, value, onChange, placeholder = 'Buscar...', disabled, onCreate, createLabel }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedLabel = useMemo(() => options.find(o => o.value === value)?.label || '', [options, value])

  const filtered = useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(lower))
  }, [options, search])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleFocus = useCallback(() => {
    if (!disabled) {
      setOpen(true)
      setSearch('')
    }
  }, [disabled])

  const handleSelect = useCallback((val: string) => {
    onChange(val)
    setOpen(false)
    setSearch('')
  }, [onChange])

  return (
    <div className="relative" ref={containerRef}>
      <Input
        value={open ? search : selectedLabel}
        onChange={e => setSearch(e.target.value)}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('text-body', disabled && 'opacity-50 cursor-not-allowed')}
        style={{ height: 38, borderColor: 'var(--input-border)', backgroundColor: 'var(--input)' }}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-sm shadow-lg max-h-[200px] overflow-y-auto">
          {onCreate && (
            <button
              type="button"
              onClick={() => { onCreate(); setOpen(false) }}
              className="w-full text-left px-sm py-xs text-primary font-medium border-b border-border cursor-pointer hover:bg-muted"
            >
              + {createLabel || 'Criar novo'}
            </button>
          )}
          {filtered.length === 0 && (
            <div className="px-sm py-xs text-muted-foreground text-caption">Nenhum resultado</div>
          )}
          {filtered.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={cn(
                'w-full text-left px-sm py-xs hover:bg-muted cursor-pointer text-body',
                opt.value === value && 'bg-muted font-medium'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
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

  // -- Progress badges (separated into required and optional)
  const requiredBadges: BadgeField[] = useMemo(() => {
    const sectorLabel = formData.type === entry_type.EXTERNA ? 'CME' : 'Setor'
    const sectorFilled = formData.type === entry_type.EXTERNA ? !!formData.sourceCmeId : !!formData.departmentId

    return [
      { key: 'type', label: 'Tipo', filled: !!formData.type },
      { key: 'sector', label: sectorLabel, filled: sectorFilled }
    ]
  }, [formData])

  const optionalBadges: BadgeField[] = useMemo(() => {
    const procedureFilled = !!formData.procedureDate && !!formData.procedureTime

    return [
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

  // -- Badge renderer
  const renderBadge = useCallback((badge: BadgeField) => (
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
  ), [])

  return (
    <div className="flex flex-col gap-lg p-lg">
      {/* Header */}
      <div>
        <h2 className="text-subheading font-semibold text-foreground">Dados da Entrada</h2>
        <p className="text-caption text-muted-foreground mt-[2px]">Preencha para liberar a conferência</p>
      </div>

      {/* Progress badges — separated required / optional */}
      <div className="flex flex-col gap-[6px]">
        <div className="flex flex-wrap gap-[6px]">
          <span className="text-xxs text-fg-dim font-medium uppercase mr-[2px]">Obrigatório:</span>
          {requiredBadges.map(renderBadge)}
        </div>
        <div className="flex flex-wrap gap-[6px]">
          <span className="text-xxs text-fg-dim font-medium uppercase mr-[2px]">Opcional:</span>
          {optionalBadges.map(renderBadge)}
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-md">
        {/* Tipo — radio buttons */}
        <div className="flex flex-col gap-[6px]">
          <Label className="text-caption text-foreground font-medium">Tipo <span className="text-destructive">*</span></Label>
          <div className="flex gap-sm">
            <button
              type="button"
              onClick={() => handleTypeChange('INTERNA')}
              disabled={materialsAdded}
              className={cn(
                'flex-1 flex items-center justify-center gap-xs rounded-sm py-[10px] text-body font-medium border transition-colors cursor-pointer',
                formData.type === 'INTERNA' ? 'bg-primary-8 text-primary border-primary' : 'bg-card text-foreground border-border',
                materialsAdded && 'opacity-50 cursor-not-allowed'
              )}
            >
              Interna
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('EXTERNA')}
              disabled={materialsAdded}
              className={cn(
                'flex-1 flex items-center justify-center gap-xs rounded-sm py-[10px] text-body font-medium border transition-colors cursor-pointer',
                formData.type === 'EXTERNA' ? 'bg-primary-8 text-primary border-primary' : 'bg-card text-foreground border-border',
                materialsAdded && 'opacity-50 cursor-not-allowed'
              )}
            >
              Externa
            </button>
          </div>
        </div>

        {/* Setor (INTERNA only) — combobox without create */}
        {formData.type === entry_type.INTERNA && (
          <div className="flex flex-col gap-[6px]">
            <Label className="text-caption text-foreground font-medium">Setor <span className="text-destructive">*</span></Label>
            <Combobox
              options={departmentOptions}
              value={formData.departmentId}
              onChange={handleDepartmentChange}
              placeholder="Buscar setor..."
              disabled={materialsAdded}
            />
          </div>
        )}

        {/* CME Origem (EXTERNA only) — combobox without create */}
        {formData.type === entry_type.EXTERNA && (
          <div className="flex flex-col gap-[6px]">
            <Label className="text-caption text-foreground font-medium">CME Origem <span className="text-destructive">*</span></Label>
            <Combobox
              options={cmeOptions}
              value={formData.sourceCmeId}
              onChange={handleCmeChange}
              placeholder="Buscar CME..."
              disabled={materialsAdded}
            />
          </div>
        )}

        {/* Médico — combobox with create */}
        <div className="flex flex-col gap-[6px]">
          <Label className="text-caption text-foreground font-medium">Médico</Label>
          <Combobox
            options={doctorOptions}
            value={formData.doctorId}
            onChange={handleDoctorChange}
            placeholder="Buscar médico..."
            onCreate={() => onCreateInline('doctor')}
            createLabel="Criar novo médico"
          />
        </div>

        {/* Paciente — combobox with create */}
        <div className="flex flex-col gap-[6px]">
          <Label className="text-caption text-foreground font-medium">Paciente</Label>
          <Combobox
            options={patientOptions}
            value={formData.patientId}
            onChange={handlePatientChange}
            placeholder="Buscar paciente..."
            onCreate={() => onCreateInline('patient')}
            createLabel="Criar novo paciente"
          />
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

        {/* Terceiro — combobox with create */}
        <div className="flex flex-col gap-[6px]">
          <Label className="text-caption text-foreground font-medium">Terceiro</Label>
          <Combobox
            options={ownerOptions}
            value={formData.ownerId}
            onChange={handleOwnerChange}
            placeholder="Buscar terceiro..."
            onCreate={() => onCreateInline('owner')}
            createLabel="Criar novo terceiro"
          />
        </div>
      </div>
    </div>
  )
}

export { EntradaForm }
