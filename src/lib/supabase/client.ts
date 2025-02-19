import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return ''
          const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`))?.[3]
          return match ? decodeURIComponent(match) : ''
        },
        set(name: string, value: string, options: { path: string; maxAge?: number }) {
          if (typeof document === 'undefined') return
          let cookie = `${name}=${encodeURIComponent(value)}; path=${options.path}`
          if (options.maxAge) cookie += `; max-age=${options.maxAge}`
          document.cookie = cookie
        },
        remove(name: string, options: { path: string }) {
          if (typeof document === 'undefined') return
          document.cookie = `${name}=; path=${options.path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )
} 