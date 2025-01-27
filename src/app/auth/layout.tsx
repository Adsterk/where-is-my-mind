import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Mood Tracker',
  description: 'Sign in or register for Mood Tracker',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
} 