// packages
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useHookFormMask } from 'use-mask-input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Personalcard, Lock1, Eye, EyeSlash } from 'iconsax-react'

// entities
import { loginByCpfSchema } from '@/entities'
import type { LoginByCpfSchema } from '@/entities'

// store
import { useAuthStore } from '@/store'

// libs
import { api } from '@/libs'

// constants
import { HTTP_STATUS_CODE } from '@/constants'

// utils
import { treatError } from '@/utils'

const _loc = '@/pages/login/CpfForm'

type CpfFormProps = {
  onTwoFactor: (userId: number, email: string) => void
}

export function CpfForm({ onTwoFactor }: CpfFormProps) {
  const navigate = useNavigate()
  const { login, setCme } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isValid }
  } = useForm<LoginByCpfSchema>({
    resolver: zodResolver(loginByCpfSchema),
    mode: 'onChange'
  })

  const registerWithMask = useHookFormMask(register)

  // Auto-focus first input on mount
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('input[name="cpf"]')
    input?.focus()
  }, [])

  const onSubmit = async (data: LoginByCpfSchema) => {
    const fullLoc = `${_loc}.onSubmit`
    setIsLoading(true)
    setErrorMsg('')

    try {
      const response = await api.post('/api/auth', {
        action: 'user',
        cpf: data.cpf,
        password: data.password?.trim()
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
        onTwoFactor(userId, res.body[0]?.email || '')
      } else {
        setErrorMsg(res?.statusMessage || 'Credenciais incorretas.')
      }
    } catch (err) {
      console.error(`Unhandled rejection at ${fullLoc}. Details: ${treatError(err)}`)
      setErrorMsg(treatError(err, false) || 'Não foi possível realizar o login.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[16px] w-full">
      <div className="flex flex-col gap-[6px]">
        <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
          CPF
        </label>
        <div className="relative">
          <span
            className="absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Personalcard size={18} color="currentColor" />
          </span>
          <input
            {...registerWithMask('cpf', ['999.999.999-99'])}
            type="text"
            placeholder="000.000.000-00"
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
          />
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
          Senha
        </label>
        <div className="relative">
          <span
            className="absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Lock1 size={18} color="currentColor" />
          </span>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            className="w-full rounded-[10px] border outline-none text-sm pl-[40px] pr-[44px]"
            style={{
              height: 44,
              backgroundColor: 'var(--input)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
              transition: 'border-color 150ms ease'
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-[12px] top-1/2 -translate-y-1/2 flex items-center border-none bg-transparent cursor-pointer p-0"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {showPassword ? <EyeSlash size={18} color="currentColor" /> : <Eye size={18} color="currentColor" />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-[8px] cursor-pointer select-none">
        <input
          type="checkbox"
          className="w-[16px] h-[16px] rounded-[4px] cursor-pointer accent-[#2155FC]"
        />
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Lembrar de mim
        </span>
      </label>

      {errorMsg && (
        <p className="text-xs" style={{ color: 'var(--destructive)' }}>
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full rounded-[10px] border-none text-sm font-semibold cursor-pointer flex items-center justify-center gap-[8px]"
        style={{
          height: 44,
          background: isValid && !isLoading ? 'linear-gradient(135deg, #2155FC, #4B7BFF)' : 'var(--muted)',
          color: isValid && !isLoading ? '#ffffff' : 'var(--muted-foreground)',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 150ms ease',
          cursor: !isValid || isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? (
          <span
            className="inline-block w-[18px] h-[18px] rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent', borderRightColor: '#ffffff' }}
          />
        ) : null}
        {isLoading ? 'Acessando...' : 'Acessar'}
      </button>

      <a
        href="/recuperacao-senha"
        className="text-xs text-center no-underline"
        style={{ color: 'var(--primary)', transition: 'opacity 150ms ease' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        Esqueci minha senha
      </a>
    </form>
  )
}
