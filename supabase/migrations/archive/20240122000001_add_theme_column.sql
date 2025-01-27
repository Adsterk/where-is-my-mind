-- Add theme column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_preferences'
        AND column_name = 'theme'
    ) THEN
        ALTER TABLE public.user_preferences
        ADD COLUMN theme TEXT DEFAULT 'system' NOT NULL;

        COMMENT ON COLUMN public.user_preferences.theme IS 'User theme preference (light/dark/system)';
    END IF;
END $$;

-- Update existing rows to have the default theme if needed
UPDATE public.user_preferences
SET theme = 'system'
WHERE theme IS NULL; 