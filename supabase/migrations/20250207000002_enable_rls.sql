-- Migration: 20250129110304

-- Enable RLS on all tables
alter table public.user_preferences enable row level security;
alter table public.user_sections enable row level security;
alter table public.tracking_items enable row level security;
alter table public.daily_entries enable row level security;
alter table public.form_sections enable row level security;

-- Drop existing policies
drop policy if exists "Users can only access their own daily entries" on public.daily_entries;

-- Create granular policies for daily_entries
create policy "Users can read their own daily entries"
  on public.daily_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own daily entries"
  on public.daily_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own daily entries"
  on public.daily_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own daily entries"
  on public.daily_entries
  for delete
  using (auth.uid() = user_id);

-- Create policies for other tables
create policy "Users can only access their own preferences"
  on public.user_preferences for all
  using (auth.uid() = id);

create policy "Users can only access their own sections"
  on public.user_sections for all
  using (auth.uid() = user_id);

create policy "Users can only access their own tracking items"
  on public.tracking_items for all
  using (auth.uid() = user_id);

create policy "Authenticated users can read form sections"
  on public.form_sections for select
  using (auth.role() = 'authenticated');
