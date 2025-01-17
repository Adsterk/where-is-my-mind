-- Create mood_entries table
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 0 AND mood_score <= 10),
    notes TEXT,
    is_bipolar_scale BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own entries"
    ON public.mood_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
    ON public.mood_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
    ON public.mood_entries
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
    ON public.mood_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX mood_entries_user_id_created_at_idx ON public.mood_entries (user_id, created_at DESC); 