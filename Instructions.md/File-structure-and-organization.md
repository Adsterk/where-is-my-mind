# File Structure and Organization

## Overview
The codebase follows a modular structure organized by feature and responsibility. Below is the current file structure with descriptions of key directories and files.

## Root Structure
```
src/
├── app/           # Next.js app router pages and layouts
│   ├── auth/      # Auth routes with server-side auth
│   ├── dashboard/ # Dashboard routes
│   ├── form/      # Form routes
│   ├── api/       # API routes
│   ├── layout.tsx # Root layout with providers
│   └── page.tsx   # Landing page
├── components/    # React components organized by feature
├── lib/          # Core utilities, hooks, and business logic
├── types/        # Global TypeScript types
└── config/       # Application configuration files
```

## Components Directory (`src/components/`)
```
components/
├── auth/          # Authentication-related components
│   ├── __tests__/                # Test files for auth components
│   ├── forms/                    # Auth form components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ResetPasswordForm.tsx
│   ├── providers/               # Auth-specific providers
│   │   ├── AuthProvider.tsx
│   │   └── OAuthProvider.tsx
│   ├── guards/                  # Route protection components
│   │   └── AuthGuard.tsx
│   ├── types.ts                 # Auth component types
│   └── index.ts                 # Auth component exports
├── dashboard/     # Dashboard components
│   ├── overview/     # Overview components (MoodOverview)
│   ├── visualizations/ # Data visualization components
│   │   ├── MoodChart.tsx
│   │   ├── MoodPatterns.tsx
│   │   ├── RecentEntries.tsx
│   │   └── BasicStats.tsx
│   └── controls/     # Control components (DateRangeSelector)
├── form/         # Form components
│   └── mood-entry/   # Mood tracking components
│       ├── MoodScore.tsx
│       ├── SleepScore.tsx
│       ├── BaseTracker.tsx
│       ├── MedicationTracker.tsx
│       ├── BehaviorTracker.tsx
│       ├── SkillsTracker.tsx
│       ├── SocialTracker.tsx
│       └── SelfCareTracker.tsx
├── providers/    # Context providers
│   ├── auth/         # Auth provider
│   ├── form/         # Form state provider
│   └── accessibility/# Accessibility provider
├── settings/     # Settings components
│   ├── UserPreferences.tsx
│   ├── DataManagement.tsx
│   └── AccountSettings.tsx
├── shared/       # Shared components
└── ui/          # UI components (shadcn)
```

## Library Directory (`src/lib/`)
```
lib/
├── auth/         # Authentication business logic
│   ├── hooks/        # Auth-specific hooks
│   │   ├── useAuth.ts
│   │   ├── useSession.ts
│   │   └── useOAuth.ts
│   ├── utils/        # Auth utility functions
│   │   ├── session.ts
│   │   ├── tokens.ts
│   │   └── oauth.ts
│   ├── providers/    # Auth provider implementations
│   │   ├── email.ts
│   │   ├── google.ts
│   │   ├── github.ts
│   │   ├── magic-link.ts
│   │   └── phone.ts
│   ├── types/        # Auth-specific types
│   │   └── index.ts
│   └── auth-service.ts # Core authentication service
├── supabase/    # Supabase configuration and types
│   ├── client.ts     # Browser client
│   ├── server.ts     # Server client
│   └── types.ts      # Supabase types
├── hooks/       # Custom hooks
├── stores/      # State management
├── types/       # TypeScript types
│   ├── database.ts  # Database types
│   ├── entries.ts   # Entry types
│   └── index.ts     # Type exports
└── utils/       # Utility functions
```

## Component Organization

### Dashboard Components
The dashboard components are organized into three main categories:

1. **Overview Components** (`components/dashboard/overview/`)
   - `MoodOverview.tsx`: Displays today's mood summary

2. **Visualization Components** (`components/dashboard/visualizations/`)
   - `MoodChart.tsx`: Line chart visualization of mood trends
   - `MoodPatterns.tsx`: Pattern analysis visualization
   - `RecentEntries.tsx`: List of recent mood entries
   - `BasicStats.tsx`: Statistical overview of mood data

3. **Control Components** (`components/dashboard/controls/`)
   - `DateRangeSelector.tsx`: Date range selection for visualizations

### Form Components
Form components are organized under `components/form/mood-entry/`:

1. **Core Entry Components**
   - `MoodScore.tsx`: Mood score input with bipolar scale option
   - `SleepScore.tsx`: Sleep duration input with quality indicator

2. **Tracking Components**
   - `BaseTracker.tsx`: Base component for all tracking features
   - `MedicationTracker.tsx`: Medication tracking
   - `BehaviorTracker.tsx`: Behavior tracking
   - `SkillsTracker.tsx`: Skills tracking
   - `SocialTracker.tsx`: Social activities tracking
   - `SelfCareTracker.tsx`: Self-care activities tracking

### Settings Components
Settings components are organized under `components/settings/`:

1. **User Settings**
   - `UserPreferences.tsx`: User preferences management
   - `DataManagement.tsx`: Data export and management
   - `AccountSettings.tsx`: Account deletion and management

## Types Organization

### 1. Library Types (`src/lib/types/`)
```
lib/types/
├── index.ts           # Barrel exports
├── database.ts        # Database and Supabase types
└── entries.ts         # Entry-related types
```

### 2. Component Types
```
components/feature-name/
├── FeatureName.tsx    # Component implementation
├── index.ts          # Barrel exports
└── types.ts         # Component-specific types
```

### 3. Global Types (`src/types/`)
```
types/
├── index.ts          # Global type exports
└── theme.ts         # Theme types
```

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

### 6. Testing Guidelines
- Co-locate test files with their components
- Follow the established testing patterns
- Include unit, integration, and E2E tests as appropriate
- Maintain high test coverage

## Notes
- Authentication components are centralized in the `components/auth/` directory
- Core authentication logic is separated in `lib/auth/`
- Supabase configuration and types are maintained in `lib/supabase/`
- Test files are co-located with their respective components
- Each feature module should be self-contained with its own types and tests
- Use barrel exports (`index.ts`) for clean imports


### Root-Level Configuration and Testing

#### Configuration Files
The project currently has configuration files spread across multiple locations:

1. **Root Config Directory** (`/config/`)
   - Application Features (`features.ts`)
   - Route Definitions (`routes.ts`)
   - Global Constants (`constants.ts`)
   - Theme Configuration (`themes/`)
   - Localization (`timezones.ts`, `languages.ts`)
   - Build Configuration (`next.config.js`, `tsconfig.json`)

2. **Supabase Configuration** (`/supabase/`)
   - Database Migrations (`migrations/`)
   - Supabase Settings (`config.toml`)
   - Branch Management (`.branches/`)

#### Testing Structure
The project has a comprehensive testing setup at the root level:

1. **Test Directory** (`/tests/`)
   - Component Tests (`components/`)
   - Mock Data and Utilities (`mocks/`)
   - Test Setup and Configuration
     - `test-utils.tsx`
     - `setup.ts`
     - `jest.setup.ts`
   - Feature-specific Tests
     - `auth/`
     - `utils/`
   - Testing Utilities (`test-utils/`)

### Key Differences and Proposed Changes

1. **App Directory**
   - ✨ Current uses route groups with parentheses (e.g., `(auth)`, `(dashboard)`)
   - 🔄 Keep this structure as it follows Next.js 14+ best practices
   - ❌ Remove `test-components/` directory and move tests to appropriate locations

2. **Components Directory**
   - ✅ Mostly aligned with instructions
   - 🔄 Verify internal structure of each component directory
   - 🔄 Ensure each component follows the pattern:
     ```
     components/feature-name/
     ├── FeatureName.tsx
     ├── index.ts
     ├── types.ts
     └── __tests__/
     ```

3. **Configuration Management**
   - 🔄 Move application-specific config to `src/config/`
     - Features, routes, constants, themes
     - Localization settings
   - ✅ Keep build config at root level
     - `next.config.js`
     - `tsconfig.json`
   - ✅ Keep Supabase config at root level
     - All contents of `/supabase/`

4. **Testing Structure**
   - 🔄 Migrate to co-located tests
     - Move component tests to `__tests__` directories
     - Keep global test utilities in `/tests`
   - 🔄 Update test imports and references
   - ✅ Keep test configuration at root level
     - `jest.setup.ts`
     - `setup.ts`

5. **Type Definitions**
   - ✅ Keep global types at root level (`/types`)
   - 🔄 Move feature-specific types to their components
   - ✅ Keep Supabase types in `src/lib/supabase/types`

## Detailed Component Organization

### Dashboard Components
Current structure matches instructions with:
```
components/dashboard/
├── overview/
│   └── MoodOverview.tsx
├── visualizations/
│   ├── MoodChart.tsx
│   ├── MoodPatterns.tsx
│   ├── RecentEntries.tsx
│   └── BasicStats.tsx
└── controls/
    └── DateRangeSelector.tsx
```

### Form Components
Current structure matches instructions with:
```
components/form/mood-entry/
├── MoodScore.tsx
├── SleepScore.tsx
├── BaseTracker.tsx
├── MedicationTracker.tsx
├── BehaviorTracker.tsx
├── SkillsTracker.tsx
├── SocialTracker.tsx
└── SelfCareTracker.tsx
```

### Settings Components
Current structure matches instructions with:
```
components/settings/
├── UserPreferences.tsx
├── DataManagement.tsx
└── AccountSettings.tsx
```

## Action Items

1. **Test Migration**
   - Move tests from `/tests` to `__tests__` directories next to their components
   - Update test imports and paths
   - Verify test coverage after migration

2. **Configuration Consolidation**
   - Review contents of `config/` directory
   - Move configurations to appropriate feature directories
   - Update imports and references

3. **Style Migration**
   - Move global styles to `app/globals.css`
   - Move component-specific styles to their respective directories
   - Update style imports

4. **Server Utilities**
   - Review contents of `lib/server/`
   - Move utilities to appropriate locations in `lib/utils/`
   - Update imports and references

5. **Validation Logic**
   - Review contents of `lib/validation/`
   - Move validation logic to feature-specific directories
   - Update imports and references

## Next.js 14+ Best Practices Alignment

1. **Route Groups**
   - ✅ Keep using route groups with parentheses
   - ✅ Maintain current organization of auth, dashboard, and form routes

2. **Server Components**
   - 🔄 Review and mark appropriate components as server components
   - 🔄 Move data fetching to server components where possible

3. **Client Components**
   - ✅ Properly marked with 'use client' directive
   - ✅ Clear separation of client/server concerns

4. **Metadata**
   - 🔄 Ensure proper metadata configuration in layout files
   - 🔄 Implement dynamic metadata where appropriate

5. **Loading and Error States**
   - 🔄 Add loading.tsx files for route segments
   - 🔄 Add error.tsx files for error boundaries

## Implementation Priority

1. High Priority
   - Test migration and co-location
   - Configuration reorganization
   - Server component optimization
   - Loading and error state implementation

2. Medium Priority
   - Type definition organization
   - Style migration
   - Validation logic reorganization

3. Low Priority
   - Documentation updates
   - Code cleanup
   - Performance optimization

## Migration Plan

### Phase 1: Test Migration and Co-location
1. **Setup (Day 1)**
   ```bash
   # Create __tests__ directories in each component folder
   mkdir -p src/components/{auth,dashboard,form,providers,settings,shared}/__tests__
   ```

2. **Component Test Migration (Days 1-3)**
   - Move tests from `/tests/components/` to respective `__tests__` directories
   - Update import paths in test files
   - Verify test execution in new locations
   - Update test utilities imports

3. **Test Utilities Consolidation (Day 4)**
   - Create `src/lib/test-utils/` directory
   - Move reusable test utilities from `/tests/test-utils/`
   - Update test utility imports across all test files

4. **Cleanup (Day 5)**
   - Remove empty directories in `/tests`
   - Update Jest configuration for new test locations
   - Run full test suite to verify migration

### Phase 2: Configuration Reorganization (Days 6-8)
1. **Create New Structure**
   ```bash
   # Create new configuration directory
   mkdir -p src/config/{features,routes,themes,localization}
   ```

2. **Move Configuration Files**
   - Move application-specific configs to `src/config/`
     ```
     features.ts → src/config/features/index.ts
     routes.ts → src/config/routes/index.ts
     constants.ts → src/config/constants.ts
     themes/ → src/config/themes/
     timezones.ts → src/config/localization/timezones.ts
     languages.ts → src/config/localization/languages.ts
     ```
   - Keep build configs at root:
     - `next.config.js`
     - `tsconfig.json`

3. **Update Imports**
   - Update all import statements to reflect new paths
   - Create index files for easy imports
   - Test application functionality

### Phase 3: Component Structure Alignment (Days 9-11)
1. **Restructure Components**
   ```bash
   # For each component directory
   mkdir -p src/components/{auth,dashboard,form,settings}/__tests__
   touch src/components/{auth,dashboard,form,settings}/index.ts
   touch src/components/{auth,dashboard,form,settings}/types.ts
   ```

2. **Move Feature-specific Types**
   - Move types from `src/lib/types/` to component directories
   - Update type imports across the application
   - Create type exports in component `index.ts` files

### Phase 4: Server Component Optimization (Days 12-14)
1. **Server Component Migration**
   - Identify components that can be server components
   - Remove 'use client' where unnecessary
   - Move data fetching to server components

2. **Add Loading States**
   ```bash
   # Create loading files for each route
   touch src/app/{auth,dashboard,form}/loading.tsx
   ```

3. **Add Error Boundaries**
   ```bash
   # Create error files for each route
   touch src/app/{auth,dashboard,form}/error.tsx
   ```

### Phase 5: Cleanup and Validation (Day 15)
1. **Directory Cleanup**
   - Remove empty directories
   - Delete unused files
   - Update documentation

2. **Testing and Validation**
   - Run full test suite
   - Check build process
   - Verify all features work
   - Update README and documentation

### Dependencies and Considerations
1. **Test Coverage**
   - Maintain or improve current test coverage
   - Add tests for new configurations

2. **Performance Monitoring**
   - Monitor build times before and after
   - Check bundle sizes
   - Verify loading performance

3. **Documentation**
   - Update component documentation
   - Update import examples
   - Update contribution guidelines

4. **Rollback Plan**
   - Create backup of current structure
   - Document all changes
   - Maintain ability to revert changes

## Success Criteria
1. All tests passing in new locations
2. No broken imports or references
3. Improved or maintained build performance
4. Clear component organization
5. Proper separation of server/client components
6. Complete documentation of new structure

This migration plan is designed to be executed over 15 working days, with each phase building on the previous one. Regular testing and validation throughout the process will ensure a smooth transition to the new structure.

This document serves as the source of truth for the project's file structure and organization. It should be used to update the AI Agent Instructions document and maintain consistency across the project. 