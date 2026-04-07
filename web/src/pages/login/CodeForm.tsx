// packages
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ScanBarcode } from 'iconsax-react'

// entities
import { loginByCodeSchema } from '@/entities'
import type { LoginByCodeSchema } from '@/entities'

// store
import { useAuthStore } from '@/store'

// libs
import { api } from '@/libs'

// constants
import { HTTP_STATUS_CODE } from '@/constants'

// utils
import { treatError } from '@/utils'

const _loc = '@/pages/login/CodeForm'

type CodeFormProps = {
  onTwoFactor: (userId: number, email: string) => void
}

export function CodeForm({ onTwoFactor }: CodeFormProps) {
  const navigate = useNavigate()
  const { login, setCme } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue
  } = useForm<LoginByCodeSchema>({
    resolver: zodResolver(loginByCodeSchema),
    mode: 'onChange'
  })

  const { ref: registerRef, ...registerRest } = register('code')

  const codeValue = watch('code')

  // FIX 1: Auto-focus first input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // FIX 2: Auto-submit with debounce
  useEffect(() => {
    if (!codeValue || codeValue.length < 2 || isLoading) return
    const timer = setTimeout(() => {
      handleSubmit(onSubmit)()
    }, 800)
    return () => clearTimeout(timer)
  }, [codeValue]) // eslint-disable-line -- intentional

  const onSubmit = async (data: LoginByCodeSchema) => {
    const fullLoc = `${_loc}.onSubmit`
    setIsLoading(true)
    setErrorMsg('')

    try {
      const response = await api.post('/api/auth', {
        action: 'user-by-code',
        code: data.code
      })

      const res = response.data

      if (res?.statusCode === HTTP_STATUS_CODE.OK) {
        const user = res.body[0]
        login(user, res.token)
        if (user.cmes?.[0]) setCme(user.cmes[0])
        else if (res.body[1]) setCme(res.body[1])
        navigate('/home', { replace: true })
      } else if (res?.statusCode === 206) {
        const userId = res.body[0]?.userId
        onTwoFactor(userId, '')
      } else {
        setErrorMsg(res?.statusMessage || 'Erro ao realizar login.')
        setValue('code', '')
        inputRef.current?.focus()
      }
    } catch (err) {
      console.error(`Unhandled rejection at ${fullLoc}. Details: ${treatError(err)}`)
      setErrorMsg(treatError(err, false) || 'Não foi possível realizar o login.')
      setValue('code', '')
      inputRef.current?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-[16px] w-full">
      <div className="flex flex-col gap-[6px]">
        <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
          Código
        </label>
        <div className="relative">
          <span
            className="absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ScanBarcode size={18} color="currentColor" />
          </span>
          <input
            {...registerRest}
            ref={e => {
              registerRef(e)
              ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = e
            }}
            type="password"
            placeholder="Digite seu código"
            autoComplete="off"
            className="w-full rounded-[10px] border outline-none text-sm pl-[40px] pr-[14px]"
            style={{
              height: 44,
              backgroundColor: 'var(--input)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              transition: 'border-color 150ms ease'
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-[8px]">
          <span
            className="inline-block w-[18px] h-[18px] rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Acessando...
          </span>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs" style={{ color: 'var(--destructive)' }}>
          {errorMsg}
        </p>
      )}
    </form>
  )
}
