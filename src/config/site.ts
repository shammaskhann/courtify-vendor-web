export const siteConfig = {
  name: 'Courtify',
  description: 'Vendor Panel — Manage your courts, maximize your revenue.',
  version: '1.0.0',
  supportEmail: 'support@courtify.app',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
} as const

export type SiteConfig = typeof siteConfig
