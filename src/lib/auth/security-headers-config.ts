import { type NextResponse } from 'next/server'

// CSP Directives Configuration
export const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://js.stripe.com', // If using Stripe
    'https://www.google-analytics.com', // If using Google Analytics
  ],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
  fontSrc: ["'self'", 'data:', 'https:'],
  connectSrc: [
    "'self'",
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    'https://api.openai.com',
    'https://vitals.vercel-insights.com', // If using Vercel Analytics
  ],
  mediaSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameAncestors: ["'none'"],
  formAction: ["'self'"],
  frameSource: ["'none'"],
  manifestSrc: ["'self'"],
  workerSrc: ["'self'", 'blob:'],
  upgradeInsecureRequests: [],
}

// Security Headers Configuration
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': Object.entries(cspDirectives)
    .map(([key, values]) => {
      const directive = key.replace(/[A-Z]/g, '-$&').toLowerCase()
      return values.length ? `${directive} ${values.join(' ')}` : `${directive}`
    })
    .join('; '),
  
  // Prevent browsers from MIME-sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Only allow HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Enable cross-site scripting filter
  'X-XSS-Protection': '1; mode=block',
  
  // Control browser features and APIs
  'Permissions-Policy': [
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'camera=()',
    'cross-origin-isolated=()',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'execution-while-not-rendered=()',
    'execution-while-out-of-viewport=()',
    'fullscreen=()',
    'geolocation=()',
    'gyroscope=()',
    'keyboard-map=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'navigation-override=()',
    'payment=()',
    'picture-in-picture=()',
    'publickey-credentials-get=()',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'usb=()',
    'web-share=()',
    'xr-spatial-tracking=()',
    'clipboard-read=()',
    'clipboard-write=()',
    'gamepad=()',
    'speaker-selection=()',
  ].join(', '),
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// Route-specific security headers
export const routeSpecificHeaders: Record<string, Partial<typeof securityHeaders>> = {
  '/api/upload': {
    'Cross-Origin-Resource-Policy': 'cross-origin',
  },
  '/api/webhook': {
    'Content-Security-Policy': cspDirectives.defaultSrc.join(' '),
  },
}

// Apply security headers based on route
export function applySecurityHeaders(
  response: NextResponse,
  pathname: string
): NextResponse {
  // Apply base security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Apply route-specific headers
  if (routeSpecificHeaders[pathname]) {
    Object.entries(routeSpecificHeaders[pathname]).forEach(([key, value]) => {
      if (value) response.headers.set(key, value)
    })
  }

  return response
}

// Get security headers for Next.js config
export function getSecurityHeaders(pathname?: string): Record<string, string> {
  const headers = { ...securityHeaders }
  
  if (pathname && routeSpecificHeaders[pathname]) {
    return { ...headers, ...routeSpecificHeaders[pathname] }
  }
  
  return headers
} 