import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './Button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isLoading = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isLoading, onClose])

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />
      
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative bg-surface rounded-xl shadow-lg w-full max-w-md p-6 flex flex-col gap-6',
          'transform transition-all'
        )}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-tertiary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md p-1"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex gap-4">
          <div
            className={cn(
              'h-12 w-12 rounded-full flex items-center justify-center shrink-0',
              confirmVariant === 'danger' ? 'bg-error-bg text-error' : 'bg-warning-bg text-warning-text'
            )}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 id="modal-title" className="text-h4 font-semibold text-primary">
              {title}
            </h2>
            <p className="text-body mt-2 text-secondary">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant === 'danger' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
