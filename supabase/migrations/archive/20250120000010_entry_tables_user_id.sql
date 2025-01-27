-- Add user_id to entry tables
ALTER TABLE medication_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE activity_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE behavior_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE skill_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE social_connection_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE spiritual_practice_entries 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to include user_id check
DO $$ 
DECLARE
  table_name text;
BEGIN
  -- Drop existing policies first
  FOR table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_name LIKE '%_entries'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own %I" ON %I', 
      table_name, table_name);
  END LOOP;

  -- Create new policies
  -- Medication entries
  CREATE POLICY "Users can manage their own medication_entries" ON medication_entries
    FOR ALL TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM mood_entries me
        WHERE me.id = medication_entries.mood_entry_id
        AND me.user_id = auth.uid()
      )
    );

  -- Activity entries
  CREATE POLICY "Users can manage their own activity_entries" ON activity_entries
    FOR ALL TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM mood_entries me
        WHERE me.id = activity_entries.mood_entry_id
        AND me.user_id = auth.uid()
      )
    );

  -- Behavior entries
  CREATE POLICY "Users can manage their own behavior_entries" ON behavior_entries
    FOR ALL TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM mood_entries me
        WHERE me.id = behavior_entries.mood_entry_id
        AND me.user_id = auth.uid()
      )
    );

  -- Skill entries
  CREATE POLICY "Users can manage their own skill_entries" ON skill_entries
    FOR ALL TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM mood_entries me
        WHERE me.id = skill_entries.mood_entry_id
        AND me.user_id = auth.uid()
      )
    );

  -- Social connection entries
  CREATE POLICY "Users can manage their own social_connection_entries" ON social_connection_entries
    FOR ALL TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM mood_entries me
        WHERE me.id = social_connection_entries.mood_entry_id
        AND me.user_id = auth.uid()
      )
    );

  -- Spiritual practice entries
  CREATE POLICY "Users can manage their own spiritual_practice_entries" ON spiritual_practice_entries
    FOR ALL TO authenticated
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM mood_entries me
        WHERE me.id = spiritual_practice_entries.mood_entry_id
        AND me.user_id = auth.uid()
      )
    );
END $$; 