-- Create password_history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Only allow system to insert password history
CREATE POLICY "Allow system to insert password history"
  ON password_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only allow users to view their own password history
CREATE POLICY "Allow users to view their own password history"
  ON password_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to clean up old password history
CREATE OR REPLACE FUNCTION cleanup_old_password_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Keep only the last 5 passwords per user
  DELETE FROM password_history ph
  WHERE ph.id NOT IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (
               PARTITION BY user_id
               ORDER BY created_at DESC
             ) as rn
      FROM password_history
    ) ranked
    WHERE ranked.rn <= 5
  );
END;
$$; 