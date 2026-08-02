'use client'

import { useState } from 'react'
import { Sidebar, Topbar } from '@/components/layout'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Mobile Sidebar overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 flex w-full max-w-xs flex-1 bg-surface">
              <Sidebar className="w-full" />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onMenuToggle={toggleMobileMenu} />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
