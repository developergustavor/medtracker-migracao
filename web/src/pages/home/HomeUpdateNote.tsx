// packages
import { InfoCircle, ArrowRight2 } from 'iconsax-react'

// mock
import { mockUpdateNote } from '@/mock/data'

const _loc = '@/pages/home/HomeUpdateNote'

export function HomeUpdateNote() {
  const note = mockUpdateNote
  if (!note) return null

  const handleClick = () => {
    const fullLoc = `${_loc}.handleClick`
    console.log(`[${fullLoc}] Update note clicked:`, note.title)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col gap-md w-full h-full rounded-[12px] border text-left transition-all hover:opacity-90 cursor-pointer"
      style={{
        padding: '20px',
        background: 'linear-gradient(135deg, var(--primary-7), var(--primary-15))',
        borderColor: 'var(--primary-15)',
        minHeight: 0
      }}
    >
      <div className="flex items-center gap-md w-full">
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-[10px] w-[36px] h-[36px]"
          style={{ background: 'var(--primary-20)' }}
        >
          <InfoCircle size={20} color="var(--primary)" variant="Bold" />
        </div>
        <span className="text-sm font-bold text-foreground leading-tight flex-1 min-w-0 truncate">
          {note.title}
        </span>
        <ArrowRight2 size={16} color="var(--primary)" variant="Linear" className="flex-shrink-0" />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        {note.description}
      </p>
    </button>
  )
}
