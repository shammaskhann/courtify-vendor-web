'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { SlideOver } from '../ui/SlideOver'
import { Button } from '../ui/Button'
import { Input } from '../forms/Input'
import { StatusBadge } from '../ui/StatusBadge'
import { verifyQr, updateBookingStatus } from '@/lib/api/bookingApi'
import type { Booking } from '@/types/models'
import { Camera, CheckCircle2, XCircle, QrCode, Clock, MapPin, User } from 'lucide-react'

interface DetectedBarcode {
  rawValue: string
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>
}

type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike

/**
 * Chrome/Edge (desktop + Android) ship a native QR decoder. Where it's missing —
 * Safari, notably — the panel falls back to typing the reference by hand rather
 * than pulling in a scanning library.
 */
function getBarcodeDetector(): BarcodeDetectorCtor | null {
  if (typeof window === 'undefined') return null
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null
}

interface CheckInPanelProps {
  isOpen: boolean
  onClose: () => void
  /** Refresh the caller's booking list after a successful check-in. */
  onCheckedIn: () => void
}

export function CheckInPanel({ isOpen, onClose, onCheckedIn }: CheckInPanelProps) {
  const [token, setToken] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scannerSupported, setScannerSupported] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  // Guards against the detection loop firing verify repeatedly for one code.
  const isHandlingRef = useRef(false)

  useEffect(() => {
    setScannerSupported(getBarcodeDetector() !== null)
  }, [])

  const reset = useCallback(() => {
    setToken('')
    setBooking(null)
    setError(null)
    setIsScanning(false)
    isHandlingRef.current = false
  }, [])

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  const handleVerify = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed || isHandlingRef.current) return

    isHandlingRef.current = true
    setIsScanning(false)
    setIsVerifying(true)
    setError(null)

    try {
      const result = await verifyQr(trimmed)
      setBooking(result)
    } catch (err) {
      setError((err as Error).message || 'That code could not be verified.')
      setBooking(null)
    } finally {
      setIsVerifying(false)
      isHandlingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isScanning) return

    let cancelled = false
    let stream: MediaStream | null = null
    let intervalId: number | undefined

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        const video = videoRef.current
        if (!video) return

        video.srcObject = stream
        await video.play()

        const Detector = getBarcodeDetector()
        if (!Detector) return
        const detector = new Detector({ formats: ['qr_code'] })

        intervalId = window.setInterval(async () => {
          const current = videoRef.current
          if (!current || current.readyState < 2) return

          try {
            const codes = await detector.detect(current)
            if (codes.length > 0 && codes[0].rawValue) {
              handleVerify(codes[0].rawValue)
            }
          } catch {
            // Frames that fail to decode are expected while the user aims.
          }
        }, 400)
      } catch {
        if (!cancelled) {
          setError('Could not access the camera. Check browser permissions, or enter the code manually.')
          setIsScanning(false)
        }
      }
    }

    start()

    return () => {
      cancelled = true
      if (intervalId) window.clearInterval(intervalId)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [isScanning, handleVerify])

  const handleComplete = async () => {
    if (!booking) return

    try {
      setIsCompleting(true)
      await updateBookingStatus(booking.id, 'COMPLETED')
      onCheckedIn()
      reset()
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Failed to complete this booking.')
    } finally {
      setIsCompleting(false)
    }
  }

  const footer = booking ? (
    <>
      <Button variant="secondary" onClick={reset} className="mr-auto">
        Check in another
      </Button>
      {booking.status !== 'COMPLETED' && (
        <Button variant="primary" onClick={handleComplete} isLoading={isCompleting}>
          Mark as Completed
        </Button>
      )}
    </>
  ) : (
    <Button variant="secondary" onClick={onClose} className="mr-auto">
      Close
    </Button>
  )

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Check in a booking"
      subtitle="Scan the customer's QR code or enter their booking reference."
      footer={footer}
      width="lg"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-error-bg text-error-text p-3 rounded-lg border border-error/20 text-body-sm flex items-start gap-2">
            <XCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {booking ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success-bg border border-success/20">
              <CheckCircle2 size={24} className="text-success-text shrink-0" />
              <div>
                <p className="text-body font-semibold text-primary">Booking verified</p>
                <p className="text-caption text-secondary">
                  Ref: {booking.bookingReference || booking.id}
                </p>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg divide-y divide-border">
              <div className="p-3 flex items-start gap-3">
                <User size={18} className="text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-sm font-medium text-primary">
                    {booking.customerName || `User #${booking.userId ?? booking.customerId ?? 'Unknown'}`}
                  </p>
                  {booking.customerContact && (
                    <p className="text-caption text-secondary">{booking.customerContact}</p>
                  )}
                </div>
              </div>
              <div className="p-3 flex items-start gap-3">
                <Clock size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-sm font-medium text-primary">
                    {booking.startTime} - {booking.endTime}
                  </p>
                  <p className="text-caption text-secondary">
                    {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="p-3 flex items-start gap-3">
                <MapPin size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-body-sm font-medium text-primary">
                    {booking.courtName || `Court #${booking.courtId}`}
                  </p>
                  <p className="text-caption text-secondary">
                    {booking.venueName || `Venue #${booking.venueId}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-caption text-secondary mb-1">Booking Status</p>
                <StatusBadge status={booking.status} />
              </div>
              <div className="flex-1">
                <p className="text-caption text-secondary mb-1">Payment Status</p>
                <StatusBadge status={booking.paymentStatus} />
              </div>
            </div>
          </div>
        ) : (
          <>
            {isScanning ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#0A0A0A] border border-border">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-40 h-40 border-2 border-brand rounded-xl shadow-[0_0_0_9999px_rgba(10,10,10,0.45)]" />
                  </div>
                </div>
                <Button variant="secondary" onClick={() => setIsScanning(false)} className="w-full">
                  Stop camera
                </Button>
              </div>
            ) : (
              scannerSupported && (
                <button
                  type="button"
                  onClick={() => { setError(null); setIsScanning(true) }}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-border bg-surface-variant hover:bg-surface hover:border-brand transition-colors flex flex-col items-center justify-center gap-3 text-secondary hover:text-brand"
                >
                  <Camera size={32} />
                  <span className="text-body-sm font-medium">Scan QR code with camera</span>
                </button>
              )
            )}

            <div className="space-y-3">
              {scannerSupported && !isScanning && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-caption text-tertiary uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              <form
                onSubmit={(e) => { e.preventDefault(); handleVerify(token) }}
                className="space-y-3"
              >
                <Input
                  label="Booking reference or QR code"
                  placeholder="e.g. BKG-847"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  leftIcon={<QrCode size={16} />}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isVerifying}
                  disabled={!token.trim()}
                >
                  Verify booking
                </Button>
              </form>

              {!scannerSupported && (
                <p className="text-caption text-tertiary text-center">
                  Camera scanning isn&apos;t supported in this browser. Chrome or Edge enable it.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </SlideOver>
  )
}
