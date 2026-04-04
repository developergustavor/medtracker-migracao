// components
import { Skeleton } from '@/components/ui/skeleton'

const _loc = '@/components/loaders/PageSkeleton'

export function PageSkeleton() {
  return (
    <div className="p-xl flex flex-col gap-lg">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-48" />

      {/* Subtitle */}
      <Skeleton className="h-4 w-72" />

      {/* Content cards grid */}
      <div className="grid grid-cols-1 gap-md mt-lg" style={{ maxWidth: 800 }}>
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="grid grid-cols-2 gap-md">
          <Skeleton className="h-32 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    </div>
  )
}
