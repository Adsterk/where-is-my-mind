-- Migration: 20250129110253

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create user_preferences table
create table public.user_preferences (
  id uuid references auth.users primary key,
  theme_preference text default 'system',
  language text default 'en',
  timezone text default 'UTC',
  form_layout jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create form_sections table
create table public.form_sections (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('mood', 'sleep', 'medication', 'behavior', 'skill', 'social', 'spiritual')),
  default_order integer not null,
  is_required boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_sections table
create table public.user_sections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  section_id uuid references public.form_sections,
  display_order integer not null,
  is_visible boolean default true,
  unique(user_id, section_id)
);

-- Create tracking_items table
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

-- Create daily_entries table
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
