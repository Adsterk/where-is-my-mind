-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA extensions;

-- Ensure mood_entries table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mood_entries'
    ) THEN
        RAISE EXCEPTION 'mood_entries table must exist before creating section tables';
    END IF;
END $$;

-- Medication tracking
CREATE TABLE public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.medication_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    time_taken TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    side_effects TEXT,
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity tracking
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.activity_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    engagement_level INTEGER CHECK (engagement_level BETWEEN 1 AND 5),
    impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),
    notes TEXT,
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Social connections
CREATE TABLE public.social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.social_connection_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES social_connections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    impact_rating INTEGER CHECK (impact_rating BETWEEN 1 AND 5),
    notes TEXT,
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Problematic behaviors
CREATE TABLE public.problematic_behaviors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.behavior_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
    behavior_id UUID REFERENCES problematic_behaviors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
    notes TEXT,
    triggers TEXT,
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Skills
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.skill_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    effectiveness INTEGER CHECK (effectiveness BETWEEN 1 AND 5),
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    notes TEXT,
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Spiritual practices
CREATE TABLE public.spiritual_practices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.spiritual_practice_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mood_entry_id UUID REFERENCES mood_entries(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES spiritual_practices(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    fulfillment_rating INTEGER CHECK (fulfillment_rating BETWEEN 1 AND 5),
    notes TEXT,
    is_draft BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
DO $$ 
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'medications', 'medication_entries',
            'activities', 'activity_entries',
            'social_connections', 'social_connection_entries',
            'problematic_behaviors', 'behavior_entries',
            'skills', 'skill_entries',
            'spiritual_practices', 'spiritual_practice_entries'
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        
        -- Create RLS policy for the main tables
        IF table_name NOT LIKE '%entries' THEN
            EXECUTE format(
                'CREATE POLICY "Users can manage their own %1$I" ON public.%1$I
                FOR ALL TO authenticated
                USING (user_id = auth.uid())',
                table_name
            );
        -- Create RLS policy for the entry tables
        ELSE
            EXECUTE format(
                'CREATE POLICY "Users can manage their own %1$I" ON public.%1$I
                FOR ALL TO authenticated
                USING (user_id = auth.uid())',
                table_name
            );
        END IF;
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX idx_medication_entries_mood_entry_id ON medication_entries(mood_entry_id);
CREATE INDEX idx_activity_entries_mood_entry_id ON activity_entries(mood_entry_id);
CREATE INDEX idx_social_connection_entries_mood_entry_id ON social_connection_entries(mood_entry_id);
CREATE INDEX idx_behavior_entries_mood_entry_id ON behavior_entries(mood_entry_id);
CREATE INDEX idx_skill_entries_mood_entry_id ON skill_entries(mood_entry_id);
CREATE INDEX idx_spiritual_practice_entries_mood_entry_id ON spiritual_practice_entries(mood_entry_id);

-- Create cleanup function for draft entries
CREATE OR REPLACE FUNCTION cleanup_old_draft_entries()
RETURNS void AS $$
BEGIN
    DELETE FROM medication_entries WHERE is_draft = true AND created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM activity_entries WHERE is_draft = true AND created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM social_connection_entries WHERE is_draft = true AND created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM behavior_entries WHERE is_draft = true AND created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM skill_entries WHERE is_draft = true AND created_at < NOW() - INTERVAL '24 hours';
    DELETE FROM spiritual_practice_entries WHERE is_draft = true AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job (only if we're in a supported environment)
DO $outer$
BEGIN
    -- Check if we can create a cron job (pg_cron is available)
    IF EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'pg_cron'
    ) THEN
        BEGIN  -- Nested block for exception handling
            EXECUTE format(
                $fmt$
                SELECT extensions.cron.schedule(
                    'cleanup-draft-entries',
                    '0 0 * * *',
                    $sql$SELECT public.cleanup_old_draft_entries();$sql$
                );
                $fmt$
            );
        EXCEPTION 
            WHEN OTHERS THEN  -- Catch any errors during cron scheduling
                RAISE NOTICE 'Could not create cron job: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'pg_cron extension not available, skipping cron job creation';
    END IF;
END;
$outer$; 