// packages
import { useMemo } from 'react'
import { Calendar } from 'iconsax-react'

// store
import { useAuthStore } from '@/store'

// hooks
import { useIsMobile } from '@/hooks'

// pages
import { HomeMetrics } from './HomeMetrics'
import { HomeUpdateNote } from './HomeUpdateNote'
import { HomeWorkflowTabs } from './HomeWorkflowTabs'
import { HomeHelpdeskButton } from './HomeHelpdeskButton'

const _loc = '@/pages/home/Home'

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getFormattedDate(): string {
  const now = new Date()
  const day = now.getDate().toString().padStart(2, '0')
  const month = MONTHS_PT[now.getMonth()]
  const year = now.getFullYear()
  return `${day} de ${month}, ${year}`
}

export function Home() {
  const { user, cme } = useAuthStore()
  const isMobile = useIsMobile()

  const greeting = useMemo(() => getGreeting(), [])
  const formattedDate = useMemo(() => getFormattedDate(), [])

  const displayName = user?.name || cme?.corporateName || 'Usuário'

  return (
    <div className="flex flex-col gap-xl p-lg relative h-full overflow-y-auto lgAndUp:overflow-hidden">
      {/* Row 1: Greeting + Date */}
      <div className={`flex ${isMobile ? 'flex-col gap-sm' : 'items-center justify-between'}`}>
        <h1 className="text-display font-bold text-foreground truncate">
          {greeting}, {displayName}
        </h1>

        {!isMobile && (
          <div className="flex items-center gap-[6px] flex-shrink-0 text-muted-foreground">
            <Calendar size={16} color="currentColor" variant="Linear" />
            <span className="text-sm">{formattedDate}</span>
          </div>
        )}
      </div>

      {/* Row 2: Update note + Metrics side by side on desktop, stacked on mobile */}
      {isMobile ? (
        <>
          <HomeUpdateNote />
          <div className="grid grid-cols-2 gap-sm">
            <HomeMetrics />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-lg">
          <HomeUpdateNote />
          <div className="grid grid-cols-2 grid-rows-2 gap-sm">
            <HomeMetrics />
          </div>
        </div>
      )}

      {/* Row 3: Workflow cards (full width, fill remaining height on lgAndUp) */}
      <div className="lgAndUp:flex-1 lgAndUp:min-h-0">
        <HomeWorkflowTabs />
      </div>

      {/* Floating helpdesk */}
      <HomeHelpdeskButton />
    </div>
  )
}
