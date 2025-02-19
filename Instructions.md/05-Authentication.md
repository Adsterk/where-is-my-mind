# Authentication and Security Implementation

## Overview

This document outlines the comprehensive authentication and security architecture for the Where Is My Mind mood tracking application. Our implementation follows industry best practices and focuses on protecting sensitive user data.

## Security Features

### 1. Authentication System
```typescript
// lib/auth/config.ts
export const authConfig = {
  session: {
    timeoutDuration: 1800000, // 30 minutes
    refreshInterval: 300000,   // 5 minutes
    maxSessions: 5,           // Maximum concurrent sessions
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 900000,  // 15 minutes
    passwordMinLength: 12,
  }
}
```

### 2. Rate Limiting
```typescript
// lib/auth/rate-limit.ts
export const rateLimitConfig = {
  // Login attempts
  login: {
    points: 5,           // Number of attempts
    duration: 60,        // Time window in seconds
    blockDuration: 900   // Block duration in seconds
  },
  // API requests
  api: {
    points: 100,         // Number of requests
    duration: 60,        // Time window in seconds
    blockDuration: 300   // Block duration in seconds
  }
}
```

### 3. CSRF Protection
```typescript
// lib/auth/csrf.ts
export const csrfConfig = {
  cookieName: '__Host-csrf',
  headerName: 'X-CSRF-Token',
  secret: process.env.CSRF_SECRET,
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  }
}
```

### 4. Security Headers
```typescript
// lib/auth/security-headers.ts
export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]
```

## Implementation Details

### 1. Protected Routes
```typescript
// middleware.ts
import { createMiddleware } from '@/lib/auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/form/:path*',
    '/settings/:path*',
    '/api/:path*'
  ]
}

export default createMiddleware({
  enableRateLimit: true,
  enableCSRF: true,
  enableSecurityHeaders: true
})
```

### 2. Session Management
- Automatic timeout after 30 minutes of inactivity
- Proactive session refresh every 5 minutes
- Concurrent session management
- Secure session storage using encrypted cookies

### 3. Rate Limiting Implementation
```typescript
// lib/auth/rate-limit-store.ts
interface RateLimitStore {
  increment(key: string): Promise<number>
  reset(key: string): Promise<void>
  isBlocked(key: string): Promise<boolean>
}

// Implementation supports both Redis and in-memory storage
export class RateLimitManager {
  constructor(private store: RateLimitStore) {}
  
  async checkRateLimit(ip: string, action: string): Promise<boolean> {
    if (await this.store.isBlocked(`${ip}:${action}`)) {
      return false
    }
    const attempts = await this.store.increment(`${ip}:${action}`)
    return attempts <= rateLimitConfig[action].points
  }
}
```

### 4. CSRF Protection Implementation
```typescript
// lib/auth/csrf.ts
export class CSRFManager {
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  validateToken(token: string, storedToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(storedToken)
    )
  }
}
```

## Security Best Practices

### 1. Password Security
- Minimum 12 characters
- Requires combination of uppercase, lowercase, numbers, and symbols
- Bcrypt hashing with work factor 12
- Password breach detection using HaveIBeenPwned API

### 2. Session Security
- HTTP-Only cookies
- Secure flag enabled
- SameSite strict policy
- Session rotation on privilege escalation
- Automatic cleanup of expired sessions

### 3. API Security
- Rate limiting on all endpoints
- Request size limiting
- Input validation and sanitization
- Proper error handling without leaking information

### 4. Data Protection
- All sensitive data encrypted at rest
- TLS 1.3 for data in transit
- Regular security audits
- Automated vulnerability scanning

## Testing

### 1. Security Tests
```typescript
// lib/auth/__tests__/rate-limit.test.ts
describe('Rate Limiting', () => {
  it('should block after max attempts', async () => {
    const limiter = new RateLimitManager(store)
    
    // Simulate max attempts
    for (let i = 0; i < rateLimitConfig.login.points; i++) {
      await limiter.checkRateLimit('127.0.0.1', 'login')
    }
    
    // Verify blocked
    const result = await limiter.checkRateLimit('127.0.0.1', 'login')
    expect(result).toBe(false)
  })
})

// lib/auth/__tests__/csrf.test.ts
describe('CSRF Protection', () => {
  it('should validate tokens correctly', () => {
    const csrf = new CSRFManager()
    const token = csrf.generateToken()
    
    expect(csrf.validateToken(token, token)).toBe(true)
    expect(csrf.validateToken(token, 'invalid')).toBe(false)
  })
})
```

### 2. Integration Tests
```typescript
// src/app/api/auth/__tests__/login.test.ts
describe('Login API', () => {
  it('should handle rate limiting', async () => {
    // Attempt multiple logins
    for (let i = 0; i < 6; i++) {
      await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    }
    
    // Verify rate limit response
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(response.status).toBe(429)
  })
})
```

## Error Handling

### 1. Authentication Errors
```typescript
// lib/auth/errors.ts
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
    public httpStatus: number
  ) {
    super(message)
  }
}

export const AUTH_ERRORS = {
  RATE_LIMITED: new AuthenticationError(
    'Too many attempts, please try again later',
    'AUTH_RATE_LIMITED',
    429
  ),
  INVALID_CSRF: new AuthenticationError(
    'Invalid CSRF token',
    'AUTH_INVALID_CSRF',
    403
  )
}
```

### 2. Error Responses
- Standardized error format
- No sensitive information in errors
- Proper status codes
- Detailed logging (but not exposed to client)

## Monitoring and Logging

### 1. Security Events
- Failed login attempts
- Rate limit triggers
- CSRF violations
- Session anomalies

### 2. Audit Trail
- User actions
- Security-relevant events
- System changes
- Access patterns

## Future Enhancements

### 1. Multi-Factor Authentication
- Time-based OTP (TOTP)
- SMS verification
- Email verification
- Hardware security keys (WebAuthn)

### 2. Advanced Security Features
- Adaptive rate limiting
- Machine learning-based threat detection
- IP reputation checking
- Enhanced session analytics

This documentation reflects the current state of authentication and security implementations in the Where Is My Mind application. All security features are actively maintained and regularly audited for effectiveness. 