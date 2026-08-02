'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Building2, Mail, Phone, Lock, CreditCard, Bell, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      // Normally show a success toast here
    }, 800)
  }

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: Building2 },
    { id: 'account', label: 'Account Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payouts & Banking', icon: CreditCard },
  ]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader
        title="Settings"
        subtitle="Manage your business profile, account preferences, and payout methods."
      />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64 shrink-0 bg-surface border border-border rounded-xl p-2 shadow-sm">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-secondary hover:bg-surface-variant hover:text-primary'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-surface border border-border rounded-xl shadow-sm w-full">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Business Profile</h3>
                <p className="text-body-sm text-secondary">Update your vendor details and contact information.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Input label="Business Name" defaultValue="Courtify Sports LLC" required />
                <Input label="Business Registration Number" defaultValue="REG-99281-22" />
                <Input label="Support Email" type="email" defaultValue="support@courtifysports.com" leftIcon={<Mail size={16} />} required />
                <Input label="Support Phone" type="tel" defaultValue="+92 300 1234567" leftIcon={<Phone size={16} />} required />
                <div className="md:col-span-2">
                  <Input label="Website" type="url" defaultValue="https://courtifysports.com" leftIcon={<Globe size={16} />} />
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <Button type="submit" isLoading={isSaving}>Save Changes</Button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Account Security</h3>
                <p className="text-body-sm text-secondary">Manage your password and security settings.</p>
              </div>

              <form onSubmit={handleSave} className="space-y-4 max-w-md pt-4">
                <Input label="Current Password" type="password" required />
                <Input label="New Password" type="password" required />
                <Input label="Confirm New Password" type="password" required />
                
                <div className="pt-4">
                  <Button type="submit" isLoading={isSaving}>Update Password</Button>
                </div>
              </form>

              <div className="pt-6 border-t border-border">
                <h4 className="text-body font-medium text-primary mb-2">Two-Factor Authentication</h4>
                <p className="text-body-sm text-secondary mb-4">Add an extra layer of security to your account.</p>
                <Button variant="secondary">Enable 2FA</Button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Notification Preferences</h3>
                <p className="text-body-sm text-secondary">Choose what alerts you want to receive and how.</p>
              </div>

              <div className="space-y-4 pt-4">
                {[
                  { id: 'n1', label: 'New Bookings', desc: 'Get notified when a new booking is made.' },
                  { id: 'n2', label: 'Cancellations', desc: 'Get notified when a booking is cancelled.' },
                  { id: 'n3', label: 'Payments', desc: 'Get notified for successful payouts.' },
                  { id: 'n4', label: 'Marketing', desc: 'Receive Courtify updates and offers.', defaultUnchecked: true },
                ].map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-variant/30">
                    <input 
                      type="checkbox" 
                      id={item.id}
                      defaultChecked={!item.defaultUnchecked}
                      className="mt-1 w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
                    />
                    <div>
                      <label htmlFor={item.id} className="text-body-sm font-medium text-primary block">
                        {item.label}
                      </label>
                      <span className="text-caption text-secondary">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <Button type="submit" isLoading={isSaving}>Save Preferences</Button>
              </div>
            </form>
          )}

          {activeTab === 'payments' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Payouts & Banking</h3>
                <p className="text-body-sm text-secondary">Manage where your earnings are sent.</p>
              </div>

              <div className="bg-surface-variant border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface rounded shadow-sm border border-border flex items-center justify-center">
                    <CreditCard className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-primary">HBL - Habib Bank Limited</p>
                    <p className="text-caption text-secondary">**** **** **** 4592</p>
                  </div>
                </div>
                <StatusBadge status="ACTIVE" />
              </div>

              <div className="pt-2">
                <Button variant="secondary">Add New Bank Account</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
