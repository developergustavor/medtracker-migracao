// libs
import { cn } from '@/libs/shadcn.utils'

const _loc = '@/components/ui/skeleton'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md', className)} style={{ backgroundColor: 'var(--elevated)' }} {...props} />
}

export { Skeleton }
