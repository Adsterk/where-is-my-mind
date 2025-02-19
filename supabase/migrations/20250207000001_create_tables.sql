-- Migration: 20250129110303

-- Create daily_entries table
create table if not exists public.daily_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  mood_score integer check (mood_score >= 0 and mood_score <= 10),
  is_bipolar boolean default false,
  sleep_hours numeric(3,1) check (sleep_hours >= 0 and sleep_hours <= 24),
  tracking_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at trigger to daily_entries
drop trigger if exists set_updated_at on public.daily_entries;
create trigger set_updated_at
  before update on public.daily_entries
  for each row
  execute function public.handle_updated_at(); 