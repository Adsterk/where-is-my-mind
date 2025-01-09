create table public.mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mood_score integer not null check (mood_score >= 1 and mood_score <= 10),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  timezone text not null
);

-- Enable RLS
alter table public.mood_entries enable row level security;

-- Create policies
create policy "Users can insert their own mood entries"
  on mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own mood entries"
  on mood_entries for select
  using (auth.uid() = user_id); 