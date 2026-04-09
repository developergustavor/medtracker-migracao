// packages
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormMask } from 'use-mask-input'
import { TickCircle, CloseCircle, Add, Minus } from 'iconsax-react'

// components
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// store
import { useAuthStore } from '@/store'

// hooks
import { useIsMobile, useIsDesktop } from '@/hooks'

// libs
import { cn } from '@/libs/shadcn.utils'

// local
import { MaterialImageColumn } from './MaterialImageColumn'
import { MaterialSubmaterialsPanel } from './MaterialSubmaterialsPanel'
import { TemplateEditor } from './editor'
import type { Submaterial } from './MaterialSubmaterialsPanel'

// types
import type { EntityFormConfig, FormFieldConfig } from './cadastros.forms'

const _loc = '@/pages/cadastros/CadastroForm'

// Static col-span map (Tailwind can't generate dynamic classes)
const SPAN_MAP: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12'
}

function getSpanClass(span?: number, isMobile?: boolean): string {
  if (isMobile) return 'col-span-12'
  if (!span) return 'col-span-6'
  return SPAN_MAP[span] || 'col-span-6'
}

type CadastroFormProps = {
  config: EntityFormConfig
  entityLabel: string
  editData?: Record<string, unknown> | null
  onSubmit: (data: Record<string, unknown>) => void
  onCancel: () => void
  loading?: boolean
}

function CadastroForm({ config, entityLabel, editData, onSubmit, onCancel, loading = false }: CadastroFormProps) {
  // Template editor gets its own full-screen layout
  if (config.layout === 'template-editor') {
    return <TemplateEditor editData={editData} onSave={onSubmit} onCancel={onCancel} />
  }

  return <StandardCadastroForm config={config} entityLabel={entityLabel} editData={editData} onSubmit={onSubmit} onCancel={onCancel} loading={loading} />
}

function StandardCadastroForm({ config, entityLabel, editData, onSubmit, onCancel, loading = false }: CadastroFormProps) {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const { cme } = useAuthStore()
  const isEdit = !!editData
  const is3ColMaterial = config.layout === '3col-material'
  const useMaterial6col = is3ColMaterial && isDesktop

  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues
  })

  const registerWithMask = useHookFormMask(form.register)

  useEffect(() => {
    if (editData) {
      const values: Record<string, unknown> = { ...config.defaultValues }
      for (const field of config.fields) {
        if (field.key in editData) values[field.key] = editData[field.key]
      }
      form.reset(values)
    } else {
      form.reset(config.defaultValues)
    }
  }, [editData]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormSubmit = form.handleSubmit((data) => {
    const fullLoc = `${_loc}.handleFormSubmit`
    try { onSubmit(data as Record<string, unknown>) }
    catch (err) { console.error(`Unhandled rejection at ${fullLoc}. Details:`, err) }
  })

  const watchedValues = form.watch()
  const watchedType = watchedValues.type as string
  const materialIsKit = watchedType === 'KIT'
  const materialHasId = !!(editData?.id)
  const cmeIsCompleto = cme?.module === 'COMPLETO'
  const submaterialsEnabled = materialIsKit && materialHasId && cmeIsCompleto

  // Filter visible fields
  const visibleFields = useMemo(() => {
    // For 3col material, exclude 'images' field (rendered separately)
    return config.fields
      .filter(f => f.key !== 'images')
      .filter(f => !f.condition || f.condition(watchedValues))
  }, [config.fields, watchedValues])

  // -- Material images state (local mock)
  const [materialImages, setMaterialImages] = useState<string[]>([])

  const handleAddImages = useCallback((files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setMaterialImages(prev => prev.length < 3 ? [...prev, reader.result as string] : prev)
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setMaterialImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  // -- Submaterials state (local mock)
  const [submaterials, setSubmaterials] = useState<Submaterial[]>([])

  const handleAddSubmaterial = useCallback((sub: Omit<Submaterial, 'id'>) => {
    setSubmaterials(prev => [...prev, { ...sub, id: Date.now() }])
  }, [])

  const handleEditSubmaterial = useCallback((index: number, sub: Submaterial) => {
    setSubmaterials(prev => prev.map((s, i) => i === index ? sub : s))
  }, [])

  const handleDeleteSubmaterial = useCallback((index: number) => {
    setSubmaterials(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleDuplicateSubmaterial = useCallback((index: number) => {
    setSubmaterials(prev => {
      const original = prev[index]
      return [...prev, { ...original, id: Date.now(), code: '' }]
    })
  }, [])

  // Mobile tabs for material
  const [mobileTab, setMobileTab] = useState<'dados' | 'submateriais'>('dados')

  // -- Form fields grid (used in both default and 3col)
  const formFieldsGrid = (
    <form
      onSubmit={handleFormSubmit}
      onKeyDown={e => {
        if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLInputElement) {
          e.preventDefault()
          handleFormSubmit()
        }
      }}
      className="grid grid-cols-12 gap-x-md gap-y-lg"
      id="cadastro-form"
    >
      {visibleFields.map(field => (
        <FieldRenderer
          key={field.key}
          field={field}
          form={form}
          registerWithMask={registerWithMask}
          isEdit={isEdit}
          isMobile={isMobile}
          watchedValues={watchedValues}
        />
      ))}
    </form>
  )

  // ═══ MATERIAL LAYOUT DESKTOP (>=1024px): 6/12 (images+form) | 6/12 (submaterials) ═══
  if (useMaterial6col) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Title */}
        <div className="text-center py-md shrink-0">
          <h2 className="text-heading font-bold text-foreground mb-[2px]">
            {isEdit ? `Editar ${entityLabel}` : `Cadastrar ${entityLabel}`}
          </h2>
          <p className="text-caption text-muted-foreground">
            {isEdit
              ? <>{(editData?.name as string) || entityLabel} — <span className="text-primary font-semibold">{watchedType}</span></>
              : `Preencha os campos para cadastrar o ${entityLabel.toLowerCase()}.`
            }
          </p>
        </div>

        {/* 2 halves: left (images top + form bottom) | right (submaterials) */}
        <div className="flex-1 flex overflow-hidden px-lg gap-0">
          {/* LEFT: 6/12 — images fill remaining, form scrolls if needed */}
          <div className="w-6/12 flex flex-col pr-lg border-r border-separator overflow-hidden">
            {/* Images: flex-1 fills remaining space between header and form */}
            <div className="flex-1 min-h-[80px] mb-md">
              <MaterialImageColumn
                images={materialImages}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
                mode="desktop"
              />
            </div>
            {/* Form: takes only what it needs, scrolls if content overflows */}
            <div className="overflow-y-auto min-h-0" style={{ flex: '0 1 auto', maxHeight: '65%' }}>
              {formFieldsGrid}
            </div>
          </div>

          {/* RIGHT: 6/12 — submaterials panel */}
          <div className="w-6/12 pl-lg overflow-hidden flex flex-col">
            <MaterialSubmaterialsPanel
              submaterials={submaterials}
              onAdd={handleAddSubmaterial}
              onEdit={handleEditSubmaterial}
              onDelete={handleDeleteSubmaterial}
              onDuplicate={handleDuplicateSubmaterial}
              disabled={!submaterialsEnabled}
              disabledMessage={
                !materialIsKit ? 'Apenas para KIT' :
                !materialHasId ? 'Registre primeiro' :
                !cmeIsCompleto ? 'Módulo Completo' : undefined
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-sm px-2xl py-md border-t border-separator bg-card">
          <button
            type="submit"
            form="cadastro-form"
            disabled={loading}
            className="inline-flex items-center gap-[6px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm text-body border-none cursor-pointer gradient-primary text-on-solid"
            style={{ height: 38, padding: '0 20px' }}
          >
            <span>{isEdit ? 'Salvar' : 'Registrar'}</span>
            <TickCircle size={16} color="currentColor" variant="Bold" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center gap-[6px] font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm text-body bg-transparent cursor-pointer text-primary border border-primary-20"
            style={{ height: 38, padding: '0 20px' }}
          >
            <span>Cancelar</span>
            <CloseCircle size={16} color="currentColor" variant="Linear" />
          </button>
        </div>
      </div>
    )
  }

  // ═══ MATERIAL MOBILE/TABLET (<1024px): tabs ═══
  if (is3ColMaterial && !useMaterial6col) {
    return (
      <div className="flex flex-col h-full overflow-hidden bg-background">
        {/* Tabs */}
        <div className="flex gap-[2px] px-md pt-sm shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('dados')}
            className={cn(
              'flex-1 text-center text-caption font-medium py-[10px] border-none cursor-pointer rounded-t-sm transition-colors',
              mobileTab === 'dados' ? 'bg-primary text-on-solid' : 'bg-card text-muted-foreground'
            )}
          >
            Dados
          </button>
          <button
            type="button"
            onClick={() => submaterialsEnabled && setMobileTab('submateriais')}
            disabled={!submaterialsEnabled}
            className={cn(
              'flex-1 text-center text-caption font-medium py-[10px] border-none rounded-t-sm transition-colors',
              mobileTab === 'submateriais' ? 'bg-primary text-on-solid cursor-pointer' : 'bg-card text-muted-foreground',
              !submaterialsEnabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            Submateriais
            {submaterials.length > 0 && (
              <span className="ml-[4px] bg-white/20 text-xxs px-[5px] py-[1px] rounded-pill">{submaterials.length}</span>
            )}
          </button>
        </div>

        {/* Image bar (mobile: dropzone slot + 3 image slots with sheet on click) */}
        {mobileTab === 'dados' && (
          <MaterialImageColumn
            images={materialImages}
            onAddImages={handleAddImages}
            onRemoveImage={handleRemoveImage}
            mode="mobile"
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-md py-lg">
          {mobileTab === 'dados' ? (
            <div>
              <div className="text-center mb-lg">
                <h2 className="text-heading font-bold text-foreground">{isEdit ? `Editar ${entityLabel}` : `Cadastrar ${entityLabel}`}</h2>
              </div>
              {formFieldsGrid}
            </div>
          ) : (
            <MaterialSubmaterialsPanel
              submaterials={submaterials}
              onAdd={handleAddSubmaterial}
              onEdit={handleEditSubmaterial}
              onDelete={handleDeleteSubmaterial}
              onDuplicate={handleDuplicateSubmaterial}
              disabled={!submaterialsEnabled}
            />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-sm px-md py-md border-t border-separator bg-card">
          <button type="submit" form="cadastro-form" disabled={loading} className="inline-flex items-center gap-[6px] font-medium rounded-sm text-body border-none cursor-pointer gradient-primary text-on-solid flex-1 justify-center" style={{ height: 38 }}>
            <span>{isEdit ? 'Salvar' : 'Registrar'}</span>
            <TickCircle size={16} color="currentColor" variant="Bold" />
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="inline-flex items-center gap-[6px] font-medium rounded-sm text-body bg-transparent cursor-pointer text-primary border border-primary-20" style={{ height: 38, padding: '0 16px' }}>
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    )
  }

  // ═══ DEFAULT LAYOUT (all other entities except material & modelos) ═══
  // Desktop (>=1024): form 6/12 left + placeholder image 6/12 right
  // Mobile/tablet (<1024): form only, centered
  const showPlaceholderImage = isDesktop && config.layout !== '3col-material'

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Title */}
      <div className="text-center py-md shrink-0">
        <h2 className="text-heading font-bold text-foreground mb-xs">
          {isEdit ? `Editar ${entityLabel}` : `Cadastrar ${entityLabel}`}
        </h2>
        <p className="text-body text-muted-foreground">
          {isEdit
            ? `Altere os dados do ${entityLabel.toLowerCase()}.`
            : `Preencha os campos corretamente para cadastrar o ${entityLabel.toLowerCase()}.`
          }
        </p>
      </div>

      <div className={cn('flex-1 overflow-hidden', showPlaceholderImage ? 'flex px-lg' : '')}>
        {/* Form */}
        <div className={cn(
          'overflow-y-auto',
          showPlaceholderImage ? 'w-6/12 pr-lg border-r border-separator' : 'flex-1'
        )}>
          <div className={showPlaceholderImage ? 'py-md' : 'flex justify-center px-lg py-lg'}>
            <div className={showPlaceholderImage ? '' : 'w-full max-w-[580px]'}>
              {formFieldsGrid}
            </div>
          </div>
        </div>

        {/* Placeholder image (desktop only) */}
        {showPlaceholderImage && (
          <div className="w-6/12 pl-lg flex flex-col items-center justify-center">
            <div className="w-full h-full max-h-[500px] rounded-md border-2 border-dashed border-subtle bg-muted/20 flex flex-col items-center justify-center gap-md">
              <div className="w-[64px] h-[64px] rounded-full bg-primary-8 flex items-center justify-center">
                <img src="/icons/logo/logo-icon.svg" alt="" className="w-[32px] h-[32px] opacity-40" />
              </div>
              <span className="text-body text-muted-foreground font-medium">Imagem instrutiva</span>
              <span className="text-caption text-fg-dim text-center px-xl leading-relaxed">
                Este espaço exibirá uma imagem<br />instrucional sobre o cadastro de {entityLabel.toLowerCase()}.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-end gap-sm px-2xl py-md border-t border-separator bg-card">
        <button type="submit" form="cadastro-form" disabled={loading} className="inline-flex items-center gap-[6px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm text-body border-none cursor-pointer gradient-primary text-on-solid" style={{ height: 38, padding: '0 20px' }}>
          <span>{isEdit ? 'Editar' : 'Registrar'}</span>
          <TickCircle size={16} color="currentColor" variant="Bold" />
        </button>
        <button type="button" onClick={onCancel} disabled={loading} className="inline-flex items-center gap-[6px] font-medium hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm text-body bg-transparent cursor-pointer text-primary border border-primary-20" style={{ height: 38, padding: '0 20px' }}>
          <span>Cancelar</span>
          <CloseCircle size={16} color="currentColor" variant="Linear" />
        </button>
      </div>
    </div>
  )
}

// ═══ FIELD RENDERER ═══

function FieldRenderer({ field, form, registerWithMask, isEdit, isMobile, watchedValues }: {
  field: FormFieldConfig
  form: ReturnType<typeof useForm>
  registerWithMask: ReturnType<typeof useHookFormMask>
  isEdit: boolean
  isMobile: boolean
  watchedValues: Record<string, unknown>
}) {
  const { user } = useAuthStore()
  const error = form.formState.errors[field.key]
  const errorMessage = error?.message as string | undefined
  if (field.hideOnEdit && isEdit) return null
  const spanClass = getSpanClass(field.span, isMobile)
  const isDisabledByEdit = field.disabledOnEdit && isEdit
  const isDisabledByCondition = field.disabledCondition?.(watchedValues) ?? false
  const isDisabled = isDisabledByEdit || isDisabledByCondition
  const label = field.dynamicLabel ? field.dynamicLabel(watchedValues) : field.label
  const options = field.dynamicOptions ? field.dynamicOptions(user?.role) : field.options

  // Checkbox
  if (field.type === 'checkbox') {
    return (
      <div className={cn(spanClass, 'flex items-center gap-sm pt-xs')}>
        <Controller name={field.key} control={form.control} render={({ field: ctrl }) => (
          <Checkbox id={field.key} checked={ctrl.value as boolean} onCheckedChange={ctrl.onChange} />
        )} />
        <Label htmlFor={field.key} className="text-body text-foreground cursor-pointer">{label}</Label>
      </div>
    )
  }

  // Toggle button
  if (field.type === 'toggle') {
    return (
      <div className={cn(spanClass, 'flex items-end')}>
        <Controller name={field.key} control={form.control} render={({ field: ctrl }) => (
          <button type="button" onClick={() => ctrl.onChange(!ctrl.value)}
            className={cn('inline-flex items-center gap-sm rounded-sm px-lg text-body font-medium transition-colors cursor-pointer h-[38px]',
              ctrl.value ? 'bg-primary-8 text-primary border border-primary-20' : 'bg-transparent text-muted-foreground border border-subtle'
            )}>
            {ctrl.value ? <TickCircle size={18} color="currentColor" variant="Bold" /> : <CloseCircle size={18} color="currentColor" variant="Linear" />}
            {label}
          </button>
        )} />
      </div>
    )
  }

  // Select
  if (field.type === 'select') {
    return (
      <div className={cn(spanClass, 'flex flex-col gap-[6px]', isDisabled && 'opacity-50')}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
        <Controller name={field.key} control={form.control} render={({ field: ctrl }) => (
          <Select value={ctrl.value as string} onValueChange={ctrl.onChange} disabled={isDisabled}>
            <SelectTrigger id={field.key} className={cn('w-full text-body', isDisabled && 'cursor-not-allowed')} style={{ height: 38, borderColor: errorMessage ? 'var(--destructive)' : 'var(--input-border)', backgroundColor: 'var(--input)' }}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {options?.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // CPF
  if (field.type === 'cpf') {
    return (
      <div className={cn(spanClass, 'flex flex-col gap-[6px]')}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
        <Input id={field.key} inputMode="numeric" placeholder={field.placeholder} className="text-body" style={{ height: 38, borderColor: errorMessage ? 'var(--destructive)' : undefined }} {...registerWithMask(field.key, ['999.999.999-99'], { required: true })} />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // Password
  if (field.type === 'password') {
    return (
      <div className={cn(spanClass, 'flex flex-col gap-[6px]')}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
        <Input id={field.key} type="password" placeholder={field.placeholder} className="text-body" style={{ height: 38, borderColor: errorMessage ? 'var(--destructive)' : undefined }} {...form.register(field.key)} />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // Textarea
  if (field.type === 'textarea') {
    return (
      <div className={cn(spanClass, 'flex flex-col gap-[6px]')}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
        <textarea id={field.key} placeholder={field.placeholder} rows={field.rows || 3}
          className="w-full rounded-sm border bg-input text-body px-md py-sm outline-none focus:border-primary transition-colors resize-y"
          style={{ borderColor: errorMessage ? 'var(--destructive)' : 'var(--input-border)', color: 'var(--foreground)', minHeight: 72 }}
          {...form.register(field.key)} />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // Increment
  if (field.type === 'increment') {
    return (
      <div className={cn(spanClass, 'flex flex-col gap-[6px]')}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
        <Controller name={field.key} control={form.control} render={({ field: ctrl }) => {
          const val = Number(ctrl.value) || 0
          return (
            <div className="flex items-center gap-sm">
              <button type="button" onClick={() => ctrl.onChange(Math.max(field.min ?? 0, val - 1))} className="inline-flex items-center justify-center w-[38px] h-[38px] shrink-0 rounded-sm border border-subtle bg-elevated cursor-pointer hover-elevated transition-colors">
                <Minus size={16} color="var(--foreground)" />
              </button>
              <Input id={field.key} type="text" inputMode="numeric" value={String(val)}
                onChange={e => { const raw = e.target.value.replace(/\D/g, ''); ctrl.onChange(raw === '' ? 0 : Number(raw)) }}
                onKeyDown={e => { if (e.key === 'ArrowUp') { e.preventDefault(); ctrl.onChange(val + 1) }; if (e.key === 'ArrowDown') { e.preventDefault(); ctrl.onChange(Math.max(field.min ?? 0, val - 1)) } }}
                className="text-body text-center flex-1" style={{ height: 38, borderColor: errorMessage ? 'var(--destructive)' : undefined, minWidth: 60 }} />
              <button type="button" onClick={() => ctrl.onChange(val + 1)} className="inline-flex items-center justify-center w-[38px] h-[38px] shrink-0 rounded-sm border border-subtle bg-elevated cursor-pointer hover-elevated transition-colors">
                <Add size={16} color="var(--foreground)" />
              </button>
            </div>
          )
        }} />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // File
  if (field.type === 'file') {
    return (
      <div className={cn(spanClass, 'flex flex-col gap-[6px]')}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
        <Input id={field.key} type="file" accept={field.accept} className="text-body" style={{ height: 38, borderColor: errorMessage ? 'var(--destructive)' : undefined }}
          onChange={e => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) { form.setValue(field.key, file.name); form.setValue(`_file_${field.key}`, file as unknown as string) } }} />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // Default: text, number, currency
  return (
    <div className={cn(spanClass, 'flex flex-col gap-[6px]')}>
      <Label htmlFor={field.key} className="text-caption text-foreground font-medium">{label} {field.required && <span className="text-destructive">*</span>}</Label>
      <Input id={field.key}
        type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
        step={field.type === 'currency' ? '0.01' : undefined}
        min={field.type === 'currency' ? '0' : undefined}
        placeholder={field.placeholder} className="text-body"
        style={{ height: 38, borderColor: errorMessage ? 'var(--destructive)' : undefined }}
        {...form.register(field.key, { valueAsNumber: field.type === 'number' || field.type === 'currency' })} />
      {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
    </div>
  )
}

export { CadastroForm }
export type { CadastroFormProps }
