-- Restore theme column to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system' NOT NULL;

-- Migrate any existing theme preferences from profiles
UPDATE public.user_preferences up
SET theme = p.theme
FROM public.profiles p
WHERE p.id = up.user_id;

-- Add comment for clarity
COMMENT ON COLUMN public.user_preferences.theme IS 'User theme preference (light/dark/system)'; 