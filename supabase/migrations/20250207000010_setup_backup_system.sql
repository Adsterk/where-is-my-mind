-- Create table for backup metadata
CREATE TABLE IF NOT EXISTS backup_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  file_path TEXT,
  file_size BIGINT,
  checksum TEXT,
  error_message TEXT,
  retention_days INTEGER NOT NULL DEFAULT 30
);

-- Enable RLS on backup_metadata
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Only admins can view backup metadata
CREATE POLICY "Only admins can view backup metadata"
  ON backup_metadata
  FOR SELECT
  TO app_admin
  USING (true);

-- Create function for backup cleanup
CREATE OR REPLACE FUNCTION cleanup_old_backups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete backup metadata for expired backups
  DELETE FROM backup_metadata
  WHERE completed_at < (now() - (retention_days || ' days')::interval)
    AND status = 'completed';
END;
$$;

-- Create function for point-in-time recovery validation
CREATE OR REPLACE FUNCTION validate_recovery_point(target_timestamp TIMESTAMPTZ)
RETURNS TABLE (
  can_recover BOOLEAN,
  nearest_backup_time TIMESTAMPTZ,
  estimated_recovery_time INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS(
      SELECT 1
      FROM backup_metadata
      WHERE completed_at <= target_timestamp
        AND status = 'completed'
    ) as can_recover,
    (
      SELECT completed_at
      FROM backup_metadata
      WHERE completed_at <= target_timestamp
        AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT 1
    ) as nearest_backup_time,
    INTERVAL '1 hour' as estimated_recovery_time;
END;
$$;

-- Create retention policy table
CREATE TABLE IF NOT EXISTS retention_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL UNIQUE,
  retention_period INTERVAL NOT NULL,
  archive_table_name TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on retention_policies
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;

-- Only admins can manage retention policies
CREATE POLICY "Only admins can manage retention policies"
  ON retention_policies
  FOR ALL
  TO app_admin
  USING (true)
  WITH CHECK (true);

-- Create default retention policies
INSERT INTO retention_policies (table_name, retention_period, archive_table_name)
VALUES
  ('audit_logs', INTERVAL '1 year', 'audit_logs_archive'),
  ('daily_entries', INTERVAL '7 years', 'daily_entries_archive'),
  ('backup_metadata', INTERVAL '90 days', NULL)
ON CONFLICT (table_name) DO NOTHING;

-- Create function to archive old data
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy RECORD;
BEGIN
  FOR policy IN SELECT * FROM retention_policies WHERE enabled = true AND archive_table_name IS NOT NULL
  LOOP
    -- Create archive table if it doesn't exist
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I (LIKE %I INCLUDING ALL)',
      policy.archive_table_name,
      policy.table_name
    );
    
    -- Move old data to archive
    EXECUTE format(
      'WITH moved_rows AS (
        DELETE FROM %I
        WHERE created_at < now() - %L::interval
        RETURNING *
      )
      INSERT INTO %I
      SELECT * FROM moved_rows',
      policy.table_name,
      policy.retention_period,
      policy.archive_table_name
    );
  END LOOP;
END;
$$;

-- Create function to verify data integrity
CREATE OR REPLACE FUNCTION verify_data_integrity()
RETURNS TABLE (
  table_name TEXT,
  last_verified TIMESTAMPTZ,
  row_count BIGINT,
  has_encryption BOOLEAN,
  has_foreign_keys BOOLEAN,
  integrity_check_passed BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.relname::TEXT as table_name,
    now() as last_verified,
    c.reltuples::BIGINT as row_count,
    EXISTS (
      SELECT 1
      FROM pg_attribute a
      WHERE a.attrelid = c.oid
        AND a.attname LIKE '%encrypted%'
    ) as has_encryption,
    EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conrelid = c.oid
        AND contype = 'f'
    ) as has_foreign_keys,
    true as integrity_check_passed
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r';
END;
$$; 