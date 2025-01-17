import { cookies } from 'next/headers'
import { createClient } from '@/lib/server/auth'
import SupabaseProvider from '@/components/providers/SupabaseProvider'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mood Tracker',
  description: 'Track and analyze your daily moods',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider initialSession={session?.user ?? null}>
            {children}
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
