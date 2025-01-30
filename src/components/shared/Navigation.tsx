'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authService } from '@/lib/auth/auth-service'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers'

export function Navigation() {
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()
  const { auth } = useSupabase()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      toast({
        title: "Success",
        description: "You have been signed out successfully"
      })
      router.replace('/auth/login')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive"
      })
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/daily-mood', label: 'Daily Entry' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  // Don't render navigation if not authenticated
  if (!auth.isAuthenticated) {
    return null
  }

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-8">
          <Link href="/dashboard" className="text-lg font-semibold">
            Mood Tracker
          </Link>
        </div>
        <div className="flex items-center space-x-4 flex-1">
          {navItems.map(({ href, label }) => (
            <Button
              key={href}
              variant={pathname === href ? 'default' : 'ghost'}
              asChild
            >
              <Link href={href}>{label}</Link>
            </Button>
          ))}
        </div>
        <Button variant="ghost" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </nav>
  )
} 