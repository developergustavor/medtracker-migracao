// packages
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Building, Lock1, Eye, EyeSlash } from 'iconsax-react'

// entities
import { loginByCmeSchema } from '@/entities'
import type { LoginByCmeSchema } from '@/entities'

// store
import { useAuthStore } from '@/store'

// libs
import { api } from '@/libs'

// constants
import { HTTP_STATUS_CODE } from '@/constants'

// utils
import { treatError } from '@/utils'

const _loc = '@/pages/login/CmeForm'

export function CmeForm() {
  const navigate = useNavigate()
  const { loginCme } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { isValid }
  } = useForm<LoginByCmeSchema>({
    resolver: zodResolver(loginByCmeSchema),
    mode: 'onChange'
  })

  const { ref: registerRef, ...usernameRegisterRest } = register('username')

  // FIX 1: Auto-focus first input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const onSubmit = async (data: LoginByCmeSchema) => {
    const fullLoc = `${_loc}.onSubmit`
    setIsLoading(true)
    setErrorMsg('')

    try {
      const response = await api.post('/api/auth', {
        action: 'cme',
        username: data.username,
        password: data.password?.trim()
      })

      const res = response.data

      if (res?.statusCode === HTTP_STATUS_CODE.OK) {
        const cme = res.body[0]
        loginCme(cme, res.token)
        navigate('/home', { replace: true })
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
          Usuário
        </label>
        <div className="relative">
          <span
            className="absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <Building size={18} color="currentColor" />
          </span>
          <input
            {...usernameRegisterRest}
            ref={e => {
              registerRef(e)
              ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = e
            }}
            type="text"
            placeholder="Digite o usuário da CME"
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
            placeholder="Digite a senha"
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
    </form>
  )
}
