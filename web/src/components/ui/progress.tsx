// packages
import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

// libs
import { cn } from '@/libs/shadcn.utils'

const _loc = '@/components/ui/progress'

type ProgressProps = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  indicatorColor?: string
  trackColor?: string
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(({ className, value, indicatorColor, trackColor, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn('relative h-2 w-full overflow-hidden rounded-full', className)} style={{ backgroundColor: trackColor || 'var(--elevated)' }} {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all duration-500 ease-out rounded-full"
      style={{
        backgroundColor: indicatorColor || 'var(--primary)',
        transform: `translateX(-${100 - (value || 0)}%)`
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
