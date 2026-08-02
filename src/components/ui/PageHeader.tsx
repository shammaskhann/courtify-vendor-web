import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backLink?: string
  actions?: React.ReactNode
  className?: string
}
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function PageHeader({ title, subtitle, backLink, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
        'mb-8',
        className
      )}
    >
      <div>
        {backLink && (
          <Link href={backLink} className="text-secondary hover:text-primary transition-colors flex items-center gap-1 mb-2 text-sm font-medium">
            <ArrowLeft size={16} /> Back
          </Link>
        )}
        <h1 className="text-h3 font-semibold text-primary">{title}</h1>
        {subtitle && (
          <p className="text-body text-secondary mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
