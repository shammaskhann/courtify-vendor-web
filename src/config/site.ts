export const siteConfig = {
  name: 'Courtify',
  description: 'Vendor Panel — Manage your courts, maximize your revenue.',
  version: '1.0.0',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@courtify.app',
  // Set these to surface phone/WhatsApp support on the Help page. Left blank,
  // those channels are hidden rather than advertised and unanswered.
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '',
  supportWhatsApp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? '',
  supportHours: process.env.NEXT_PUBLIC_SUPPORT_HOURS ?? '9:00 AM – 9:00 PM PKT, 7 days a week',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
} as const

export type SiteConfig = typeof siteConfig
