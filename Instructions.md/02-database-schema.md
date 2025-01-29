# Database Schema and Type Definitions

## Database Tables

### User Preferences
```sql
create table public.user_preferences (
  id uuid references auth.users primary key,
  theme_preference text default 'system',
  language text default 'en',
  timezone text default 'UTC',
  form_layout jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Form Sections
```sql
create table public.form_sections (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('mood', 'sleep', 'medication', 'behavior', 'skill', 'social', 'spiritual')),
  default_order integer not null,
  is_required boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### User Sections
```sql
create table public.user_sections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  section_id uuid references public.form_sections,
  display_order integer not null,
  is_visible boolean default true,
  unique(user_id, section_id)
);
```

### Tracking Items
```sql
create table public.tracking_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  section_id uuid references public.form_sections,
  name text not null,
  is_active boolean default true,
  display_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Daily Entries
```sql
create table public.daily_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  date date not null,
  mood_score integer check (mood_score >= 0 and mood_score <= 10),
  is_bipolar boolean default false,
  sleep_hours numeric(3,1),
  tracking_data jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, date)
);
```

## Row Level Security Policies

```sql
-- Enable RLS on all tables
alter table public.user_preferences enable row level security;
alter table public.user_sections enable row level security;
alter table public.tracking_items enable row level security;
alter table public.daily_entries enable row level security;

-- Create policies
create policy "Users can only access their own preferences"
  on public.user_preferences for all
  using (auth.uid() = id);

create policy "Users can only access their own sections"
  on public.user_sections for all
  using (auth.uid() = user_id);

create policy "Users can only access their own tracking items"
  on public.tracking_items for all
  using (auth.uid() = user_id);

create policy "Users can only access their own daily entries"
  on public.daily_entries for all
  using (auth.uid() = user_id);
```

## TypeScript Type Definitions

```typescript
// lib/types/database.ts

export interface UserPreferences {
  id: string;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  form_layout: FormSection[];
  created_at: string;
  updated_at: string;
}

export interface FormSection {
  id: string;
  name: string;
  type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'spiritual';
  default_order: number;
  is_required: boolean;
  created_at: string;
}

export interface TrackingItem {
  id: string;
  user_id: string;
  section_id: string;
  name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  date: string;
  mood_score?: number;
  is_bipolar: boolean;
  sleep_hours?: number;
  tracking_data: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
```

## Implementation Notes

### Data Integrity Rules
1. All user data must be associated with an auth.users record
2. Form sections must have unique display orders per user
3. Tracking items must belong to valid sections
4. Daily entries are limited to one per user per day

### Security Considerations
1. All tables must have RLS policies
2. User data must be isolated
3. Input validation must be implemented
4. Sensitive data must be properly handled
5. Database roles must be properly configured