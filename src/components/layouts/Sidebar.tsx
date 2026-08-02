// src/components/layout/Sidebar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/common/Logo'
import { primaryNavigation, secondaryNavigation } from '@/config/navigation'
import { LogOut, ChevronLeft } from 'lucide-react'

interface SidebarProps {
    isCollapsed?: boolean
    onToggle?: () => void
    className?: string
}

export function Sidebar({
    isCollapsed = false,
    onToggle,
    className,
}: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside
            className={cn(
                'flex flex-col h-screen bg-surface border-r border-border',
                'transition-all duration-slow',
                isCollapsed ? 'w-nav-rail' : 'w-nav',
                className
            )}
            aria-label="Main navigation"
        >
            {/* Logo area */}
            <div className="flex items-center h-topbar px-4 border-b border-border shrink-0">
                {isCollapsed ? (
                    <Logo variant="mark" size="sm" />
                ) : (
                    <Logo variant="full" size="md" />
                )}
            </div>

            {/* Primary nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {primaryNavigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                        <Link
                            key={item.href}
                            href={item.disabled ? '#' : item.href}
                            aria-current={isActive ? 'page' : undefined}
                            aria-disabled={item.disabled}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                                'text-body font-medium transition-all duration-base',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                                isActive
                                    ? 'bg-brand text-[#1C1C1E]'
                                    : 'text-secondary hover:text-primary hover:bg-surface-variant',
                                item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                                isCollapsed && 'justify-center px-2'
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={18} className="shrink-0" aria-hidden="true" />
                            {!isCollapsed && (
                                <span className="truncate">{item.label}</span>
                            )}
                            {!isCollapsed && item.badge && item.badge > 0 && (
                                <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-pill bg-brand/20 text-brand text-caption font-semibold flex items-center justify-center">
                                    {item.badge > 99 ? '99+' : item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Secondary nav + footer */}
            <div className="border-t border-border py-4 px-2 space-y-1 shrink-0">
                {secondaryNavigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                                'text-body font-medium transition-all duration-base',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                                isActive
                                    ? 'bg-brand text-[#1C1C1E]'
                                    : 'text-secondary hover:text-primary hover:bg-surface-variant',
                                isCollapsed && 'justify-center px-2'
                            )}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={18} className="shrink-0" aria-hidden="true" />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    )
                })}

                {/* Collapse toggle */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                            'text-secondary hover:text-primary hover:bg-surface-variant',
                            'transition-all duration-base',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                            isCollapsed && 'justify-center px-2'
                        )}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronLeft
                            size={18}
                            className={cn(
                                'shrink-0 transition-transform duration-slow',
                                isCollapsed && 'rotate-180'
                            )}
                            aria-hidden="true"
                        />
                        {!isCollapsed && <span>Collapse</span>}
                    </button>
                )}

                {/* Sign out */}
                <button
                    className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                        'text-error hover:bg-error-bg',
                        'transition-all duration-base text-body font-medium',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error',
                        isCollapsed && 'justify-center px-2'
                    )}
                    aria-label="Sign out"
                    title={isCollapsed ? 'Sign out' : undefined}
                >
                    <LogOut size={18} className="shrink-0" aria-hidden="true" />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    )
}