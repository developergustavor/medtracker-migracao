// packages
import { useState, useEffect, useRef, useCallback } from 'react'
import { SearchNormal1, CloseCircle } from 'iconsax-react'

// libs
import { cn } from '@/libs/shadcn.utils'

// components
import { Input } from '@/components/ui/input'

const _loc = '@/components/domain/SearchInput'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

function SearchInput({ value, onChange, placeholder = 'Buscar...', debounceMs = 300, className }: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const debouncedOnChange = useCallback(
    (val: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onChange(val)
      }, debounceMs)
    },
    [onChange, debounceMs]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInternalValue(val)
    debouncedOnChange(val)
  }

  const handleClear = () => {
    setInternalValue('')
    onChange('')
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <SearchNormal1
        size={16}
        color="var(--fg-muted)"
        className="absolute left-3 pointer-events-none"
        style={{ flexShrink: 0 }}
      />
      <Input
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8"
        style={{
          height: 36,
          backgroundColor: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
          borderRadius: 'var(--radius-sm)'
        }}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--fg-muted)' }}
        >
          <CloseCircle size={16} color="currentColor" />
        </button>
      )}
    </div>
  )
}

export { SearchInput }
export type { SearchInputProps }
