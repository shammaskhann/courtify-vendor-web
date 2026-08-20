'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/forms/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { siteConfig } from '@/config/site'
import {
  getVendorProfile,
  updateVendorProfile,
  changePassword,
  type UserProfile
} from '@/lib/api/settingsApi'
import { Building2, Mail, Phone, Lock, CreditCard, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

type TabId = 'profile' | 'account' | 'payments'

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'account', label: 'Account Security', icon: Lock },
  { id: 'payments', label: 'Payouts & Banking', icon: CreditCard },
]

export default function SettingsPage() {
  const { updateSessionUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formProfile, setFormProfile] = useState({
    name: '',
    isNotificationsEnabled: true,
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    let mounted = true
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await getVendorProfile()
        if (mounted) {
          setProfile(data)
          setFormProfile({
            name: data.name || '',
            isNotificationsEnabled: data.isNotificationsEnabled,
          })
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to fetch profile', err)
          setError('Failed to load profile data.')
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }
    
    fetchProfile()
    return () => { mounted = false }
  }, [])

  const switchTab = (tab: TabId) => {
    setActiveTab(tab)
    setError(null)
    setSuccess(null)
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      await updateVendorProfile({
        name: formProfile.name,
        isNotificationsEnabled: formProfile.isNotificationsEnabled,
      })
      
      const data = await getVendorProfile()
      setProfile(data)
      setFormProfile({
        name: data.name || '',
        isNotificationsEnabled: data.isNotificationsEnabled,
      })
      updateSessionUser({ name: data.name })
      setSuccess('Business profile updated.')
    } catch (err) {
      setError((err as Error).message || 'Could not save your changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    
    setIsSaving(true)
    
    try {
      await changePassword({
        oldPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully')
    } catch (err) {
      toast.error((err as Error).message || 'Could not save your changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const banner = (
    <>
      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error-text text-body-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-success-bg border border-success/20 text-success-text text-body-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}
    </>
  )

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
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
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
            <form onSubmit={handleProfileSave} className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Business Profile</h3>
                <p className="text-body-sm text-secondary">Update your vendor details and preferences.</p>
              </div>

              {banner}

              {isLoading ? (
                <div className="text-body-sm text-secondary py-4">Loading profile...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="md:col-span-2">
                      <Input
                        label="Business Name"
                        required
                        value={formProfile.name}
                        onChange={(e) => setFormProfile({ ...formProfile, name: e.target.value })}
                      />
                    </div>
                    <Input
                      label="Support Email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      leftIcon={<Mail size={16} />}
                      helperText="Contact support to change your email."
                    />
                    <Input
                      label="Support Phone"
                      type="tel"
                      value={profile?.contact || ''}
                      disabled
                      leftIcon={<Phone size={16} />}
                      helperText="Contact support to change your phone number."
                    />
                  </div>

                  <div className="pt-4 pb-2">
                    <h4 className="text-body font-semibold text-primary mb-3">Notification Preferences</h4>
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface-variant/30">
                      <input
                        type="checkbox"
                        id="isNotificationsEnabled"
                        checked={formProfile.isNotificationsEnabled}
                        onChange={(e) => setFormProfile({ ...formProfile, isNotificationsEnabled: e.target.checked })}
                        className="mt-1 w-4 h-4 text-brand rounded border-border focus:ring-brand accent-brand"
                      />
                      <div>
                        <label htmlFor="isNotificationsEnabled" className="text-body-sm font-medium text-primary block">
                          Receive Email Notifications
                        </label>
                        <span className="text-caption text-secondary">Get notified when new bookings or cancellations happen.</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-end">
                    <Button type="submit" isLoading={isSaving}>Save Changes</Button>
                  </div>
                </>
              )}
            </form>
          )}

          {activeTab === 'account' && (
            <form onSubmit={handlePasswordSave} className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Account Security</h3>
                <p className="text-body-sm text-secondary">Change the password you use to sign in.</p>
              </div>

              {banner}

              <div className="space-y-4 max-w-md pt-2">
                <Input
                  label="Current Password"
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                />
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <Button type="submit" isLoading={isSaving}>Update Password</Button>
              </div>
            </form>
          )}

          {activeTab === 'payments' && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-h4 font-semibold text-primary mb-1">Payouts & Banking</h3>
                <p className="text-body-sm text-secondary">Manage where your earnings are sent.</p>
              </div>

              <div className="flex flex-col items-center text-center p-8 rounded-xl border border-dashed border-border bg-surface-variant/30">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-border mb-4">
                  <CreditCard size={22} className="text-secondary" />
                </div>
                <h4 className="text-body font-semibold text-primary mb-1">No payout account on file</h4>
                <p className="text-body-sm text-secondary max-w-sm mb-4">
                  Bank details are collected and verified by the Courtify team so your
                  earnings go to the right account. Contact us to set yours up.
                </p>
                <a
                  href={`mailto:${siteConfig.supportEmail}?subject=Payout%20account%20setup`}
                  className="text-body-sm font-medium text-brand hover:underline"
                >
                  {siteConfig.supportEmail}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
