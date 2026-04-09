// packages
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormMask } from 'use-mask-input'

// components
import { FormDialog } from '@/components'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// types
import type { EntityFormConfig, FormFieldConfig } from './cadastros.forms'

const _loc = '@/pages/cadastros/CadastroFormDialog'

type CadastroFormDialogProps = {
  open: boolean
  onClose: () => void
  config: EntityFormConfig
  entityLabel: string
  editData?: Record<string, unknown> | null
}

function CadastroFormDialog({ open, onClose, config, entityLabel, editData }: CadastroFormDialogProps) {
  const isEdit = !!editData

  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues
  })

  const registerWithMask = useHookFormMask(form.register)

  useEffect(() => {
    if (open) {
      if (editData) {
        const values: Record<string, unknown> = { ...config.defaultValues }
        for (const field of config.fields) {
          if (field.key in editData) {
            values[field.key] = editData[field.key]
          }
        }
        form.reset(values)
      } else {
        form.reset(config.defaultValues)
      }
    }
  }, [open, editData]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    const fullLoc = `${_loc}.handleSubmit`
    try {
      const data = form.getValues()
      console.log(`[${fullLoc}] ${isEdit ? 'Edit' : 'Create'}:`, data)
      onClose()
    } catch (err) {
      console.error(`Unhandled rejection at ${fullLoc}. Details:`, err)
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar ${entityLabel}` : `Novo ${entityLabel}`}
      description={isEdit ? `Altere os dados do ${entityLabel.toLowerCase()}.` : `Preencha os dados para cadastrar um novo ${entityLabel.toLowerCase()}.`}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={isEdit ? 'Salvar alterações' : 'Cadastrar'}
    >
      <div className="grid grid-cols-2 gap-x-md gap-y-lg">
        {config.fields.map(field => (
          <FieldRenderer
            key={field.key}
            field={field}
            form={form}
            registerWithMask={registerWithMask}
          />
        ))}
      </div>
    </FormDialog>
  )
}

function FieldRenderer({ field, form, registerWithMask }: {
  field: FormFieldConfig
  form: ReturnType<typeof useForm>
  registerWithMask: ReturnType<typeof useHookFormMask>
}) {
  const error = form.formState.errors[field.key]
  const errorMessage = error?.message as string | undefined
  const span = field.span === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'

  if (field.type === 'checkbox') {
    return (
      <div className={`${span} flex items-center gap-sm`}>
        <Controller
          name={field.key}
          control={form.control}
          render={({ field: ctrl }) => (
            <Checkbox
              id={field.key}
              checked={ctrl.value as boolean}
              onCheckedChange={ctrl.onChange}
            />
          )}
        />
        <Label htmlFor={field.key} className="text-body text-foreground cursor-pointer">
          {field.label}
        </Label>
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div className={`${span} flex flex-col gap-[6px]`}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">
          {field.label}
        </Label>
        <Controller
          name={field.key}
          control={form.control}
          render={({ field: ctrl }) => (
            <Select value={ctrl.value as string} onValueChange={ctrl.onChange}>
              <SelectTrigger
                id={field.key}
                className="w-full text-body"
                style={{
                  height: 38,
                  borderColor: errorMessage ? 'var(--destructive)' : 'var(--input-border)',
                  backgroundColor: 'var(--input)'
                }}
              >
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  if (field.type === 'cpf') {
    return (
      <div className={`${span} flex flex-col gap-[6px]`}>
        <Label htmlFor={field.key} className="text-caption text-foreground font-medium">
          {field.label}
        </Label>
        <Input
          id={field.key}
          inputMode="numeric"
          placeholder={field.placeholder}
          className="text-body"
          style={{
            height: 38,
            borderColor: errorMessage ? 'var(--destructive)' : undefined
          }}
          {...registerWithMask(field.key, ['999.999.999-99'], { required: true })}
        />
        {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
      </div>
    )
  }

  // text, number, currency
  return (
    <div className={`${span} flex flex-col gap-[6px]`}>
      <Label htmlFor={field.key} className="text-caption text-foreground font-medium">
        {field.label}
      </Label>
      <Input
        id={field.key}
        type={field.type === 'number' || field.type === 'currency' ? 'number' : 'text'}
        step={field.type === 'currency' ? '0.01' : undefined}
        min={field.type === 'currency' ? '0' : undefined}
        placeholder={field.placeholder}
        className="text-body"
        style={{
          height: 38,
          borderColor: errorMessage ? 'var(--destructive)' : undefined
        }}
        {...form.register(field.key, { valueAsNumber: field.type === 'number' || field.type === 'currency' })}
      />
      {errorMessage && <span className="text-xs text-destructive">{errorMessage}</span>}
    </div>
  )
}

export { CadastroFormDialog }
export type { CadastroFormDialogProps }
