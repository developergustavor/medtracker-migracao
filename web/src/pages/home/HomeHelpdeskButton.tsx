// hooks
import { useIsMobile } from '@/hooks'

const _loc = '@/pages/home/HomeHelpdeskButton'

export function HomeHelpdeskButton() {
  const isMobile = useIsMobile()

  const handleClick = () => {
    const fullLoc = `${_loc}.handleClick`
    console.log(`[${fullLoc}] Helpdesk button clicked`)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed z-50 flex items-center justify-center w-[48px] h-[48px] rounded-full transition-all hover:scale-105 active:scale-95 cursor-pointer"
      style={{
        bottom: isMobile ? '80px' : '24px',
        right: isMobile ? '16px' : '24px',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-70))',
        boxShadow: '0 4px 20px var(--primary-20)'
      }}
    >
      <img
        src="/icons/logo/logo-icon-white.svg"
        alt=""
        width={22}
        height={22}
      />
    </button>
  )
}
