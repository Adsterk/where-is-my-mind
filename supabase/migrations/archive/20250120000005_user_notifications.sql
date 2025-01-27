-- Add notification settings to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS reminder_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7];

-- Update existing preferences with notification defaults
UPDATE public.user_preferences
SET 
  notification_enabled = false,
  reminder_time = '09:00'::TIME
WHERE notification_enabled IS NULL;

-- Add notification settings validation (fixed constraint)
ALTER TABLE public.user_preferences
ADD CONSTRAINT valid_reminder_time CHECK (
  reminder_time IS NULL OR 
  EXTRACT(HOUR FROM reminder_time) >= 0 AND 
  EXTRACT(HOUR FROM reminder_time) < 24
);

-- Create function to validate reminder days
CREATE OR REPLACE FUNCTION public.validate_reminder_days(days INTEGER[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(days) AS day 
    WHERE day < 1 OR day > 7
  );
END;
$$ LANGUAGE plpgsql;

-- Add trigger for reminder days validation
CREATE OR REPLACE FUNCTION public.trigger_validate_reminder_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.validate_reminder_days(NEW.reminder_days) THEN
    RAISE EXCEPTION 'reminder_days must be between 1 and 7';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_reminder_days
  BEFORE INSERT OR UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_validate_reminder_days();

-- Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    use_bipolar_scale,
    notification_enabled,
    reminder_time
  )
  VALUES (
    NEW.id,
    'system',
    false,
    false,
    '09:00'::TIME
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 