-- Migration: 20250129110304

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
