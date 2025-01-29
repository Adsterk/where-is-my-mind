-- Migration: 20250129110718

-- Add draft_data to user_preferences
alter table public.user_preferences
add column draft_data jsonb default '{}'::jsonb;
