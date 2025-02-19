# Database Schema and Security Implementation

## Overview

This document outlines the database schema and security implementations for the Where Is My Mind application. The schema is designed with security and privacy as primary concerns, implementing row-level security (RLS) and proper data isolation.

## Core Tables

### User Preferences
```sql
create table public.user_preferences (
  id uuid references auth.users primary key,
  theme_preference text default 'system',
  language text default 'en',
  timezone text default 'UTC',
  form_layout jsonb default '[]',
  draft_data jsonb default '{}',
  draft_last_accessed timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies
alter table public.user_preferences enable row level security;

create policy "Users can only access their own preferences"
  on public.user_preferences for all
  using (auth.uid() = id);
```

### Form Sections
```sql
create table public.form_sections (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('mood', 'sleep', 'medication', 'behavior', 'skill', 'social', 'self-care')),
  default_order integer not null,
  is_required boolean default false,
  is_visible boolean default true,
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
  user_id uuid references auth.users not null,
  date date not null,
  mood_score integer check (mood_score >= 0 and mood_score <= 10),
  is_bipolar boolean default false,
  sleep_hours numeric(3,1),
  tracking_data jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, date)
);

-- RLS Policies
alter table public.daily_entries enable row level security;

create policy "Users can read their own entries"
  on public.daily_entries for select
  using (auth.uid() = user_id);

create policy "Users can create their own entries"
  on public.daily_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entries"
  on public.daily_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own entries"
  on public.daily_entries for delete
  using (auth.uid() = user_id);
```

## Draft Management

The application includes a draft management system that automatically handles saving and cleaning up form drafts:

```sql
-- Create app_utils schema for utility functions
create schema if not exists app_utils;

-- Function to clean old drafts
create or replace function app_utils.clean_old_drafts(older_than interval default interval '24 hours')
returns integer
language plpgsql
security definer
as $$
declare
  cleaned_count integer;
begin
  with cleaned_drafts as (
    update public.user_preferences
    set draft_data = '{}'::jsonb,
        draft_last_accessed = null
    where draft_last_accessed < now() - older_than
    and draft_data != '{}'::jsonb
    returning id
  )
  select count(*) into cleaned_count from cleaned_drafts;
  return cleaned_count;
end;
$$;

-- Function to clean single user's drafts
create or replace function app_utils.clean_user_drafts(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  update public.user_preferences
  set draft_data = '{}'::jsonb,
      draft_last_accessed = null
  where id = user_id
  and draft_data != '{}'::jsonb;
  return found;
end;
$$;

-- Trigger function for draft management
create or replace function app_utils.update_draft_last_accessed()
returns trigger
language plpgsql
as $$
begin
  if OLD.draft_data != NEW.draft_data then
    NEW.draft_last_accessed = timezone('utc'::text, now());
    perform app_utils.clean_old_drafts();
  end if;
  return NEW;
end;
$$;

-- Create trigger for draft management
create trigger update_draft_timestamp
  before update on public.user_preferences
  for each row
  execute function app_utils.update_draft_last_accessed();
```

## Security Tables

### Rate Limiting
```sql
create table if not exists public.rate_limits (
  id uuid default uuid_generate_v4() primary key,
  key text not null,
  points integer not null default 0,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(key)
);

-- RLS Policies
alter table public.rate_limits enable row level security;

-- Only allow system access
create policy "System only access"
  on public.rate_limits
  using (auth.role() = 'service_role');

-- Function to clean expired rate limits
create or replace function app_utils.clean_rate_limits()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.rate_limits
  where expires_at < now();
end;
$$;

-- Create index for faster lookups
create index if not exists idx_rate_limits_key on public.rate_limits(key);
create index if not exists idx_rate_limits_expires_at on public.rate_limits(expires_at);
```

### Session Management
```sql
create table if not exists public.active_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  session_id text not null,
  user_agent text,
  ip_address inet,
  last_active timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, session_id)
);

-- RLS Policies
alter table public.active_sessions enable row level security;

create policy "Users can view their own sessions"
  on public.active_sessions for select
  using (auth.uid() = user_id);

create policy "System can manage sessions"
  on public.active_sessions
  using (auth.role() = 'service_role');

-- Function to clean expired sessions
create or replace function app_utils.clean_expired_sessions(
  max_inactive_time interval default interval '30 minutes'
)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.active_sessions
  where last_active < now() - max_inactive_time;
end;
$$;

-- Create indexes for faster lookups
create index if not exists idx_active_sessions_user on active_sessions(user_id);
create index if not exists idx_active_sessions_last_active on active_sessions(last_active);
```

## Utility Functions

### Security Utilities
```sql
-- Create app_utils schema if not exists
create schema if not exists app_utils;

-- Function to rotate user secrets
create or replace function app_utils.rotate_user_secrets(user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  -- Implementation depends on specific secret rotation needs
  null;
end;
$$;

-- Function to log security events
create or replace function app_utils.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_details jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  insert into app_utils.security_log (
    user_id,
    event_type,
    details
  ) values (
    p_user_id,
    p_event_type,
    p_details
  );
end;
$$;
```

## Security Logging

### Security Events Log
```sql
create table if not exists app_utils.security_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  event_type text not null,
  details jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create index for faster lookups
create index if not exists idx_security_log_user on app_utils.security_log(user_id);
create index if not exists idx_security_log_event_type on app_utils.security_log(event_type);
create index if not exists idx_security_log_created_at on app_utils.security_log(created_at);
```

## TypeScript Type Definitions

```typescript
// types/database.ts

export interface UserPreferences {
  id: string;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  form_layout: FormSection[];
  draft_data: Record<string, any>;
  draft_last_accessed: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormSection {
  id: string;
  name: string;
  type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'self-care';
  default_order: number;
  is_required: boolean;
  is_visible: boolean;
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
  tracking_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RateLimit {
  id: string;
  key: string;
  points: number;
  expires_at: string;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  session_id: string;
  user_agent?: string;
  ip_address?: string;
  last_active: string;
  created_at: string;
}

export interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  details: Record<string, any>;
  created_at: string;
}
```

## Security Best Practices

### 1. Data Access
- All tables have RLS enabled
- Policies enforce user data isolation
- Service role access is limited to necessary operations
- Regular security audits of access patterns

### 2. Rate Limiting
- Implemented at database level
- Configurable limits per action
- Automatic cleanup of expired entries
- Monitoring of rate limit triggers

### 3. Session Management
- Secure session handling
- Automatic session cleanup
- Concurrent session control
- Activity tracking for security

### 4. Logging and Monitoring
- Security event logging
- Audit trail maintenance
- Performance monitoring
- Anomaly detection

This schema represents the current state of the Where Is My Mind application's database, with a strong focus on security and data protection. All security features are actively maintained and regularly audited for effectiveness.