-- Migration: 20250129111016

-- Add last_accessed column to user_preferences
alter table public.user_preferences
add column if not exists draft_last_accessed timestamp with time zone default timezone('utc'::text, now());

-- Create function to clean old drafts
create or replace function app_utils.clean_old_drafts(older_than interval default interval '24 hours')
returns integer
language plpgsql
security definer
as $$
declare
  cleaned_count integer;
begin
  -- Clean drafts older than the specified interval
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

-- Create function to clean single user's drafts
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

-- Create trigger function to update last_accessed and auto-clean old drafts
create or replace function app_utils.update_draft_last_accessed()
returns trigger
language plpgsql
as $$
begin
  -- Only update timestamp if draft_data is being modified
  if OLD.draft_data != NEW.draft_data then
    NEW.draft_last_accessed = timezone('utc'::text, now());
    
    -- Clean old drafts when a user saves new draft data
    -- This helps maintain cleanup without relying on cron
    perform app_utils.clean_old_drafts();
  end if;
  return NEW;
end;
$$;

-- Create trigger
drop trigger if exists update_draft_timestamp on public.user_preferences;
create trigger update_draft_timestamp
  before update on public.user_preferences
  for each row
  execute function app_utils.update_draft_last_accessed();
