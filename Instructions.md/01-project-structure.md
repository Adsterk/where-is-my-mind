# Project Structure and Setup

## Current Setup Context

The project already has:
- Git repository initialized and connected
- Supabase project set up and connected
- Supabase Auth configured
- Basic Next.js project structure
- TailwindCSS and shadcn/ui installed

## Directory Structure

```
├── app/                           # Next.js 14+ app directory
│   ├── (auth)/                   # Auth routes (existing)
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (form)/                   # Form routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (settings)/               # Settings routes
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                    # React components
│   ├── form/                     # Form components
│   │   ├── mood-score/
│   │   ├── sleep-score/
│   │   ├── tracking/            # Shared tracking components
│   │   └── section-manager/     # Section ordering management
│   ├── layout/                   # Layout components
│   └── ui/                       # Shared UI components
│
├── lib/                          # Shared utilities
│   ├── supabase/                # Supabase utilities
│   ├── hooks/                   # Custom hooks
│   ├── stores/                  # State management
│   └── types/                   # TypeScript types
│
├── test/                         # Test environment
│   ├── components/              # Test components
│   │   └── form/               # Form test components
│   ├── pages/                  # Test pages
│   └── mocks/                  # Test mocks
│
└── supabase/                     # Supabase configuration
    ├── migrations/              # Database migrations
    └── seed/                    # Seed data

## Critical Files to Preserve

1. Supabase Configuration:
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

2. Environment Files:
```plaintext
.env.local
.env.development
supabase/config.toml
next.config.js
```

## Implementation Notes

### Directory Organization Rules
1. Group related components together
2. Keep shared utilities in lib/
3. Maintain clear separation of concerns
4. Use feature-based organization where appropriate
5. Keep test files close to their implementations

### File Naming Conventions
1. Use kebab-case for file names
2. Use PascalCase for component files
3. Use camelCase for utility files
4. Add type definitions in separate .d.ts files
5. Group related files in feature directories