// packages
import { Notification } from 'iconsax-react'

// mock
import { mockNotifications } from '@/mock/data'

const _loc = '@/pages/home/HomeNotifications'

export function HomeNotifications() {
  const handleClick = () => {
    const fullLoc = `${_loc}.handleClick`
    console.log(`[${fullLoc}] Notifications card clicked`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center gap-[6px] rounded-[10px] border border-border bg-card text-left transition-all hover:opacity-90 cursor-pointer snap-start"
      style={{ padding: '10px 14px', minWidth: '110px', maxWidth: '130px' }}
    >
      <div className="relative">
        <Notification size={22} color="var(--foreground)" variant="Linear" />
        <span
          className="absolute -top-[4px] -right-[6px] flex items-center justify-center min-w-[16px] h-[16px] px-[4px] rounded-full text-[9px] font-bold bg-destructive text-white"
        >
          {mockNotifications.length}
        </span>
      </div>
      <span className="text-[11px] font-semibold text-foreground leading-tight text-center">
        Notificações
      </span>
    </button>
  )
}
