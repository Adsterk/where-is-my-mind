'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { csrfManager } from '@/lib/auth/csrf'

interface CSRFContextType {
  isReady: boolean
  addCSRFHeader: (headers?: HeadersInit) => HeadersInit
  error: Error | null
}

const CSRFContext = createContext<CSRFContextType>({
  isReady: false,
  addCSRFHeader: (headers = {}) => headers,
  error: null
})

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Skip CSRF token fetch for public routes
    if (pathname.startsWith('/auth/') || pathname === '/') {
      setIsReady(true)
      return
    }

    async function fetchCSRFToken() {
      try {
        const response = await fetch('/api/auth/csrf', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch CSRF token: ${response.statusText}`)
        }
        
        const data = await response.json()
        if (!data.token) {
          throw new Error('No token received from server')
        }
        
        csrfManager.setToken(data.token)
        setIsReady(true)
        setError(null)
        setRetryCount(0)
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch CSRF token'))
        
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, RETRY_DELAY * Math.pow(2, retryCount))
        } else {
          // If all retries failed, still set isReady to true to prevent blocking the app
          setIsReady(true)
        }
      }
    }

    if (!isReady && retryCount < MAX_RETRIES) {
      fetchCSRFToken()
    }
  }, [isReady, retryCount, pathname])

  return (
    <CSRFContext.Provider 
      value={{
        isReady,
        error,
        addCSRFHeader: (headers = {}) => csrfManager.addCSRFHeader(headers)
      }}
    >
      {children}
    </CSRFContext.Provider>
  )
}

export function useCSRF() {
  const context = useContext(CSRFContext)
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider')
  }
  return context
} 