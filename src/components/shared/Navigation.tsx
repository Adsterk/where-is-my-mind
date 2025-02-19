'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, PlusCircle, Settings } from 'lucide-react'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'

interface NavItem {
  title: string;
  icon: typeof LayoutDashboard;
  href: string;
  type?: never;
}

interface NavSeparator {
  type: 'separator';
  title?: never;
  icon?: never;
  href?: never;
}

type NavigationItem = NavItem | NavSeparator;

const navItems: NavigationItem[] = [
  { 
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  { 
    title: 'Daily Entry',
    icon: PlusCircle,
    href: '/form/mood-entry'
  },
  { 
    title: 'Settings',
    icon: Settings,
    href: '/dashboard/settings'
  }
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()

  // Find the index of the current route in navItems
  const currentIndex = navItems.findIndex(item => 
    !('type' in item) && pathname === item.href
  )

  const handleTabChange = (index: number | null) => {
    if (index !== null) {
      const item = navItems[index]
      if (!('type' in item)) {
        router.push(item.href)
      }
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="border-b hidden lg:block">
        <div className="container flex h-16 items-center px-4">
          <div className="mr-8">
            <Link href="/dashboard" className="text-lg font-semibold">
              Mood Tracker
            </Link>
          </div>
          <div className="flex items-center space-x-4 flex-1">
            {navItems.map((item) => {
              if ('type' in item) return null
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'default' : 'ghost'}
                  asChild
                >
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="fixed bottom-4 left-0 right-0 lg:hidden z-50">
        <div className="container flex justify-center px-4">
          <ExpandableTabs
            tabs={navItems}
            onChange={handleTabChange}
            className="w-auto"
            defaultSelectedIndex={currentIndex !== -1 ? currentIndex : undefined}
          />
        </div>
      </div>

      {/* Add padding to bottom of page on mobile to account for navigation */}
      <div className="h-24 lg:hidden" />
    </>
  )
} 