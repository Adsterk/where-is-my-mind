-- Migration: 20250129111016

-- Add last_accessed column to user_preferences
alter table public.user_preferences
add column draft_last_accessed timestamp with time zone default timezone('utc'::text, now());

-- Create function to clean old drafts
create or replace function clean_old_drafts()
returns void
language plpgsql
security definer
as 90351
begin
  -- Clean drafts older than 24 hours
  update public.user_preferences
  set draft_data = '{}'::jsonb,
      draft_last_accessed = null
  where draft_last_accessed < now() - interval '24 hours'
  and draft_data != '{}'::jsonb;
end;
90351;

-- Create trigger function to update last_accessed
create or replace function update_draft_last_accessed()
returns trigger
language plpgsql
as 90351
begin
  -- Only update timestamp if draft_data is being modified
  if OLD.draft_data != NEW.draft_data then
    NEW.draft_last_accessed = timezone('utc'::text, now());
  end if;
  return NEW;
end;
90351;

-- Create trigger
create trigger update_draft_timestamp
  before update on public.user_preferences
  for each row
  execute function update_draft_last_accessed();

-- Schedule cleanup job (runs every hour)
select cron.schedule(
  'cleanup-drafts',
  '0 * * * *',  -- Every hour
  90351
    select clean_old_drafts();
  90351
);
