-- First drop the existing function if it exists
DROP FUNCTION IF EXISTS cleanup_draft_entries(UUID);
DROP FUNCTION IF EXISTS cleanup_draft_entries(UUID, INTEGER);

-- Create a stored procedure for safe cleanup
CREATE OR REPLACE FUNCTION cleanup_draft_entries(p_user_id UUID, p_hours_old INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interval interval;
BEGIN
  -- Convert hours to interval
  v_interval := (p_hours_old || ' hours')::interval;

  -- Delete draft entries older than specified hours for the specific user
  DELETE FROM mood_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;
  
  DELETE FROM medication_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;
  
  DELETE FROM activity_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;

  DELETE FROM behavior_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;

  DELETE FROM skill_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;

  DELETE FROM social_connection_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;

  DELETE FROM spiritual_practice_entries 
  WHERE user_id = p_user_id 
  AND is_draft = true 
  AND created_at < NOW() - v_interval;
END;
$$;

-- Revoke any existing permissions
REVOKE EXECUTE ON FUNCTION cleanup_draft_entries(UUID, INTEGER) FROM PUBLIC;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_draft_entries(UUID, INTEGER) TO authenticated;

-- Add NOT NULL constraint to user_id if not already present
DO $$ 
BEGIN
  ALTER TABLE medication_entries 
    ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE activity_entries 
    ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ... repeat for other entry tables 