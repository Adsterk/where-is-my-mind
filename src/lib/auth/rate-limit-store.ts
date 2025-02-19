import Redis from 'ioredis'

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<number>
  isBlocked(key: string): Promise<boolean>
  block(key: string, duration: number): Promise<void>
  reset(key: string): Promise<void>
  isHealthy?(): Promise<boolean>
  disconnect?(): Promise<void>
}

// In-memory implementation
export class MemoryStore implements RateLimitStore {
  private store: Map<string, { count: number; resetTime: number; blockedUntil?: number }>

  constructor() {
    this.store = new Map()
  }

  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now()
    const record = this.store.get(key)

    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs })
      return 1
    }

    record.count += 1
    return record.count
  }

  async isBlocked(key: string): Promise<boolean> {
    const record = this.store.get(key)
    if (!record?.blockedUntil) return false
    return Date.now() < record.blockedUntil
  }

  async block(key: string, duration: number): Promise<void> {
    const record = this.store.get(key) || { count: 0, resetTime: 0 }
    record.blockedUntil = Date.now() + duration
    this.store.set(key, record)
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }

  async isHealthy(): Promise<boolean> {
    return true
  }
}

// Enhanced Redis implementation
export class RedisStore implements RateLimitStore {
  private redis: Redis
  private readonly prefix: string
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private readonly maxReconnectAttempts: number = 5

  constructor(
    redisUrl?: string,
    options: {
      prefix?: string
      maxReconnectAttempts?: number
      connectTimeout?: number
    } = {}
  ) {
    this.prefix = options.prefix || 'rate-limit'
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5

    const redisOptions: Redis.RedisOptions = {
      connectTimeout: options.connectTimeout || 5000,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > this.maxReconnectAttempts) {
          return null // Stop retrying
        }
        return Math.min(times * 100, 3000) // Exponential backoff
      },
    }

    this.redis = new Redis(redisUrl || process.env.REDIS_URL!, redisOptions)

    // Set up event handlers
    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.redis.on('connect', () => {
      console.log('Redis: Connected')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.redis.on('error', (error) => {
      console.error('Redis: Error', error)
      this.isConnected = false
    })

    this.redis.on('reconnecting', () => {
      console.log(`Redis: Reconnecting... (Attempt ${++this.reconnectAttempts})`)
    })

    this.redis.on('close', () => {
      console.log('Redis: Connection closed')
      this.isConnected = false
    })
  }

  private getCountKey(key: string): string {
    return `${this.prefix}:${key}:count`
  }

  private getBlockKey(key: string): string {
    return `${this.prefix}:${key}:blocked`
  }

  async increment(key: string, windowMs: number): Promise<number> {
    const countKey = this.getCountKey(key)
    
    try {
      // Use Redis MULTI to execute commands atomically
      const result = await this.redis
        .multi()
        .incr(countKey)
        .pexpire(countKey, windowMs)
        .exec()

      if (!result) {
        throw new Error('Redis transaction failed')
      }

      const [incrErr, count] = result[0]
      if (incrErr) throw incrErr

      return count as number
    } catch (error) {
      console.error('Redis: increment error', error)
      throw new Error('Failed to increment rate limit counter')
    }
  }

  async isBlocked(key: string): Promise<boolean> {
    const blockKey = this.getBlockKey(key)
    
    try {
      const blockedUntil = await this.redis.get(blockKey)
      
      if (!blockedUntil) return false
      
      const isBlocked = Date.now() < parseInt(blockedUntil, 10)
      
      // Clean up expired block
      if (!isBlocked) {
        await this.redis.del(blockKey)
      }
      
      return isBlocked
    } catch (error) {
      console.error('Redis: isBlocked error', error)
      return false // Fail open to prevent lockout
    }
  }

  async block(key: string, duration: number): Promise<void> {
    const blockKey = this.getBlockKey(key)
    const blockedUntil = Date.now() + duration
    
    try {
      await this.redis
        .multi()
        .set(blockKey, blockedUntil)
        .pexpire(blockKey, duration)
        .exec()
    } catch (error) {
      console.error('Redis: block error', error)
      throw new Error('Failed to block client')
    }
  }

  async reset(key: string): Promise<void> {
    try {
      await this.redis
        .multi()
        .del(this.getCountKey(key))
        .del(this.getBlockKey(key))
        .exec()
    } catch (error) {
      console.error('Redis: reset error', error)
      throw new Error('Failed to reset rate limit')
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const pong = await this.redis.ping()
      return pong === 'PONG' && this.isConnected
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.quit()
      this.isConnected = false
    } catch (error) {
      console.error('Redis: disconnect error', error)
      throw new Error('Failed to disconnect from Redis')
    }
  }

  // Get Redis stats for monitoring
  async getStats(): Promise<{
    connected: boolean
    reconnectAttempts: number
    keyCount: number
  }> {
    try {
      const keyCount = await this.redis.keys(`${this.prefix}:*`).then(keys => keys.length)
      return {
        connected: this.isConnected,
        reconnectAttempts: this.reconnectAttempts,
        keyCount,
      }
    } catch (error) {
      console.error('Redis: getStats error', error)
      throw new Error('Failed to get Redis stats')
    }
  }

  // Clear all rate limit data (use with caution)
  async clearAll(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}:*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis: clearAll error', error)
      throw new Error('Failed to clear rate limit data')
    }
  }
} 