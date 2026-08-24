import { useState } from 'react'
import { SlideOver } from '@/components/ui/SlideOver'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/forms/Input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCampaign, type CreateCampaignInput } from '@/lib/api/campaignApi'
import { toast } from 'react-hot-toast'
import { Trash2, Plus } from 'lucide-react'

interface CreateCampaignSlideOverProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCampaignSlideOver({ isOpen, onClose }: CreateCampaignSlideOverProps) {
  const queryClient = useQueryClient()
  
  const [title, setTitle] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'BY_CITY' | 'BY_RADIUS'>('ALL')
  const [targetData, setTargetData] = useState('')
  
  const [additionalData, setAdditionalData] = useState<Array<{ key: string, value: string }>>([])

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      toast.success('Campaign drafted successfully')
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      resetForm()
      onClose()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create campaign')
    }
  })

  const resetForm = () => {
    setTitle('')
    setMessageBody('')
    setTargetAudience('ALL')
    setTargetData('')
    setAdditionalData([])
  }

  const handleAddKeyValue = () => {
    setAdditionalData([...additionalData, { key: '', value: '' }])
  }

  const handleRemoveKeyValue = (index: number) => {
    const newArr = [...additionalData]
    newArr.splice(index, 1)
    setAdditionalData(newArr)
  }

  const handleUpdateKeyValue = (index: number, field: 'key' | 'value', val: string) => {
    const newArr = [...additionalData]
    newArr[index][field] = val
    setAdditionalData(newArr)
  }

  const handleSubmit = () => {
    if (!title.trim() || !messageBody.trim()) {
      toast.error('Title and message are required')
      return
    }

    if (targetAudience !== 'ALL' && !targetData.trim()) {
      toast.error('Target criteria is required')
      return
    }

    const payload: CreateCampaignInput = {
      title: title.trim(),
      messageBody: messageBody.trim(),
      targetAudience,
    }

    if (targetAudience !== 'ALL') {
      payload.targetData = targetData.trim()
    }

    if (additionalData.length > 0) {
      payload.additionalData = additionalData.reduce((acc, item) => {
        if (item.key.trim() && item.value.trim()) {
          acc[item.key.trim()] = item.value.trim()
        }
        return acc
      }, {} as Record<string, string>)
    }

    createMutation.mutate(payload)
  }

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Create Campaign"
      subtitle="Draft a new broadcast message for your users."
      width="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createMutation.isPending}>
            Save Draft
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Input
          label="Campaign Title"
          placeholder="e.g. Summer Discount"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-body-sm font-medium text-primary">Message Body <span className="text-error">*</span></label>
          <textarea
            className="w-full min-h-[100px] bg-surface-variant border border-border rounded-lg px-3 py-2 text-body-sm text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-y"
            placeholder="Write your broadcast message here..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-body-sm font-medium text-primary">Target Audience</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-body-sm text-secondary cursor-pointer">
              <input
                type="radio"
                name="targetAudience"
                value="ALL"
                checked={targetAudience === 'ALL'}
                onChange={() => setTargetAudience('ALL')}
                className="text-brand focus:ring-brand"
              />
              All Users
            </label>
            <label className="flex items-center gap-2 text-body-sm text-secondary cursor-pointer">
              <input
                type="radio"
                name="targetAudience"
                value="BY_CITY"
                checked={targetAudience === 'BY_CITY'}
                onChange={() => setTargetAudience('BY_CITY')}
                className="text-brand focus:ring-brand"
              />
              By City
            </label>
            <label className="flex items-center gap-2 text-body-sm text-secondary cursor-pointer">
              <input
                type="radio"
                name="targetAudience"
                value="BY_RADIUS"
                checked={targetAudience === 'BY_RADIUS'}
                onChange={() => setTargetAudience('BY_RADIUS')}
                className="text-brand focus:ring-brand"
              />
              By Radius
            </label>
          </div>
        </div>

        {targetAudience === 'BY_CITY' && (
          <Input
            label="Target City"
            placeholder="e.g. London"
            value={targetData}
            onChange={(e) => setTargetData(e.target.value)}
            required
          />
        )}

        {targetAudience === 'BY_RADIUS' && (
          <Input
            label="Radius Coordinates / Distance"
            placeholder="e.g. 51.5074, -0.1278, 10km"
            value={targetData}
            onChange={(e) => setTargetData(e.target.value)}
            required
            helperText="Format: lat, lng, radius"
          />
        )}

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="text-body-sm font-medium text-primary">Additional Data (Optional)</label>
            <button
              onClick={handleAddKeyValue}
              className="text-xs font-medium text-brand hover:text-brand-hover flex items-center gap-1"
            >
              <Plus size={14} /> Add Field
            </button>
          </div>
          
          {additionalData.length === 0 ? (
            <p className="text-caption text-secondary">No additional data added. You can add key-value pairs to send hidden payload data.</p>
          ) : (
            <div className="space-y-2">
              {additionalData.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Key (e.g. promo_code)"
                    value={item.key}
                    onChange={(e) => handleUpdateKeyValue(index, 'key', e.target.value)}
                  />
                  <Input
                    placeholder="Value (e.g. SUMMER20)"
                    value={item.value}
                    onChange={(e) => handleUpdateKeyValue(index, 'value', e.target.value)}
                  />
                  <button
                    onClick={() => handleRemoveKeyValue(index)}
                    className="p-2.5 mt-0.5 text-error hover:bg-error-bg rounded-lg transition-colors shrink-0"
                    title="Remove field"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SlideOver>
  )
}
