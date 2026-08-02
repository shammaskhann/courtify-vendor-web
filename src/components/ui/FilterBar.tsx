import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '../forms/Input'
import { Dropdown } from '../forms/Dropdown'
import { Button } from './Button'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'search' | 'date-range'
  options?: FilterOption[]
  placeholder?: string
}

interface FilterBarProps {
  configs: FilterConfig[]
  onFilterChange: (filters: Record<string, any>) => void
  className?: string
}

export function FilterBar({ configs, onFilterChange, className }: FilterBarProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (!value) delete newFilters[key]
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const activeFilterCount = Object.keys(filters).length

  return (
    <div className={cn('bg-surface border border-border rounded-xl p-4', className)}>
      <div className="flex items-center justify-between lg:hidden mb-4">
        <Button variant="secondary" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <Filter size={18} className="mr-2" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="text-secondary hover:text-primary">
            Clear all
          </Button>
        )}
      </div>

      <div className={cn('flex-col lg:flex-row gap-4', isMobileOpen ? 'flex' : 'hidden lg:flex')}>
        {configs.map((config) => {
          if (config.type === 'search') {
            return (
              <div key={config.key} className="flex-1 min-w-[200px]">
                <Input
                  placeholder={config.placeholder || 'Search...'}
                  value={filters[config.key] || ''}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
            )
          }

          if (config.type === 'select' && config.options) {
            return (
              <div key={config.key} className="w-full lg:w-48">
                <Dropdown
                  options={[
                    { label: `All ${config.label}`, value: '' },
                    ...config.options,
                  ]}
                  value={filters[config.key] || ''}
                  onChange={(e) => handleFilterChange(config.key, e.target.value)}
                />
              </div>
            )
          }

          return null
        })}

        {activeFilterCount > 0 && (
          <div className="hidden lg:flex items-center">
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-secondary hover:text-primary px-3"
            >
              <X size={18} className="mr-2" />
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
