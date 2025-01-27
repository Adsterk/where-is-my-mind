-- Add at the top of the file
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core mood entry functionality
CREATE TABLE public.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 0 AND mood_score <= 10),
    notes TEXT,
    is_bipolar_scale BOOLEAN DEFAULT false,
    sleep_hours NUMERIC(4,2) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    last_edited_at TIMESTAMP WITH TIME ZONE,
    edit_history JSONB[] DEFAULT ARRAY[]::JSONB[],
    section_order TEXT[] DEFAULT ARRAY[
        'mood', 'sleep', 'medications', 'activities', 'social', 
        'behaviors', 'skills', 'spiritual'
    ],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own entries"
    ON public.mood_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
    ON public.mood_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
    ON public.mood_entries FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_mood_entries_user_id_created_at 
    ON public.mood_entries (user_id, created_at DESC);

-- Function to track edit history
CREATE OR REPLACE FUNCTION public.track_mood_entry_edits()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        NEW.last_edited_at = NOW();
        NEW.edit_history = array_append(
            COALESCE(OLD.edit_history, ARRAY[]::jsonb[]),
            jsonb_build_object(
                'timestamp', NOW(),
                'previous_value', to_jsonb(OLD.*) - 'edit_history',
                'new_value', to_jsonb(NEW.*) - 'edit_history'
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for edit tracking
CREATE TRIGGER track_edits
    BEFORE UPDATE ON public.mood_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.track_mood_entry_edits(); 