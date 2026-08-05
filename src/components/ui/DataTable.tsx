import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { TableRowSkeleton } from './Skeleton'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

export interface ColumnDef<T> {
  header: string
  key?: keyof T
  render?: (item: T) => React.ReactNode
  accessor?: (item: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyStateTitle?: string
  emptyStateDescription?: string
  // Pagination
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  // Sorting
  sortColumn?: keyof T | string
  sortDirection?: 'asc' | 'desc'
  onSort?: (column: keyof T | string) => void
  className?: string
}

export function DataTable<T>({
  data = [],
  columns,
  isLoading = false,
  keyExtractor,
  onRowClick,
  emptyStateTitle = 'No data found',
  emptyStateDescription = 'There are no records to display at this time.',
  page,
  pageSize,
  total,
  onPageChange,
  sortColumn,
  sortDirection,
  onSort,
  className,
}: DataTableProps<T>) {
  const showPagination = page !== undefined && total !== undefined && onPageChange
  const totalPages = showPagination && pageSize ? Math.ceil(total / pageSize) : 1

  return (
    <div className={cn('bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-body">
          <thead className="bg-surface-variant border-b border-border text-secondary text-caption font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'p-4',
                    col.width,
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.sortable && 'cursor-pointer hover:text-primary transition-colors select-none'
                  )}
                  onClick={() => {
                    if (col.sortable && onSort) {
                      onSort(col.key || col.header)
                    }
                  }}
                >
                  <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end', col.align === 'center' && 'justify-center')}>
                    {col.header}
                    {col.sortable && sortColumn === (col.key || col.header) && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState
                    icon={Inbox}
                    title={emptyStateTitle}
                    description={emptyStateDescription}
                    className="border-none shadow-none bg-transparent"
                  />
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'bg-surface hover:bg-surface-variant transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={cn(
                        'p-4 align-middle',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center'
                      )}
                    >
                      {col.render ? col.render(item) : col.accessor ? col.accessor(item, rowIndex) : col.key ? (item[col.key] as React.ReactNode) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && data.length > 0 && !isLoading && (
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface">
          <div className="text-body-sm text-secondary">
            Showing <span className="font-medium text-primary">{Math.min((page - 1) * (pageSize || 10) + 1, total)}</span> to{' '}
            <span className="font-medium text-primary">{Math.min(page * (pageSize || 10), total)}</span> of{' '}
            <span className="font-medium text-primary">{total}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-2"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            <div className="text-body-sm font-medium px-2">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-2"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
