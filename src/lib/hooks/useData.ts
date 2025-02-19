import { useState, useEffect, useRef, useCallback } from 'react'
import { cache } from '@/lib/cache'
import { useSupabase } from '@/components/providers'

interface UseDataOptions<T> {
  key: string
  ttl?: number
  enabled?: boolean
  initialData?: T | null
  staleTime?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>()

export function useData<T>(
  fetcher: () => Promise<T>,
  options: UseDataOptions<T>
) {
  const [data, setData] = useState<T | null>(options.initialData ?? null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(!options.initialData)
  const { user } = useSupabase()
  const { 
    key, 
    ttl = 5 * 60 * 1000, 
    enabled = true, 
    initialData, 
    staleTime = 0,
    revalidateOnFocus = false,
    revalidateOnReconnect = false
  } = options
  
  // Track last successful fetch time
  const lastFetchRef = useRef<number>(initialData ? Date.now() : 0)
  
  // Track component mount state
  const mountedRef = useRef(true)

  // Create fetchData function that can be called manually
  const fetchData = useCallback(async () => {
    if (!enabled || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      // Check if data is still fresh
      const now = Date.now()
      if (now - lastFetchRef.current < staleTime && data !== null) {
        setIsLoading(false)
        return
      }
      
      // Check cache first
      const cachedData = cache.get<T>(key)
      if (cachedData) {
        if (mountedRef.current) {
          setData(cachedData)
          setIsLoading(false)
        }
        return
      }

      // Check for pending request
      let fetchPromise = pendingRequests.get(key)
      
      if (!fetchPromise) {
        // Create new request if none pending
        fetchPromise = fetcher()
        pendingRequests.set(key, fetchPromise)
        
        // Cleanup after request completes
        fetchPromise.finally(() => {
          pendingRequests.delete(key)
        })
      }

      const freshData = await fetchPromise
      
      // Cache the result
      if (ttl) {
        cache.set(key, freshData, ttl)
      }
      
      if (mountedRef.current) {
        setData(freshData)
        setError(null)
        lastFetchRef.current = Date.now()
      }
    } catch (err) {
      console.error(`Error fetching data for key ${key}:`, err)
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
        setData(null)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [key, ttl, enabled, user, fetcher, staleTime, data])

  // Handle focus events
  useEffect(() => {
    if (!revalidateOnFocus) return

    const onFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchData, revalidateOnFocus])

  // Handle online/offline events
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const onOnline = () => {
      fetchData()
    }

    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [fetchData, revalidateOnReconnect])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    // If we have initial data and no cached data, cache the initial data
    if (initialData && !cache.get(key) && ttl) {
      cache.set(key, initialData, ttl)
      lastFetchRef.current = Date.now()
    }

    // Only fetch if we don't have initial data or if it's stale
    if (!initialData || Date.now() - lastFetchRef.current >= staleTime) {
      fetchData()
    }
  }, [key, ttl, enabled, user, fetcher, initialData, staleTime, fetchData])

  return { 
    data, 
    error, 
    isLoading,
    mutate: fetchData // Expose the fetch function as mutate
  }
} 