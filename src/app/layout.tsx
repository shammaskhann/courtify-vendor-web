import type { Metadata, Viewport } from 'next'
import { inter } from '@/styles/fonts'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { MetadataProvider } from '@/contexts/MetadataContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { siteConfig } from '@/config/site'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <MetadataProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MetadataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
