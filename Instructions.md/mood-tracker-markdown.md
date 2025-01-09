# Mood Tracker - Technical Documentation

## Project Overview

A comprehensive mood tracking Progressive Web Application (PWA) designed to help users monitor and analyze their emotional well-being. The application supports individual users and families, integrates with healthcare providers, and provides detailed analytics and reporting capabilities.

## Technical Architecture

### Development Environment
- IDE: Cursor.com
- Version Control: GitHub
- Database & Auth: Supabase
- Deployment: Netlify

### Core Technologies
- Next.js 14+ with App Router
- TypeScript
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- next-pwa

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "next-pwa": "^5.6.0",
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0",
    "date-fns-tz": "^2.0.0"
  }
}
```

### UI Dependencies
```json
{
  "dependencies": {
    "tailwindcss": "^3.3.0",
    "shadcn/ui": "latest",
    "@heroicons/react": "^2.0.0",
    "recharts": "^2.10.0",
    "@headlessui/react": "^1.7.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "cypress": "^13.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "supabase": "^1.115.0"
  }
}
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── mood/
│   │   ├── reports/
│   │   └── settings/
│   ├── api/
│   │   ├── mood/
│   │   └── users/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── charts/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils/
├── hooks/
├── types/
└── styles/
public/
├── manifest.json
├── service-worker.js
├── icons/
└── offline.html
```

## Database Type Safety

### Type Definitions
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood_score: number
          notes: string | null
          created_at: string
          timezone: string
          language: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_score: number
          notes?: string | null
          created_at?: string
          timezone: string
          language: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_score?: number
          notes?: string | null
          created_at?: string
          timezone?: string
          language?: string
        }
      }
    }
  }
}
```

## PWA Configuration

### Next-PWA Setup
Create `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // Next.js config
})
```

### Web Manifest
Create `public/manifest.json`:
```json
{
  "name": "Mood Tracker",
  "short_name": "Mood",
  "description": "Track and analyze your daily moods",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Netlify Deployment Configuration

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_TELEMETRY_DISABLED = "1"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev"
  port = 3000

[functions]
  directory = "netlify/functions"
```

### Environment Variables
Required environment variables in Netlify:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (for admin functions)

## Security Implementation

### Supabase Row Level Security (RLS)
```sql
-- Example RLS policy for mood_entries
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own entries"
ON mood_entries
FOR ALL
USING (auth.uid() = user_id);
```

### Authentication Flow
1. User signs in through Supabase Auth
2. JWT token stored securely
3. Subsequent requests authenticated via token
4. Row Level Security enforces data access

## Testing Strategy

### Unit Testing
- Component testing with Jest and React Testing Library
- Utility function testing
- Hook testing
- Type checking

### Integration Testing
- API route testing
- Database operations
- Authentication flows
- PWA functionality

### E2E Testing
- User flows with Cypress
- Offline functionality
- PWA installation
- Push notifications

## Error Handling

### Type-Safe Error Handling
```typescript
type SupabaseError = {
  code: string
  message: string
  details: string
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Update environment variables with your Supabase credentials
5. Start development server:
   ```bash
   npm run dev
   ```

## Deployment Process

1. Connect repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Set environment variables in Netlify UI
4. Enable automatic deployments
5. Configure custom domain (if applicable)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## Support

For technical support:
1. Check project documentation
2. Review GitHub issues
3. Contact development team

---

**Note**: This documentation should be updated as the project evolves. Keep version numbers, dependencies, and deployment configurations current.