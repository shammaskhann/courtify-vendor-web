'use client'

import { useState, type ReactNode } from 'react'
import { ImageOff } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

const GRADIENTS = [
  'from-emerald-600 to-teal-800',
  'from-sky-600 to-indigo-800',
  'from-violet-600 to-purple-800',
  'from-amber-500 to-orange-700',
  'from-rose-500 to-pink-800',
  'from-cyan-600 to-blue-800',
]

function gradientFor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000
  }
  return GRADIENTS[hash % GRADIENTS.length]
}

interface FallbackImageProps {
  src?: string | null
  alt: string
  /** Drives the fallback colour so an item keeps the same tint everywhere. */
  seed?: string
  className?: string
  imageClassName?: string
  children?: ReactNode
}

/**
 * Image with a deterministic gradient placeholder. Falls back when the URL is
 * missing *or* fails to load, so a dead link never leaves a blank card.
 */
export function FallbackImage({
  src,
  alt,
  seed,
  className,
  imageClassName,
  children,
}: FallbackImageProps) {
  const [failed, setFailed] = useState(false)
  const showPhoto = Boolean(src) && !failed

  return (
    <div className={cn('relative overflow-hidden bg-surface-variant', className)}>
      {showPhoto ? (
        <img
          src={src as string}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn('h-full w-full object-cover', imageClassName)}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br text-white/90',
            gradientFor(seed || alt)
          )}
        >
          {getInitials(alt) ? (
            <span className="text-h4 font-semibold tracking-tight">{getInitials(alt)}</span>
          ) : (
            <ImageOff size={22} className="opacity-80" />
          )}
        </div>
      )}
      {children}
    </div>
  )
}
