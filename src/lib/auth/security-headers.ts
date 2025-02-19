import { type NextResponse } from 'next/server'

// CSP Directives
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    'https://api.openai.com',
  ],
  'frame-ancestors': ["'none'"],
  'form-action': ["'self'"],
}

// Generate CSP string
function generateCSP(): string {
  return Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// Security headers configuration
const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': generateCSP(),
  
  // Prevent browsers from MIME-sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Only allow HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable cross-site scripting filter
  'X-XSS-Protection': '1; mode=block',
  
  // Control browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Get security headers as object (useful for Next.js config)
export function getSecurityHeaders(): Record<string, string> {
  return { ...securityHeaders }
} 