// packages
import { Scan } from 'iconsax-react'

export function FacialPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center gap-[16px] w-full py-[24px]">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 64,
          height: 64,
          backgroundColor: 'var(--muted)',
          color: 'var(--muted-foreground)'
        }}
      >
        <Scan size={28} color="currentColor" />
      </div>

      <div className="flex flex-col items-center gap-[4px]">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
          Login por reconhecimento facial
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Funcionalidade futura
        </p>
      </div>

      <button
        type="button"
        disabled
        className="w-full rounded-[10px] border-none text-sm font-semibold flex items-center justify-center"
        style={{
          height: 44,
          backgroundColor: 'var(--muted)',
          color: 'var(--muted-foreground)',
          cursor: 'not-allowed',
          opacity: 0.6
        }}
      >
        Indisponivel
      </button>
    </div>
  )
}
