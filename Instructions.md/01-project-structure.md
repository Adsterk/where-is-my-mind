# Project Structure and Architecture

## Overview

This document outlines the current architecture of the Where Is My Mind mood tracking application, with a focus on security, maintainability, and scalability.

## Directory Structure

```
src/
├── app/                    # Next.js 14+ app directory
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (form)/           # Protected form routes
│   ├── api/              # API routes with security middleware
│   │   ├── auth/         # Auth-related endpoints
│   │   └── data/         # Data endpoints with RLS
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Landing page
│
├── components/            # React components
│   ├── auth/             # Authentication components
│   │   ├── __tests__/    # Auth component tests
│   │   ├── forms/        # Auth form components
│   │   └── providers/    # Auth-specific providers
│   ├── dashboard/        # Dashboard components
│   ├── form/            # Form components
│   ├── providers/       # Global providers
│   │   ├── auth/        # Auth providers
│   │   └── form/        # Form state providers
│   └── ui/             # Shared UI components
│
├── lib/                 # Core utilities
│   ├── auth/           # Authentication and security
│   │   ├── __tests__/  # Security tests
│   │   ├── csrf.ts     # CSRF protection
│   │   ├── rate-limit.ts # Rate limiting
│   │   ├── security-headers.ts # Security headers
│   │   └── middleware.ts # Auth middleware
│   ├── supabase/      # Database utilities
│   ├── hooks/         # Custom hooks
│   └── utils/         # Utility functions
│
├── types/             # TypeScript types
│   ├── auth.ts       # Auth-related types
│   ├── database.ts   # Database types
│   └── index.ts      # Type exports
│
└── config/           # Application configuration
    ├── auth.ts      # Auth configuration
    └── security.ts  # Security configuration
```

## Key Components and Files

### 1. Security Infrastructure

```typescript
// lib/auth/middleware.ts
import { createMiddleware } from './middleware'
import { rateLimitConfig } from './rate-limit'
import { securityHeaders } from './security-headers'

export default createMiddleware({
  // Security middleware configuration
})

// lib/auth/csrf.ts
export class CSRFProtection {
  // CSRF implementation
}

// lib/auth/rate-limit.ts
export class RateLimiter {
  // Rate limiting implementation
}
```

### 2. Authentication Components

```typescript
// components/auth/providers/AuthProvider.tsx
export const AuthProvider = ({ children }) => {
  // Auth state management
}

// components/auth/forms/LoginForm.tsx
export const LoginForm = () => {
  // Secure login implementation
}
```

### 3. Protected Routes

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  // Dashboard protection
}

// app/api/auth/[...route]/route.ts
export async function POST(req: Request) {
  // Secure API endpoints
}
```

## Configuration Files

### 1. Environment Configuration
```plaintext
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
CSRF_SECRET=your-csrf-secret
```

### 2. Security Configuration
```typescript
// config/security.ts
export const securityConfig = {
  csrf: {
    // CSRF configuration
  },
  rateLimit: {
    // Rate limit configuration
  },
  headers: {
    // Security headers
  }
}
```

## Testing Structure

```
src/
├── __tests__/          # Global test utilities
├── components/
│   └── __tests__/     # Component tests
├── lib/
│   └── auth/
│       └── __tests__/ # Security tests
└── e2e/              # End-to-end tests
```

### Test Examples

```typescript
// lib/auth/__tests__/csrf.test.ts
describe('CSRF Protection', () => {
  // CSRF tests
})

// lib/auth/__tests__/rate-limit.test.ts
describe('Rate Limiting', () => {
  // Rate limit tests
})
```

## Development Guidelines

### 1. Security First
- All new routes must implement proper authentication
- API endpoints must include rate limiting
- Forms must include CSRF protection
- Use security headers consistently

### 2. Code Organization
- Group related components together
- Keep security utilities in lib/auth
- Maintain clear separation of concerns
- Co-locate tests with implementations

### 3. Type Safety
- Use TypeScript strictly
- Define clear interfaces
- Maintain type exports
- Document type usage

### 4. Testing Requirements
- Security features must have tests
- Include integration tests
- Test error scenarios
- Maintain high coverage

## Deployment Configuration

### 1. Production Setup
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security headers
        ]
      }
    ]
  }
}
```

### 2. Environment Management
- Separate development/production configs
- Secure secret management
- Environment validation
- Deployment checks

This structure reflects the current state of the Where Is My Mind application, with a strong focus on security and maintainability. All security features are implemented and tested according to best practices.