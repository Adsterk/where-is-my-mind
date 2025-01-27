-- Consolidate user_preferences table structure
DO $$
BEGIN
    -- First ensure the table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_preferences'
    ) THEN
        CREATE TABLE public.user_preferences (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            CONSTRAINT unique_user_preferences UNIQUE(user_id)
        );
    END IF;

    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'theme') THEN
        ALTER TABLE public.user_preferences ADD COLUMN theme TEXT DEFAULT 'system' NOT NULL;
        COMMENT ON COLUMN public.user_preferences.theme IS 'User theme preference (light/dark/system)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'use_bipolar_scale') THEN
        ALTER TABLE public.user_preferences ADD COLUMN use_bipolar_scale BOOLEAN DEFAULT false NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'notification_enabled') THEN
        ALTER TABLE public.user_preferences ADD COLUMN notification_enabled BOOLEAN DEFAULT false NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'reminder_time') THEN
        ALTER TABLE public.user_preferences ADD COLUMN reminder_time TIME;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'created_at') THEN
        ALTER TABLE public.user_preferences ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'updated_at') THEN
        ALTER TABLE public.user_preferences ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;

    -- Add form customization columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'form_sections') THEN
        ALTER TABLE public.user_preferences ADD COLUMN form_sections JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'section_order') THEN
        ALTER TABLE public.user_preferences ADD COLUMN section_order TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'reminder_days') THEN
        ALTER TABLE public.user_preferences ADD COLUMN reminder_days TEXT[];
    END IF;

    -- Add user activity columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'last_sign_in') THEN
        ALTER TABLE public.user_preferences ADD COLUMN last_sign_in TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'sign_in_count') THEN
        ALTER TABLE public.user_preferences ADD COLUMN sign_in_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;

CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id); 