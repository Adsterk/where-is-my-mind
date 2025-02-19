import { NextRequest } from 'next/server'
import { RateLimitStore, MemoryStore } from './rate-limit-store'

interface RateLimitConfig {
  maxRequests: number    // Maximum requests allowed in the window
  windowMs: number       // Time window in milliseconds
  blockDurationMs: number // Duration to block after exceeding limit
}

// Load configuration from environment variables with fallbacks
export const rateLimitConfigs = {
  api: {
    maxRequests: Number(process.env.RATE_LIMIT_API_MAX_REQUESTS) || 100,
    windowMs: Number(process.env.RATE_LIMIT_API_WINDOW_MS) || 60000,
    blockDurationMs: Number(process.env.RATE_LIMIT_API_BLOCK_DURATION_MS) || 300000,
  },
  auth: {
    maxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS) || 5,
    windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 300000,
    blockDurationMs: Number(process.env.RATE_LIMIT_AUTH_BLOCK_DURATION_MS) || 900000,
  },
  sensitive: {
    maxRequests: Number(process.env.RATE_LIMIT_SENSITIVE_MAX_REQUESTS) || 3,
    windowMs: Number(process.env.RATE_LIMIT_SENSITIVE_WINDOW_MS) || 300000,
    blockDurationMs: Number(process.env.RATE_LIMIT_SENSITIVE_BLOCK_DURATION_MS) || 1800000,
  },
} as const

export type RateLimitType = keyof typeof rateLimitConfigs

// Get client IP from request
function getClientIp(request: NextRequest): string {
  return request.ip || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         'unknown'
}

// Generate rate limit key
function getRateLimitKey(request: NextRequest, type: RateLimitType): string {
  const ip = getClientIp(request)
  return `${type}:${ip}:${request.nextUrl.pathname}`
}

// Create store instance based on environment
let store: RateLimitStore

if (process.env.REDIS_URL) {
  const { RedisStore } = require('./rate-limit-store')
  store = new RedisStore(process.env.REDIS_URL, {
    prefix: process.env.REDIS_PREFIX,
    maxReconnectAttempts: Number(process.env.REDIS_MAX_RECONNECT_ATTEMPTS),
    connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT),
  })
} else {
  store = new MemoryStore()
}

// Health check function
export async function checkRateLimitHealth(): Promise<{
  healthy: boolean
  store: 'redis' | 'memory'
  stats?: any
}> {
  const isRedis = 'getStats' in store
  const healthy = await store.isHealthy?.() ?? true

  return {
    healthy,
    store: isRedis ? 'redis' : 'memory',
    ...(isRedis && { stats: await (store as any).getStats() }),
  }
}

export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<{ 
  success: boolean
  limit: number
  remaining: number
  reset: number
  blocked?: boolean
}> {
  const config = rateLimitConfigs[type]
  const key = getRateLimitKey(request, type)

  try {
    // Check if client is blocked
    const isBlocked = await store.isBlocked(key)
    if (isBlocked) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: 0,
        blocked: true,
      }
    }

    // Increment request count
    const count = await store.increment(key, config.windowMs)
    const remaining = Math.max(0, config.maxRequests - count)
    const success = count <= config.maxRequests

    // Block client if limit exceeded
    if (!success) {
      await store.block(key, config.blockDurationMs)
    }

    return {
      success,
      limit: config.maxRequests,
      remaining,
      reset: Date.now() + config.windowMs,
      blocked: false,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open to prevent accidental lockouts
    return {
      success: true,
      limit: config.maxRequests,
      remaining: 1,
      reset: Date.now() + config.windowMs,
      blocked: false,
    }
  }
}

export async function resetRateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<void> {
  const key = getRateLimitKey(request, type)
  await store.reset(key)
}

// Cleanup function for tests and maintenance
export async function cleanup(): Promise<void> {
  if ('disconnect' in store) {
    await (store as any).disconnect()
  }
} 