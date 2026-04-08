// packages
import { useLocation } from 'react-router-dom'

const _loc = '@/pages/Placeholder'

export function Placeholder() {
  const location = useLocation()
  const pageName = location.pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    .join(' / ')

  return (
    <div className="flex flex-col items-center justify-center p-3xl gap-md h-full overflow-y-auto" style={{ minHeight: 300 }}>
      <div
        className="flex items-center justify-center rounded-md"
        style={{
          width: 48,
          height: 48,
          backgroundColor: 'var(--primary-8)'
        }}
      >
        <span style={{ fontSize: 20, color: 'var(--primary)' }}>&#x1F6A7;</span>
      </div>
      <h2 className="text-heading font-semibold text-foreground">
        {pageName || 'Página'}
      </h2>
      <p className="text-sm text-muted-foreground text-center">
        Esta página será implementada nas próximas tasks.
      </p>
      <span
        className="text-xs rounded-pill bg-elevated px-[12px] py-[4px]"
        style={{ color: 'var(--fg-muted)' }}
      >
        {location.pathname}
      </span>
    </div>
  )
}
