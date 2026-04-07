// packages
import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldTick, ArrowLeft2 } from 'iconsax-react'

// store
import { useAuthStore } from '@/store'

// libs
import { api } from '@/libs'

// constants
import { HTTP_STATUS_CODE } from '@/constants'

// utils
import { treatError } from '@/utils'

const _loc = '@/pages/login/TwoFactorView'

const CODE_LENGTH = 5
const RESEND_COOLDOWN = 30

type TwoFactorViewProps = {
  userId: number
  email: string
  onBack: () => void
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '*****@***.***'
  const [local, domain] = email.split('@')
  const visible = local.slice(0, 5)
  const masked = local.length > 5 ? '*'.repeat(local.length - 5) : ''
  return `${visible}${masked}@${domain}`
}

export function TwoFactorView({ userId, email, onBack }: TwoFactorViewProps) {
  const navigate = useNavigate()
  const { login, setCme } = useAuthStore()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN)
  const [allSelected, setAllSelected] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const allFilled = digits.every(d => d !== '')

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const focusInput = (index: number) => {
    const clamped = Math.max(0, Math.min(index, CODE_LENGTH - 1))
    inputRefs.current[clamped]?.focus()
    inputRefs.current[clamped]?.select()
  }

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newDigits = [...digits]
    newDigits[index] = value.slice(-1)
    setDigits(newDigits)
    setErrorMsg('')

    if (value && index < CODE_LENGTH - 1) {
      focusInput(index + 1)
    }
  }, [digits])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl+A / Cmd+A: selecionar todos
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault()
      setAllSelected(true)
      return
    }

    // Ctrl+C / Cmd+C: copiar código completo
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault()
      const code = digits.join('')
      navigator.clipboard.writeText(code)
      setAllSelected(false)
      return
    }

    // Ctrl+V / Cmd+V: colar (handled by onPaste, but just in case)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      setAllSelected(false)
      return // let onPaste handle it
    }

    // Handle allSelected state
    if (allSelected) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        setDigits(Array(CODE_LENGTH).fill(''))
        setAllSelected(false)
        focusInput(0)
        return
      }

      if (/^\d$/.test(e.key)) {
        e.preventDefault()
        const newDigits = Array(CODE_LENGTH).fill('')
        newDigits[0] = e.key
        setDigits(newDigits)
        setAllSelected(false)
        focusInput(1)
        return
      }

      setAllSelected(false)
    }

    // Backspace: se vazio, vai pro anterior e apaga
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        focusInput(index - 1)
      }
      return
    }

    // Delete: apaga o atual e os seguintes shift-left
    if (e.key === 'Delete') {
      e.preventDefault()
      const newDigits = [...digits]
      for (let i = index; i < CODE_LENGTH - 1; i++) {
        newDigits[i] = newDigits[i + 1]
      }
      newDigits[CODE_LENGTH - 1] = ''
      setDigits(newDigits)
      return
    }

    // Arrow Left
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      if (index > 0) focusInput(index - 1)
      return
    }

    // Arrow Right
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (index < CODE_LENGTH - 1) focusInput(index + 1)
      return
    }

    // Enter: submit if all filled
    if (e.key === 'Enter') {
      e.preventDefault()
      if (allFilled && !isLoading) handleSubmit()
      return
    }
  }, [digits, allFilled, isLoading, allSelected]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const newDigits = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)
    setErrorMsg('')

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    focusInput(focusIndex)
  }, [])

  const handleSubmit = async () => {
    const fullLoc = `${_loc}.handleSubmit`
    if (!allFilled || isLoading) return

    setIsLoading(true)
    setErrorMsg('')

    try {
      const confirmationCode = digits.join('')
      const response = await api.post('/api/match-confirmation-code', {
        action: 'user-2fa',
        userId,
        email,
        confirmationCode
      })

      const res = response.data

      if (res?.statusCode === HTTP_STATUS_CODE.OK) {
        const user = res.body[0]
        login(user, res.token)
        if (user.cmes?.[0]) setCme(user.cmes[0])
        else if (res.body[1]) setCme(res.body[1])
        navigate('/home', { replace: true })
      } else {
        setErrorMsg(res?.statusMessage || 'Código de confirmação inválido.')
      }
    } catch (err) {
      console.error(`Unhandled rejection at ${fullLoc}. Details: ${treatError(err)}`)
      setErrorMsg(treatError(err, false) || 'Não foi possível verificar o código.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    if (resendTimer > 0) return
    setDigits(Array(CODE_LENGTH).fill(''))
    setErrorMsg('')
    setResendTimer(RESEND_COOLDOWN)
    focusInput(0)
  }

  return (
    <div className="flex flex-col items-center gap-[20px] w-full">
      {/* Icon */}
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, #2155FC, #4B7BFF)',
          color: '#ffffff'
        }}
      >
        <ShieldTick size={28} color="currentColor" />
      </div>

      {/* Title */}
      <div className="flex flex-col items-center gap-[4px]">
        <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          Verificação em duas etapas
        </h2>
        <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
          Enviamos um código para {maskEmail(email)}
        </p>
      </div>

      {/* OTP Inputs */}
      <div className="flex gap-[8px] justify-center" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            className="w-[48px] h-[52px] rounded-[10px] border text-center text-lg font-semibold outline-none"
            style={{
              backgroundColor: allSelected ? 'var(--primary-15)' : 'var(--input)',
              borderColor: allSelected || digit ? 'var(--primary)' : 'var(--border)',
              color: 'var(--foreground)',
              transition: 'all 150ms ease',
              caretColor: 'var(--primary)'
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.select()
            }}
            onBlur={e => { e.currentTarget.style.borderColor = allSelected || digit ? 'var(--primary)' : 'var(--border)' }}
          />
        ))}
      </div>

      {/* Error */}
      {errorMsg && (
        <p className="text-xs" style={{ color: 'var(--destructive)' }}>
          {errorMsg}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        disabled={!allFilled || isLoading}
        onClick={handleSubmit}
        className="w-full rounded-[10px] border-none text-sm font-semibold cursor-pointer flex items-center justify-center gap-[8px]"
        style={{
          height: 44,
          background: allFilled && !isLoading ? 'linear-gradient(135deg, #2155FC, #4B7BFF)' : 'var(--muted)',
          color: allFilled && !isLoading ? '#ffffff' : 'var(--muted-foreground)',
          opacity: isLoading ? 0.7 : 1,
          transition: 'all 150ms ease',
          cursor: !allFilled || isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? (
          <span
            className="inline-block w-[18px] h-[18px] rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent', borderRightColor: '#ffffff' }}
          />
        ) : null}
        {isLoading ? 'Verificando...' : 'Verificar'}
      </button>

      {/* Footer actions */}
      <div className="flex items-center justify-center gap-[24px]" style={{ marginTop: 4 }}>
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-[6px] text-sm border-none bg-transparent cursor-pointer p-0 font-medium"
          style={{ color: 'var(--foreground)', transition: 'opacity 150ms ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          <ArrowLeft2 size={16} color="currentColor" />
          Voltar
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)' }} />

        {/* Resend button */}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="text-sm border-none bg-transparent p-0 font-medium"
          style={{
            color: resendTimer > 0 ? 'var(--muted-foreground)' : 'var(--primary)',
            cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
            opacity: resendTimer > 0 ? 0.6 : 1,
            transition: 'opacity 150ms ease'
          }}
          onMouseEnter={e => { if (resendTimer <= 0) (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = resendTimer > 0 ? '0.6' : '1' }}
        >
          {resendTimer > 0 ? `Reenviar código (${resendTimer}s)` : 'Reenviar código'}
        </button>
      </div>
    </div>
  )
}
