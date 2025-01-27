-- Create table for form section preferences
CREATE TABLE form_section_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, section_id)
);

-- Enable RLS
ALTER TABLE form_section_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage their own form preferences"
  ON form_section_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id); 