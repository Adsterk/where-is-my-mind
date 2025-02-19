-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET NOT NULL,
  user_agent TEXT,
  details JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- Create a view for admins to easily query high severity events
CREATE OR REPLACE VIEW high_severity_audit_logs AS
SELECT *
FROM audit_logs
WHERE severity = 'high'
ORDER BY created_at DESC;

-- Set up Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view audit logs
CREATE POLICY "Allow admins to view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id
      FROM user_roles
      WHERE role = 'admin'
    )
  );

-- Only allow the system to insert audit logs
CREATE POLICY "Allow system to insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete logs older than 1 year, except high severity ones
  DELETE FROM audit_logs
  WHERE severity != 'high'
    AND created_at < NOW() - INTERVAL '1 year';
    
  -- Delete high severity logs older than 3 years
  DELETE FROM audit_logs
  WHERE severity = 'high'
    AND created_at < NOW() - INTERVAL '3 years';
END;
$$; 