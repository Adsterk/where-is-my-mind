-- Add form sections and ordering to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS form_sections JSONB DEFAULT '[
  {"id": "mood", "title": "Mood and Notes", "component": "MoodAndNotes", "enabled": true},
  {"id": "sleep", "title": "Sleep", "component": "Sleep", "enabled": true},
  {"id": "medications", "title": "Medications", "component": "Medications", "enabled": true},
  {"id": "activities", "title": "Activities", "component": "Activities", "enabled": true},
  {"id": "social", "title": "Social Connections", "component": "SocialConnections", "enabled": true},
  {"id": "behaviors", "title": "Problematic Behaviors", "component": "Behaviors", "enabled": true},
  {"id": "skills", "title": "Skills", "component": "Skills", "enabled": true},
  {"id": "spiritual", "title": "Spiritual Practices", "component": "Spiritual", "enabled": true}
]'::jsonb,
ADD COLUMN IF NOT EXISTS section_order TEXT[] DEFAULT ARRAY[
  'mood', 'sleep', 'medications', 'activities', 'social', 'behaviors', 'skills', 'spiritual'
];

-- Add editing metadata to mood_entries
ALTER TABLE public.mood_entries
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edit_history JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN IF NOT EXISTS section_order TEXT[] DEFAULT ARRAY[
  'mood', 'sleep', 'medications', 'activities', 'social', 'behaviors', 'skills', 'spiritual'
];

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
DROP TRIGGER IF EXISTS track_edits ON public.mood_entries;
CREATE TRIGGER track_edits
  BEFORE UPDATE ON public.mood_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.track_mood_entry_edits(); 