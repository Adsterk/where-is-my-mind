import { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { SupabaseProvider } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { CSRFProvider } from '@/components/providers/auth/CSRFProvider'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  viewportFit: 'cover',
  colorScheme: 'dark light'
}

export const metadata: Metadata = {
  title: 'Where Is My Mind - Mood Tracker',
  description: 'Track and analyze your daily moods and mental health patterns',
  manifest: '/manifest.json',
  applicationName: 'Mood Tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mood Tracker',
    startupImage: [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ]
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <SupabaseProvider>
          <CSRFProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </CSRFProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
