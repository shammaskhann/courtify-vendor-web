'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Database, Tag, Activity, List, Users } from 'lucide-react'
import { useMarketplaceMetadata } from '@/hooks/useAdminMetadata'
import { MetadataCategoriesTab } from '@/components/admin/metadata/MetadataCategoriesTab'
import { MetadataBrandsTab } from '@/components/admin/metadata/MetadataBrandsTab'
import { MetadataApparelSizesTab } from '@/components/admin/metadata/MetadataApparelSizesTab'
import { MetadataShoeSizesTab } from '@/components/admin/metadata/MetadataShoeSizesTab'
import { MetadataGendersTab } from '@/components/admin/metadata/MetadataGendersTab'

type TabId = 'categories' | 'brands' | 'apparel' | 'shoes' | 'genders'

export default function AdminMetadataPage() {
  const [activeTab, setActiveTab] = useState<TabId>('categories')
  const { data, isLoading, error } = useMarketplaceMetadata()

  const tabs = [
    { id: 'categories', label: 'Categories', icon: <Database size={18} /> },
    { id: 'brands', label: 'Brands', icon: <Tag size={18} /> },
    { id: 'apparel', label: 'Apparel Sizes', icon: <Activity size={18} /> },
    { id: 'shoes', label: 'Shoe Sizes', icon: <List size={18} /> },
    { id: 'genders', label: 'Genders', icon: <Users size={18} /> },
  ] as const

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Marketplace Metadata"
        subtitle="Manage categories, brands, and sizing configurations for the marketplace."
      />

      {error && (
        <div className="p-4 text-error bg-error-bg rounded-lg border border-error/20">
          Failed to load metadata: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border overflow-x-auto shrink-0 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`pb-4 text-body font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id ? 'text-brand' : 'text-secondary hover:text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {activeTab === 'categories' && (
          <MetadataCategoriesTab categories={data?.categories || []} isLoading={isLoading} />
        )}
        {activeTab === 'brands' && (
          <MetadataBrandsTab brands={data?.brands || []} isLoading={isLoading} />
        )}
        {activeTab === 'apparel' && (
          <MetadataApparelSizesTab sizes={data?.apparelSizes || []} isLoading={isLoading} />
        )}
        {activeTab === 'shoes' && (
          <MetadataShoeSizesTab sizes={data?.shoeSizes || []} isLoading={isLoading} />
        )}
        {activeTab === 'genders' && (
          <MetadataGendersTab genders={data?.genders || []} isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}
