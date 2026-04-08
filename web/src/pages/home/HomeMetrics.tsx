// packages
import { TrendUp, TrendDown } from 'iconsax-react'

// mock
import { mockMetrics } from '@/mock/data'

// types
import type { MockMetricProps } from '@/mock/data'

const _loc = '@/pages/home/HomeMetrics'

function MetricCard({ metric }: { metric: MockMetricProps }) {
  const isPositive = metric.delta >= 0

  return (
    <div
      className="flex items-center gap-md rounded-[10px] border border-border bg-card"
      style={{ padding: '10px 16px' }}
    >
      {/* Left: value */}
      <div className="flex items-baseline gap-[4px] flex-shrink-0">
        <span className="text-[22px] font-bold text-foreground leading-tight">{metric.value}</span>
      </div>

      {/* Right: label + trend */}
      <div className="flex-1 flex flex-col gap-[2px] min-w-0">
        <span className="text-xs text-foreground font-medium leading-tight truncate">{metric.label}</span>
        <div className="flex items-center gap-[4px]">
          <span className="text-[10px] text-muted-foreground leading-tight">{metric.period}</span>
          <span className="text-[10px] text-muted-foreground leading-tight">·</span>
          {isPositive ? (
            <TrendUp size={11} color="var(--primary)" variant="Linear" />
          ) : (
            <TrendDown size={11} color="var(--warning)" variant="Linear" />
          )}
          <span
            className="text-[10px] font-medium leading-tight"
            style={{ color: isPositive ? 'var(--primary)' : 'var(--warning)' }}
          >
            {isPositive ? '+' : ''}{metric.delta}{metric.deltaLabel.includes('%') ? '%' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}

export function HomeMetrics() {
  return (
    <>
      {mockMetrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </>
  )
}
