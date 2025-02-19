type CacheEntry<T> = {
  data: T
  timestamp: number
  userId?: string | null
}

class Cache {
  private static instance: Cache
  private cache: Map<string, CacheEntry<any>>
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly maxAge = 60 * 60 * 1000 // 1 hour

  private constructor() {
    this.cache = new Map()
    this.loadFromStorage()

    // Save cache to localStorage before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToStorage()
      })
      // Add visibility change listener for tab focus
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.validateCache()
        }
      })
    }
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  private validateCache() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.cache.delete(key)
      }
    }
    this.saveToStorage()
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('app_cache')
      if (stored) {
        const { entries, timestamp } = JSON.parse(stored)
        // Only restore cache if it's less than maxAge old
        if (Date.now() - timestamp < this.maxAge) {
          entries.forEach(([key, entry]: [string, CacheEntry<any>]) => {
            if (Date.now() < entry.timestamp) {
              this.cache.set(key, entry)
            }
          })
        } else {
          localStorage.removeItem('app_cache')
        }
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error)
      localStorage.removeItem('app_cache')
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const entries = Array.from(this.cache.entries())
      localStorage.setItem('app_cache', JSON.stringify({
        entries,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Error saving cache to storage:', error)
    }
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL, userId?: string | null): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
      userId
    })
    this.saveToStorage()
  }

  get<T>(key: string, userId?: string | null): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Check if entry has expired
    if (Date.now() > entry.timestamp) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }
    
    // Check if entry belongs to the correct user
    if (userId && entry.userId && entry.userId !== userId) {
      return null
    }
    
    return entry.data
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    this.saveToStorage()
  }

  invalidateUserData(userId: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.userId === userId) {
        this.cache.delete(key)
      }
    }
    this.saveToStorage()
  }

  clear(): void {
    this.cache.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app_cache')
    }
  }
}

export const cache = Cache.getInstance() 