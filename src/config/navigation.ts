import {
  LayoutDashboard,
  Building2,
  Layers,
  CalendarDays,
  Tag,
  Users,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  Store,
  Database,
  Star,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
  isNew?: boolean
  disabled?: boolean
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const primaryNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Venues',
    href: '/venues',
    icon: Building2,
  },
  {
    label: 'Courts',
    href: '/courts',
    icon: Layers,
  },
  {
    label: 'Bookings',
    href: '/bookings',
    icon: CalendarDays,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Deals',
    href: '/deals',
    icon: Tag,
  },

  {
    label: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
]

export const adminNavigation: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Venues',
    href: '/admin/venues',
    icon: Building2,
  },
  {
    label: 'Courts',
    href: '/admin/courts',
    icon: Layers,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Bookings',
    href: '/admin/bookings',
    icon: CalendarDays,
  },
  {
    label: 'Marketplace',
    href: '/admin/marketplace',
    icon: Store,
  },
  {
    label: 'Metadata',
    href: '/admin/metadata',
    icon: Database,
  },
  {
    label: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    label: 'Common Settings',
    href: '/admin/common',
    icon: Settings,
  },
]

export const secondaryNavigation: NavItem[] = [
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    label: 'Help and Support',
    href: '/help',
    icon: HelpCircle,
  },
]
