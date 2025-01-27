-- Modify entry tables to make mood_entry_id nullable
ALTER TABLE medication_entries 
  ALTER COLUMN mood_entry_id DROP NOT NULL;

ALTER TABLE activity_entries 
  ALTER COLUMN mood_entry_id DROP NOT NULL;

-- (Similar ALTER statements for other entry tables...)

-- Add a draft status column to entries
ALTER TABLE medication_entries 
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;

ALTER TABLE activity_entries 
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;

-- (Similar ALTER statements for other entry tables...) 