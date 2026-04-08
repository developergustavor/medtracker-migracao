// packages
import React from 'react'

// libs
import { cn } from '@/libs/shadcn.utils'

const _loc = '@/components/domain/StatusBadge'

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

type StatusBadgeProps = {
  status: string
  variant?: StatusBadgeVariant
  className?: string
}

const variantStyles: Record<StatusBadgeVariant, React.CSSProperties> = {
  success: {
    backgroundColor: 'var(--primary-10)',
    color: 'var(--primary)'
  },
  warning: {
    backgroundColor: 'var(--warning-10)',
    color: 'var(--warning)'
  },
  danger: {
    backgroundColor: 'var(--destructive-10)',
    color: 'var(--destructive)'
  },
  info: {
    backgroundColor: 'var(--info-10)',
    color: 'var(--info)'
  },
  default: {
    backgroundColor: 'var(--overlay-8)',
    color: 'var(--fg-muted)'
  }
}

function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center font-medium select-none', className)}
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--radius-pill)',
        padding: '2px 8px',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        lineHeight: 1.5
      }}
    >
      {status}
    </span>
  )
}

export { StatusBadge }
export type { StatusBadgeProps, StatusBadgeVariant }
