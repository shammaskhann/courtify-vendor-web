'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { MapPin, Star, Dumbbell, Plus, X, RefreshCw } from 'lucide-react'
import { getAmenities, addAmenity, deleteAmenity, getCities, addCity, deleteCity, getSportTypes, addSportType, deleteSportType } from '@/lib/api/adminApi'
import type { CommonItem } from '@/types/models'
import toast from 'react-hot-toast'

type TabKey = 'amenities' | 'cities' | 'sports'

const TABS = [
  {
    key: 'amenities' as const,
    label: 'Amenities',
    singular: 'Amenity',
    icon: Star,
    fetch: getAmenities,
    add: addAmenity,
    delete: deleteAmenity,
    placeholder: 'e.g. Parking, Showers',
  },
  {
    key: 'cities' as const,
    label: 'Cities',
    singular: 'City',
    icon: MapPin,
    fetch: getCities,
    add: addCity,
    delete: deleteCity,
    placeholder: 'e.g. Karachi, Lahore',
  },
  {
    key: 'sports' as const,
    label: 'Sport Types',
    singular: 'Sport Type',
    icon: Dumbbell,
    fetch: getSportTypes,
    add: addSportType,
    delete: deleteSportType,
    placeholder: 'e.g. Padel, Football',
  },
]

export default function AdminCommonManagementPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('amenities')
  const [data, setData] = useState<Record<TabKey, CommonItem[]>>({ amenities: [], cities: [], sports: [] })
  const [loading, setLoading] = useState<Record<TabKey, boolean>>({ amenities: false, cities: false, sports: false })
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [confirm, setConfirm] = useState<{ open: boolean; item?: CommonItem }>({ open: false })

  const tabDef = TABS.find(t => t.key === activeTab)!
  const currentList = data[activeTab] || []
  const isLoading = loading[activeTab]

  const loadTab = async (key: TabKey) => {
    const t = TABS.find(x => x.key === key)!
    setLoading(prev => ({ ...prev, [key]: true }))
    try {
      const resp = await t.fetch()
      // API might return standard array or PaginatedResponse
      const list = Array.isArray(resp) ? resp : (resp as any).content || (resp as any).data || []
      setData(prev => ({ ...prev, [key]: list }))
    } catch (err: any) {
      console.error(String(err))
      toast.error(err.message || `Failed to load ${t.label}`)
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  useEffect(() => {
    setInput('')
    if (data[activeTab].length === 0) {
      loadTab(activeTab)
    }
  }, [activeTab])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const exists = currentList.some(item => (item.name || '').toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      toast.error(`${tabDef.singular} "${trimmed}" already exists`)
      return
    }

    setAdding(true)
    try {
      await tabDef.add({ name: trimmed })
      toast.success(`${tabDef.singular} added successfully`)
      setInput('')
      loadTab(activeTab)
    } catch (err: any) {
      console.error(String(err))
      toast.error(err.message || `Failed to add ${tabDef.singular.toLowerCase()}`)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm.item) return
    const item = confirm.item
    
    // Optimistic remove
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(i => i.id !== item.id)
    }))
    
    try {
      await tabDef.delete(item.id)
      toast.success(`${tabDef.singular} deleted successfully`)
    } catch (err: any) {
      // Restore list on failure
      loadTab(activeTab)
      toast.error(err.message || `Failed to delete ${tabDef.singular.toLowerCase()}`)
    } finally {
      setConfirm({ open: false })
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8 max-w-5xl">
      <PageHeader
        title="Common Management"
        subtitle="Manage reference data used across Courtify"
        actions={
          <Button variant="secondary" size="icon" onClick={() => loadTab(activeTab)} title="Refresh current tab">
            <RefreshCw size={16} />
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex bg-surface-variant p-1 rounded-lg w-max border border-border">
        {TABS.map(t => {
          const Icon = t.icon
          const isActive = activeTab === t.key
          return (
            <button
              key={t.key}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                isActive ? 'bg-surface shadow-sm text-primary' : 'text-secondary hover:text-primary'
              }`}
              onClick={() => setActiveTab(t.key as TabKey)}
            >
              <Icon size={16} />
              {t.label}
              {data[t.key as TabKey]?.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-brand/10 text-brand' : 'bg-border text-secondary'}`}>
                  {data[t.key as TabKey].length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add New Form */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-sm h-max">
          <h3 className="text-h4 mb-4">Add New {tabDef.singular}</h3>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder={tabDef.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full bg-surface-variant border border-border/60 focus:border-brand focus:ring-1 focus:ring-brand rounded-lg px-4 py-3 text-body outline-none transition-all placeholder:text-secondary/50"
            />
            <Button type="submit" disabled={adding || !input.trim()} className="w-full justify-center">
              <Plus size={16} className="mr-2" />
              {adding ? 'Adding...' : `Add ${tabDef.singular}`}
            </Button>
          </form>
        </div>

        {/* List View */}
        <div className="md:col-span-2 bg-surface rounded-xl border border-border overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-border flex justify-between items-center bg-surface-variant/30">
            <h3 className="text-h4 flex items-center gap-2">
              <tabDef.icon size={18} className="text-brand" />
              All {tabDef.label}
            </h3>
            <span className="text-sm text-secondary">{currentList.length} total</span>
          </div>

          <div className="p-4 flex-1">
            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-8 w-24 bg-surface-variant rounded-full animate-pulse" />
                ))}
              </div>
            ) : currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-secondary py-12">
                <tabDef.icon size={48} className="mb-4 opacity-50" />
                <p>No {tabDef.label.toLowerCase()} added yet.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentList.map((item, i) => {
                  // Fallbacks for data shape differences
                  const name = item.name || (item as any).label || (typeof item === 'string' ? item : 'Unknown')
                  const id = item.id ?? i
                  return (
                    <div
                      key={id}
                      className="group flex items-center gap-2 px-3 py-1.5 bg-surface-variant rounded-full text-sm border border-border hover:border-brand/30 transition-colors"
                    >
                      <tabDef.icon size={12} className="text-secondary group-hover:text-brand" />
                      <span className="text-body font-medium">{name}</span>
                      <button
                        onClick={() => setConfirm({ open: true, item })}
                        className="ml-1 p-0.5 text-secondary hover:text-error hover:bg-error-bg rounded-full transition-colors"
                        title="Delete"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false })}
        onConfirm={handleDelete}
        title={`Delete ${tabDef.singular}`}
        message={`Are you sure you want to delete "${confirm.item?.name}"? This action cannot be undone.`}
        confirmVariant="danger"
        confirmLabel="Delete"
      />
    </div>
  )
}
