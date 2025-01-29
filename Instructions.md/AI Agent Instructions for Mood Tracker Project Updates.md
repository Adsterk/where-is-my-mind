# AI Agent Instructions for Mood Tracker Project

## Project Context
This is a Next.js-based mood tracking application with Supabase backend integration. The project uses TailwindCSS and shadcn/ui for styling, and follows a specific organizational structure for components, state management, and database interactions.

## Directory Structure Reference
Follow this structure when suggesting or creating new files:

```
app/
  (auth)/            # Auth-related routes
  (dashboard)/       # Dashboard routes
  (form)/           # Form-related routes
  (settings)/       # Settings routes
  api/              # API routes
components/
  form/             # Form-specific components
    mood-score/     # Mood scoring components
    sleep-score/    # Sleep tracking components
    tracking/       # General tracking components
    section-manager/# Section management
  layout/           # Layout components
  ui/               # Shared UI components
lib/
  supabase/         # Supabase utilities
  hooks/            # Custom React hooks
  stores/           # State management
  types/            # TypeScript definitions
```

## Code Organization Rules

### 1. Component Creation Guidelines
- Place new components in appropriate subdirectories under `components/`
- Each component should have:
  ```
  components/feature-name/
    ├── FeatureName.tsx        # Main component
    ├── index.ts              # Barrel export
    ├── types.ts             # Component-specific types
    └── __tests__/           # Test files
  ```

### 2. State Management Rules
- Use Zustand for global state management
- Follow the existing pattern in `lib/stores/localStore.ts`
- Implement proper TypeScript types
- Include persistence configuration when needed

### 3. Database Operations
- All database schema must match `02-database-schema.md`
- Implement proper row-level security
- Follow existing type definitions in `lib/types/database.ts`
- Include proper error handling

## Update Process Guidelines

### 1. File Organization
For any new feature or update:
1. Create files in appropriate directories
2. Maintain consistent naming conventions
3. Include necessary test files
4. Update type definitions
5. Add/update documentation

### 2. Component Updates
When modifying components:
1. Preserve existing prop interfaces
2. Maintain shadcn/ui styling patterns
3. Keep accessibility features
4. Update relevant tests
5. Include loading and error states

### 3. State Management Updates
When modifying state:
1. Follow existing store patterns
2. Include proper TypeScript types
3. Maintain persistence configurations
4. Update relevant hooks
5. Include proper cleanup

## Code Style Requirements

### 1. TypeScript Standards
```typescript
// Use proper type definitions
interface ComponentProps {
  value: number;
  onChange: (value: number) => void;
  // ... other props
}

// Use proper exports
export function Component({ value, onChange }: ComponentProps) {
  // Implementation
}
```

### 2. Component Structure
```typescript
// components/feature-name/FeatureName.tsx
import { useState } from 'react';
import { useFormState } from '@/lib/hooks/useFormState';
import type { ComponentProps } from './types';

export function FeatureName({ prop1, prop2 }: ComponentProps) {
  // State management
  const [state, setState] = useState();
  const { data, loading, error } = useFormState();

  // Event handlers
  const handleEvent = () => {
    // Implementation
  };

  // Loading state
  if (loading) return <Loading />;

  // Error state
  if (error) return <Error message={error.message} />;

  // Main render
  return (
    <div className="space-y-4">
      {/* Component content */}
    </div>
  );
}
```

### 3. Hook Structure
```typescript
// lib/hooks/useFeature.ts
import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';

export function useFeature(params: FeatureParams) {
  // State setup
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effect hooks
  useEffect(() => {
    // Implementation
  }, [params]);

  // Return values
  return { data, loading, error };
}
```

## Testing Requirements

### 1. Test File Structure
```typescript
// __tests__/FeatureName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureName } from '../FeatureName';

describe('FeatureName', () => {
  it('renders correctly', () => {
    // Test implementation
  });

  it('handles user interaction', () => {
    // Test implementation
  });
});
```

## Documentation Requirements

### 1. Component Documentation
```typescript
/**
 * @component FeatureName
 * @description Brief description of the component's purpose
 *
 * @param {ComponentProps} props - Component props
 * @param {number} props.value - Description of value prop
 * @param {function} props.onChange - Description of onChange prop
 *
 * @example
 * <FeatureName
 *   value={5}
 *   onChange={(newValue) => console.log(newValue)}
 * />
 */
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