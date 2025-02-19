-- Create custom roles
DO $$ 
BEGIN
  -- Create application roles if they don't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
    CREATE ROLE app_readonly;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
    CREATE ROLE app_admin;
  END IF;
END
$$;

-- Grant basic privileges to roles
GRANT USAGE ON SCHEMA public TO app_readonly, app_user, app_admin;
GRANT app_readonly TO app_user;
GRANT app_user TO app_admin;

-- Create function to automatically assign default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Create trigger for new user role assignment
DROP TRIGGER IF EXISTS assign_default_role ON auth.users;
CREATE TRIGGER assign_default_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Setup RLS for daily_entries table
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON daily_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own entries"
  ON daily_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own entries"
  ON daily_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own entries"
  ON daily_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create encryption functions for sensitive data
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT, context TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Get encryption key from environment or vault
  encryption_key := current_setting('app.encryption_key', true);
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;
  
  RETURN encode(
    encrypt(
      data::bytea,
      decode(encryption_key, 'hex'),
      'aes-gcm',
      context::bytea,
      '12'::integer
    ),
    'base64'
  );
END;
$$;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT, context TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  encryption_key TEXT;
  decrypted bytea;
BEGIN
  -- Get encryption key from environment or vault
  encryption_key := current_setting('app.encryption_key', true);
  
  IF encryption_key IS NULL THEN
    RAISE EXCEPTION 'Encryption key not found';
  END IF;
  
  decrypted := decrypt(
    decode(encrypted_data, 'base64'),
    decode(encryption_key, 'hex'),
    'aes-gcm',
    context::bytea,
    '12'::integer
  );
  
  RETURN convert_from(decrypted, 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Add encrypted columns to daily_entries
ALTER TABLE daily_entries
ADD COLUMN IF NOT EXISTS encrypted_notes TEXT,
ADD COLUMN IF NOT EXISTS encryption_context TEXT;

-- Create function to automatically encrypt notes
CREATE OR REPLACE FUNCTION encrypt_notes_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.notes IS NOT NULL THEN
    NEW.encryption_context := encode(gen_random_bytes(16), 'hex');
    NEW.encrypted_notes := encrypt_sensitive_data(NEW.notes, NEW.encryption_context);
    NEW.notes := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic encryption
CREATE TRIGGER encrypt_notes
  BEFORE INSERT OR UPDATE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_notes_trigger();

-- Create view for decrypted data
CREATE OR REPLACE VIEW daily_entries_decrypted AS
SELECT
  id,
  user_id,
  mood_score,
  is_bipolar,
  CASE
    WHEN encrypted_notes IS NOT NULL THEN
      decrypt_sensitive_data(encrypted_notes, encryption_context)
    ELSE
      NULL
  END as notes,
  tracking_data,
  date,
  created_at,
  updated_at
FROM daily_entries;

-- Grant appropriate permissions to roles
GRANT SELECT ON daily_entries_decrypted TO app_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_entries TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO app_admin; 