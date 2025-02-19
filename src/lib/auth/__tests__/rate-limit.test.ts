import { NextRequest } from 'next/server'
import { checkRateLimit, resetRateLimit, rateLimitConfigs } from '../rate-limit'

// Mock NextRequest
function createMockRequest(pathname: string = '/', ip: string = '127.0.0.1'): NextRequest {
  return {
    ip,
    nextUrl: { pathname },
    headers: new Headers(),
  } as unknown as NextRequest
}

describe('Rate Limiting', () => {
  beforeEach(async () => {
    // Reset rate limits before each test
    const request = createMockRequest()
    await resetRateLimit(request, 'api')
    await resetRateLimit(request, 'auth')
    await resetRateLimit(request, 'sensitive')
  })

  describe('API Rate Limiting', () => {
    it('allows requests within limit', async () => {
      const request = createMockRequest('/api/test')
      const result = await checkRateLimit(request, 'api')
      
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(rateLimitConfigs.api.maxRequests - 1)
      expect(result.blocked).toBe(false)
    })

    it('blocks requests after exceeding limit', async () => {
      const request = createMockRequest('/api/test')
      
      // Make maxRequests + 1 requests
      for (let i = 0; i < rateLimitConfigs.api.maxRequests; i++) {
        await checkRateLimit(request, 'api')
      }

      const result = await checkRateLimit(request, 'api')
      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
    })
  })

  describe('Auth Rate Limiting', () => {
    it('has stricter limits for auth routes', async () => {
      const request = createMockRequest('/auth/login')
      const result = await checkRateLimit(request, 'auth')
      
      expect(result.limit).toBe(rateLimitConfigs.auth.maxRequests)
      expect(result.remaining).toBe(rateLimitConfigs.auth.maxRequests - 1)
    })

    it('blocks after multiple failed attempts', async () => {
      const request = createMockRequest('/auth/login')
      
      // Make maxRequests + 1 attempts
      for (let i = 0; i < rateLimitConfigs.auth.maxRequests; i++) {
        await checkRateLimit(request, 'auth')
      }

      const result = await checkRateLimit(request, 'auth')
      expect(result.success).toBe(false)
      expect(result.blocked).toBe(true)
    })
  })

  describe('Sensitive Route Rate Limiting', () => {
    it('has strictest limits for sensitive routes', async () => {
      const request = createMockRequest('/dashboard/settings')
      const result = await checkRateLimit(request, 'sensitive')
      
      expect(result.limit).toBe(rateLimitConfigs.sensitive.maxRequests)
      expect(result.remaining).toBe(rateLimitConfigs.sensitive.maxRequests - 1)
    })

    it('blocks quickly for sensitive routes', async () => {
      const request = createMockRequest('/dashboard/settings')
      
      // Make maxRequests + 1 attempts
      for (let i = 0; i < rateLimitConfigs.sensitive.maxRequests; i++) {
        await checkRateLimit(request, 'sensitive')
      }

      const result = await checkRateLimit(request, 'sensitive')
      expect(result.success).toBe(false)
      expect(result.blocked).toBe(true)
    })
  })

  describe('IP-based Rate Limiting', () => {
    it('tracks limits separately for different IPs', async () => {
      const request1 = createMockRequest('/api/test', '1.1.1.1')
      const request2 = createMockRequest('/api/test', '2.2.2.2')

      // Use up all requests for first IP
      for (let i = 0; i < rateLimitConfigs.api.maxRequests; i++) {
        await checkRateLimit(request1, 'api')
      }

      // Second IP should still be allowed
      const result = await checkRateLimit(request2, 'api')
      expect(result.success).toBe(true)
      expect(result.remaining).toBe(rateLimitConfigs.api.maxRequests - 1)
    })
  })

  describe('Reset Rate Limit', () => {
    it('resets the rate limit for a specific route', async () => {
      const request = createMockRequest('/api/test')
      
      // Use some requests
      await checkRateLimit(request, 'api')
      await checkRateLimit(request, 'api')
      
      // Reset the limit
      await resetRateLimit(request, 'api')
      
      // Should have full limit again
      const result = await checkRateLimit(request, 'api')
      expect(result.remaining).toBe(rateLimitConfigs.api.maxRequests - 1)
    })
  })
}) 