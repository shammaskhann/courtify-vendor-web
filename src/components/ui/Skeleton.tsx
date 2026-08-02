import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-variant', className)}
      {...props}
    />
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col gap-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/4" />
      <div className="flex-1 mt-4">
        <Skeleton className="h-full w-full min-h-[100px] rounded-lg" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="p-4"><Skeleton className="h-5 w-full max-w-[120px]" /></td>
      <td className="p-4"><Skeleton className="h-5 w-full max-w-[200px]" /></td>
      <td className="p-4"><Skeleton className="h-5 w-full max-w-[150px]" /></td>
      <td className="p-4"><Skeleton className="h-6 w-20 rounded-pill" /></td>
      <td className="p-4 text-right"><Skeleton className="h-8 w-8 rounded-md ml-auto" /></td>
    </tr>
  )
}
