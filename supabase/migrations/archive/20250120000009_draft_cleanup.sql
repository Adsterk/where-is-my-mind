-- Create a function to clean up old draft entries
CREATE OR REPLACE FUNCTION cleanup_old_draft_entries()
RETURNS void AS $$
BEGIN
  -- Delete draft entries older than 24 hours
  DELETE FROM medication_entries 
  WHERE is_draft = true 
  AND created_at < NOW() - INTERVAL '24 hours';

  DELETE FROM activity_entries 
  WHERE is_draft = true 
  AND created_at < NOW() - INTERVAL '24 hours';

  -- Similar statements for other entry tables...
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup daily
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-draft-entries',  -- unique job name
  '0 0 * * *',            -- run at midnight every day
  $$SELECT cleanup_old_draft_entries()$$
); 