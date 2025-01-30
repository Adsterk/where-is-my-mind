# AI Agent Instructions for Mood Tracker Project

## Project Context
This is a Next.js-based mood tracking application with Supabase backend integration. The project uses TailwindCSS and shadcn/ui for styling, and follows a specific organizational structure for components, state management, and database interactions.

## Directory Structure Reference
Follow this structure when suggesting or creating new files:

```
src/
├── app/                    # Next.js 14+ app directory
│   ├── auth/              # Auth routes with server-side auth
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── verify-email/
│   ├── dashboard/         # Dashboard routes
│   │   ├── daily-mood/    # Daily mood tracking
│   │   ├── analytics/     # Mood analytics
│   │   └── settings/      # User preferences and settings
│   ├── form/             # Form routes
│   │   └── mood-entry/   # Mood entry forms
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── auth/             # Auth components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── email-verification.tsx
│   ├── form/             # Form components
│   │   └── mood-entry/   # Mood tracking components
│   ├── providers/        # Context providers
│   │   ├── auth/         # Auth provider
│   │   ├── form/         # Form state provider
│   │   ├── theme/        # Theme provider
│   │   └── accessibility/# Accessibility provider
│   ├── shared/           # Shared components
│   ├── ui/              # UI components (shadcn)
│   └── dashboard/       # Dashboard components
├── lib/                 # Core utilities and logic
│   ├── supabase/        # Supabase utilities
│   ├── hooks/           # Custom hooks
│   ├── stores/          # State management
│   ├── types/           # TypeScript types
│   ├── validation/      # Form validation schemas
│   ├── utils/           # Utility functions
│   ├── server/          # Server-side utilities
│   └── theme-script.ts  # Theme initialization
├── config/             # Configuration files
├── styles/            # Global styles and themes
├── types/             # Global TypeScript types
└── tests/             # Test files
    ├── auth/          # Auth tests
    ├── components/    # Component tests
    ├── utils/         # Utility tests
    └── test-utils/    # Test utilities
```

**Note**: The `hooks/` directory at the root level should be moved to `lib/hooks/` for better organization and to avoid duplication.

## Code Organization Rules

### 1. Authentication and Authorization
- Use server-side authentication in layout components
- Implement middleware for route protection
- Follow route group patterns for auth flows
- Handle loading and error states consistently

### 2. Component Creation Guidelines
- Place new components in appropriate subdirectories under `components/`
- Each component should have:
  ```
  components/feature-name/
    ├── FeatureName.tsx        # Main component
    ├── index.ts              # Barrel export
    ├── types.ts             # Component-specific types
    └── __tests__/           # Component tests
  ```

### 3. State Management Rules
- Use Zustand for global state management
- Follow the existing pattern in `lib/stores/localStore.ts`
- Implement proper TypeScript types
- Include persistence configuration when needed
- For user preferences and settings:
  - Store theme preference in profiles table
  - Store other user preferences in user_preferences table
  - Use proper error handling and loading states
  - Implement optimistic updates for better UX

### 4. Database Operations
- All database schema must match `02-database-schema.md`
- Implement proper row-level security
- Follow existing type definitions in `lib/types/database.ts`
- Include proper error handling

### 5. Route Organization
- Group related routes using Next.js route groups
- Implement server-side authentication in layout components
- Handle loading and error states at the layout level
- Use middleware for route protection

### 6. Settings Page Implementation
- Place settings-related components in `app/dashboard/settings/`
- Implement proper error boundaries for settings components
- Handle theme preferences:
  - Store theme in profiles table
  - Use next-themes for theme management
  - Implement optimistic updates for theme changes
- Handle user preferences:
  - Store preferences in user_preferences table
  - Use proper TypeScript types for preferences
  - Implement proper loading and error states
  - Use optimistic updates for better UX
- Follow proper component structure:
  ```typescript
  // app/dashboard/settings/page.tsx
  'use client'
  
  function SettingsContent() {
    // Implementation
  }
  
  export default function SettingsPage() {
    return (
      <ErrorBoundary>
        <SettingsContent />
      </ErrorBoundary>
    )
  }
  ```

### 7. Provider Implementation
- Keep providers focused and single-responsibility
- Implement proper TypeScript types
- Handle loading and error states
- Include proper cleanup in effects

## Testing Guidelines

### 1. Test-First Development Process
1. Create test files before implementation
2. Define expected behavior in tests
3. Implement features to pass tests
4. Refactor while maintaining test coverage

### 2. Test File Organization
```typescript
// tests/auth/components/LoginForm.test.tsx
import { renderWithAuth, screen, waitFor } from '@/tests/test-utils'
import { LoginForm } from '@/components/auth/login-form'

describe('LoginForm', () => {
  const setup = () => {
    return renderWithAuth(<LoginForm />)
  }

  it('renders login form correctly', () => {
    setup()
    expect(screen.getByRole('form')).toBeInTheDocument()
  })
})
```

### 3. Test Categories
1. **Unit Tests**
   - Individual component testing
   - Hook testing
   - Utility function testing
   - State management testing

2. **Integration Tests**
   - Complete flow testing
   - Component interaction testing
   - API integration testing
   - Database interaction testing

3. **E2E Tests**
   - User journey testing
   - Cross-component flow testing
   - Full application flow testing

## Code Style Requirements

### 1. TypeScript Standards
```typescript
// Use proper type definitions
interface ComponentProps {
  value: number
  onChange: (value: number) => void
}

// Use proper exports
export function Component({ value, onChange }: ComponentProps) {
  // Implementation
}
```

### 2. Component Structure
```typescript
// components/feature-name/FeatureName.tsx
'use client'

import { useState } from 'react'
import { useFormState } from '@/lib/hooks/useFormState'
import type { ComponentProps } from './types'

export function FeatureName({ prop1, prop2 }: ComponentProps) {
  // State management
  const [state, setState] = useState()
  const { data, loading, error } = useFormState()

  // Loading state
  if (loading) return <LoadingSpinner />

  // Error state
  if (error) return <ErrorBoundary error={error} />

  // Main render
  return (
    <div className="space-y-4">
      {/* Component content */}
    </div>
  )
}
```

### 3. Layout Structure
```typescript
// app/feature/layout.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function FeatureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      redirect('/auth/login')
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Layout error:', error)
    redirect('/auth/login')
  }
}
```

## Error Handling Requirements
1. Use try-catch blocks for database operations
2. Implement proper error boundaries
3. Show appropriate error messages to users
4. Include error recovery mechanisms
5. Log errors appropriately

## Performance Considerations
1. Implement proper memoization
2. Use proper loading states
3. Optimize re-renders
4. Implement proper cleanup
5. Handle offline scenarios

When suggesting code changes or creating new features, ensure all these guidelines are followed to maintain consistency with the existing codebase.