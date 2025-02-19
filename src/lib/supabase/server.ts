import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookiesList: { name: string; value: string }[] = []
          for (const cookie of cookieStore.getAll()) {
            cookiesList.push({ name: cookie.name, value: cookie.value })
          }
          return cookiesList
        },
        setAll: (cookiesList) => {
          try {
            cookiesList.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, {
                ...cookie.options,
                sameSite: 'lax',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
              })
            })
          } catch (error) {
            // Handle cookie errors
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )
} 