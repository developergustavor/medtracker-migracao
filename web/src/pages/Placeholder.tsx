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
    <div className="flex flex-col items-center justify-center p-3xl gap-md" style={{ minHeight: 300 }}>
      <div
        className="flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--primary-8)'
        }}
      >
        <span style={{ fontSize: 20, color: 'var(--primary)' }}>&#x1F6A7;</span>
      </div>
      <h2 style={{ fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--foreground)' }}>
        {pageName || 'Página'}
      </h2>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)', textAlign: 'center' }}>
        Esta página será implementada nas próximas tasks.
      </p>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--fg-muted)',
          padding: '4px 12px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'var(--elevated)'
        }}
      >
        {location.pathname}
      </span>
    </div>
  )
}
