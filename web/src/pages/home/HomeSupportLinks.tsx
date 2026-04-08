// packages
import { Book1 } from 'iconsax-react'

const _loc = '@/pages/home/HomeSupportLinks'

export function HomeSupportLinks() {
  const handleClick = () => {
    const fullLoc = `${_loc}.handleClick`
    console.log(`[${fullLoc}] Support links card clicked`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-[6px] rounded-[10px] border border-border bg-card text-left transition-all hover:opacity-90 cursor-pointer snap-start"
      style={{ padding: '10px 14px', minWidth: '110px', maxWidth: '130px' }}
    >
      <Book1 size={22} color="var(--foreground)" variant="Linear" />
      <span className="text-[11px] font-semibold text-foreground leading-tight text-center">
        Apoio
      </span>
    </button>
  )
}
