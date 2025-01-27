-- Add at the top of the file
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First create the updated_at function that will be used by triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.form_section_preferences CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- Create core user profile table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comprehensive user preferences table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    theme TEXT DEFAULT 'system' NOT NULL,
    use_bipolar_scale BOOLEAN DEFAULT false NOT NULL,
    notification_enabled BOOLEAN DEFAULT false NOT NULL,
    reminder_time TIME DEFAULT '09:00',
    reminder_days TEXT[] DEFAULT ARRAY['1','2','3','4','5','6','7'],
    form_sections JSONB DEFAULT '[
        {"id": "mood", "title": "Mood and Notes", "component": "MoodAndNotes"},
        {"id": "sleep", "title": "Sleep", "component": "Sleep"},
        {"id": "medications", "title": "Medications", "component": "Medications"},
        {"id": "activities", "title": "Activities", "component": "Activities"},
        {"id": "social", "title": "Social Connections", "component": "SocialConnections"},
        {"id": "behaviors", "title": "Problematic Behaviors", "component": "Behaviors"},
        {"id": "skills", "title": "Skills", "component": "Skills"},
        {"id": "spiritual", "title": "Spiritual Practices", "component": "Spiritual"}
    ]'::jsonb,
    section_order TEXT[],
    last_sign_in TIMESTAMP WITH TIME ZONE,
    sign_in_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Create form section preferences table
CREATE TABLE public.form_section_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    section_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_section_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own form preferences"
    ON public.form_section_preferences
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_section_preferences_updated_at 
    BEFORE UPDATE ON public.form_section_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_form_section_preferences_user_id ON public.form_section_preferences(user_id);

-- Insert default preferences for existing users
INSERT INTO public.user_preferences (user_id, theme, use_bipolar_scale, notification_enabled)
SELECT 
    id as user_id,
    'system' as theme,
    false as use_bipolar_scale,
    false as notification_enabled
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Add after the function creation
-- Ensure the auth schema exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE SCHEMA IF NOT EXISTS auth;
    END IF;
END$$;

-- Add proper error handling for triggers
DO $$
BEGIN
    -- Drop existing triggers first to avoid conflicts
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
    DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
    DROP TRIGGER IF EXISTS update_form_section_preferences_updated_at ON public.form_section_preferences;
EXCEPTION
    WHEN undefined_table THEN
        -- Tables don't exist yet, that's fine
        NULL;
END $$;

-- Add at the end of the file, before the trigger creation

-- Update the get_table_info function to be more PostgREST friendly
CREATE OR REPLACE FUNCTION public.get_table_info(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT 
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::text
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.table_name = table_name
    ORDER BY c.ordinal_position;
$$;

-- Add proper comments for PostgREST
COMMENT ON FUNCTION public.get_table_info(text) IS 'Get column information for a table';

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_info(text) TO anon;

-- Add at the end of the file
CREATE OR REPLACE VIEW public.rls_policies AS
SELECT 
    schemaname::text,
    tablename::text,
    policyname::text,
    permissive::boolean,
    roles::text[],
    cmd::text,
    qual::text,
    with_check::text
FROM pg_policies
WHERE schemaname = 'public';

-- Grant access to the view
GRANT SELECT ON public.rls_policies TO authenticated;
GRANT SELECT ON public.rls_policies TO anon;

-- Add RLS policies function
CREATE OR REPLACE FUNCTION public.get_rls_policies()
RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    permissive boolean,
    roles text[],
    cmd text,
    qual text,
    with_check text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT * FROM public.rls_policies;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_rls_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rls_policies() TO anon;

-- Add near the end of the file
CREATE OR REPLACE FUNCTION public.test_rls_policies()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Just verify we can access the policies
  PERFORM *
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.test_rls_policies() TO anon; 