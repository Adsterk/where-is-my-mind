-- Create API scopes enum
CREATE TYPE api_scope AS ENUM (
  'read:entries',
  'write:entries',
  'read:settings',
  'write:settings',
  'read:stats',
  'export:data'
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes api_scope[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- Set up Row Level Security (RLS)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own API keys
CREATE POLICY "Allow users to view their own API keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only allow users to create API keys for themselves
CREATE POLICY "Allow users to create their own API keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only allow users to delete their own API keys
CREATE POLICY "Allow users to delete their own API keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to clean up expired API keys
CREATE OR REPLACE FUNCTION cleanup_expired_api_keys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete expired API keys
  DELETE FROM api_keys
  WHERE expires_at < NOW();
  
  -- Delete unused API keys (not used in 90 days)
  DELETE FROM api_keys
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    AND expires_at IS NULL;
END;
$$;

-- Create function to validate API key scopes
CREATE OR REPLACE FUNCTION validate_api_key_scopes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ensure at least one scope is specified
  IF array_length(NEW.scopes, 1) IS NULL THEN
    RAISE EXCEPTION 'API key must have at least one scope';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for scope validation
CREATE TRIGGER validate_api_key_scopes_trigger
  BEFORE INSERT OR UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION validate_api_key_scopes(); 