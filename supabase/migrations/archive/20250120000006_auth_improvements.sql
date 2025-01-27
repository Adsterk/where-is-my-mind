-- Ensure user_preferences table has proper indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Add last_sign_in tracking
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sign_in_count INTEGER DEFAULT 0;

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    use_bipolar_scale,
    notification_enabled,
    reminder_time,
    sign_in_count
  )
  VALUES (
    NEW.id,
    'system',
    false,
    false,
    '09:00'::TIME,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS policies are correct
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id); 