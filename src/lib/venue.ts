import type { AdminVenue, Court } from '@/types/models'

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'DISABLED'

/**
 * Moderation state for a venue. Disabled wins over approved, so a venue that
 * was approved and later taken down reads as DISABLED rather than APPROVED.
 */
export function getVenueStatus(venue: Pick<AdminVenue, 'isApproved' | 'isDisabled'>): ModerationStatus {
  if (venue.isDisabled) return 'DISABLED'
  if (venue.isApproved) return 'APPROVED'
  return 'PENDING'
}

/**
 * Moderation state for a court. `isApproved` is only present on admin
 * payloads, so an absent value is treated as approved rather than guessed at.
 */
export function getCourtStatus(court: Pick<Court, 'isDisabled' | 'isApproved'>): ModerationStatus {
  if (court.isDisabled) return 'DISABLED'
  if (court.isApproved === false) return 'PENDING'
  return 'APPROVED'
}

/** Maps a moderation status to the key understood by `StatusBadge`. */
export function statusToBadge(status: ModerationStatus): string {
  if (status === 'APPROVED') return 'ACTIVE'
  return status
}

export function getVenueDisplayName(venue: Pick<AdminVenue, 'businessName' | 'name'>): string {
  return venue.businessName || venue.name || 'Unnamed venue'
}

export function getCourtDisplayName(court: Pick<Court, 'name' | 'courtName'>): string {
  return court.name || court.courtName || 'Unnamed court'
}

export function getSportLabel(court: Pick<Court, 'sportType'>): string {
  if (Array.isArray(court.sportType)) return court.sportType.join(', ') || '—'
  return court.sportType || '—'
}

export function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
