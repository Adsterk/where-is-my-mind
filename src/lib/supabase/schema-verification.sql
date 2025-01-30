-- Schema Verification Script

-- First, create the table_exists function
CREATE OR REPLACE FUNCTION table_exists(p_table_name text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Then create the schema verification function
CREATE OR REPLACE FUNCTION verify_table_schema(
  p_table_name text,
  expected_columns text[]
) RETURNS text[] AS $$
DECLARE
  missing_columns text[];
  incorrect_types text[];
  existing_columns text[];
  column_info record;
  result text[];
BEGIN
  -- Get existing columns with their types
  WITH column_details AS (
    SELECT 
      column_name,
      data_type,
      column_default,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
  )
  SELECT array_agg(column_name::text)
  INTO existing_columns
  FROM column_details;

  -- Check if table exists
  IF existing_columns IS NULL THEN
    result := array_append(result, format('❌ Table %s does not exist', p_table_name));
    RETURN result;
  END IF;

  -- Find missing columns
  SELECT array_agg(col)
  INTO missing_columns
  FROM unnest(expected_columns) col
  WHERE col NOT IN (SELECT unnest(existing_columns));

  -- Check column types and constraints
  FOR column_info IN (
    SELECT 
      column_name,
      data_type,
      column_default,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = p_table_name
  ) LOOP
    -- Add specific type checks based on column names
    CASE column_info.column_name
      WHEN 'id' THEN
        IF column_info.data_type != 'uuid' THEN
          result := array_append(result, format('❌ Column %I.%I should be type uuid but is %s', 
            p_table_name, column_info.column_name, column_info.data_type));
        END IF;
      WHEN 'created_at' THEN
        IF column_info.data_type != 'timestamp with time zone' THEN
          result := array_append(result, format('❌ Column %I.%I should be type timestamp with time zone but is %s', 
            p_table_name, column_info.column_name, column_info.data_type));
        END IF;
      WHEN 'updated_at' THEN
        IF column_info.data_type != 'timestamp with time zone' THEN
          result := array_append(result, format('❌ Column %I.%I should be type timestamp with time zone but is %s', 
            p_table_name, column_info.column_name, column_info.data_type));
        END IF;
      WHEN 'user_id' THEN
        IF column_info.data_type != 'uuid' THEN
          result := array_append(result, format('❌ Column %I.%I should be type uuid but is %s', 
            p_table_name, column_info.column_name, column_info.data_type));
        END IF;
      WHEN 'section_id' THEN
        IF column_info.data_type != 'uuid' THEN
          result := array_append(result, format('❌ Column %I.%I should be type uuid but is %s', 
            p_table_name, column_info.column_name, column_info.data_type));
        END IF;
      ELSE
        NULL;
    END CASE;
  END LOOP;

  -- Build result message for missing columns
  IF missing_columns IS NOT NULL THEN
    result := array_append(result, format('❌ Table %s is missing columns: %s', 
      p_table_name, array_to_string(missing_columns, ', ')));
  ELSE
    result := array_append(result, format('✅ Table %s has all required columns', p_table_name));
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create the RLS verification function
CREATE OR REPLACE FUNCTION verify_rls(p_table_name text) RETURNS text AS $$
DECLARE
  is_rls_enabled boolean;
BEGIN
  IF NOT table_exists(p_table_name) THEN
    RETURN format('❌ Table %s does not exist', p_table_name);
  END IF;

  SELECT relrowsecurity
  INTO is_rls_enabled
  FROM pg_class
  WHERE oid = (quote_ident(p_table_name)::regclass)
    AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

  IF is_rls_enabled THEN
    RETURN format('✅ RLS is enabled on %s', p_table_name);
  ELSE
    RETURN format('❌ RLS is NOT enabled on %s', p_table_name);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the policy verification function
CREATE OR REPLACE FUNCTION verify_policies(p_table_name text) RETURNS text[] AS $$
DECLARE
  result text[];
  policy_record record;
BEGIN
  IF NOT table_exists(p_table_name) THEN
    result := array_append(result, format('❌ Table %s does not exist', p_table_name));
    RETURN result;
  END IF;

  FOR policy_record IN (
    SELECT 
      polname as policy_name,
      polcmd as command,
      CASE 
        WHEN polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
      END as permissive,
      pg_get_expr(polqual, polrelid) as using_expr,
      pg_get_expr(polwithcheck, polrelid) as with_check_expr
    FROM pg_policy
    WHERE polrelid = (quote_ident(p_table_name)::regclass)
  ) LOOP
    result := array_append(result, format(
      '✅ Policy on %s: %s (%s, %s) USING: %s WITH CHECK: %s',
      p_table_name,
      policy_record.policy_name,
      policy_record.command,
      policy_record.permissive,
      COALESCE(policy_record.using_expr, 'NULL'),
      COALESCE(policy_record.with_check_expr, 'NULL')
    ));
  END LOOP;

  IF array_length(result, 1) IS NULL THEN
    result := array_append(result, format('❌ %s has no policies', p_table_name));
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create the foreign key verification function
CREATE OR REPLACE FUNCTION verify_foreign_keys(p_table_name text) RETURNS text[] AS $$
DECLARE
  result text[];
  fk_record record;
BEGIN
  IF NOT table_exists(p_table_name) THEN
    result := array_append(result, format('❌ Table %s does not exist', p_table_name));
    RETURN result;
  END IF;

  FOR fk_record IN (
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = p_table_name
  ) LOOP
    result := array_append(result, format(
      '✅ Foreign Key on %s: %s references %s(%s)',
      p_table_name,
      fk_record.column_name,
      fk_record.foreign_table_name,
      fk_record.foreign_column_name
    ));
  END LOOP;

  IF array_length(result, 1) IS NULL THEN
    result := array_append(result, format('ℹ️ %s has no foreign keys', p_table_name));
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Run the verification
DO $$ 
DECLARE
  verification_results text[];
  tables_to_check text[] := ARRAY['user_preferences', 'form_sections', 'user_sections', 'tracking_items', 'daily_entries'];
  table_name text;
BEGIN
  -- First, check if all tables exist
  FOREACH table_name IN ARRAY tables_to_check
  LOOP
    IF NOT table_exists(table_name) THEN
      verification_results := array_append(verification_results, format('❌ Table %s does not exist', table_name));
    ELSE
      verification_results := array_append(verification_results, format('✅ Table %s exists', table_name));
    END IF;
  END LOOP;
  verification_results := array_append(verification_results, '');

  -- Now proceed with detailed checks for each table
  IF table_exists('user_preferences') THEN
    SELECT array_cat(verification_results, verify_table_schema(
      'user_preferences',
      ARRAY[
        'id',
        'theme_preference',
        'language',
        'timezone',
        'form_layout',
        'created_at',
        'updated_at'
      ]
    )) INTO verification_results;
    
    SELECT array_append(verification_results, verify_rls('user_preferences')) INTO verification_results;
    SELECT array_cat(verification_results, verify_policies('user_preferences')) INTO verification_results;
    SELECT array_cat(verification_results, verify_foreign_keys('user_preferences')) INTO verification_results;
  END IF;
  verification_results := array_append(verification_results, '');

  IF table_exists('form_sections') THEN
    SELECT array_cat(verification_results, verify_table_schema(
      'form_sections',
      ARRAY[
        'id',
        'name',
        'type',
        'default_order',
        'is_required',
        'created_at'
      ]
    )) INTO verification_results;
    
    SELECT array_cat(verification_results, verify_foreign_keys('form_sections')) INTO verification_results;
  END IF;
  verification_results := array_append(verification_results, '');

  IF table_exists('user_sections') THEN
    SELECT array_cat(verification_results, verify_table_schema(
      'user_sections',
      ARRAY[
        'id',
        'user_id',
        'section_id',
        'display_order',
        'is_visible'
      ]
    )) INTO verification_results;
    
    SELECT array_append(verification_results, verify_rls('user_sections')) INTO verification_results;
    SELECT array_cat(verification_results, verify_policies('user_sections')) INTO verification_results;
    SELECT array_cat(verification_results, verify_foreign_keys('user_sections')) INTO verification_results;
  END IF;
  verification_results := array_append(verification_results, '');

  IF table_exists('tracking_items') THEN
    SELECT array_cat(verification_results, verify_table_schema(
      'tracking_items',
      ARRAY[
        'id',
        'user_id',
        'section_id',
        'name',
        'is_active',
        'display_order',
        'created_at',
        'updated_at'
      ]
    )) INTO verification_results;
    
    SELECT array_append(verification_results, verify_rls('tracking_items')) INTO verification_results;
    SELECT array_cat(verification_results, verify_policies('tracking_items')) INTO verification_results;
    SELECT array_cat(verification_results, verify_foreign_keys('tracking_items')) INTO verification_results;
  END IF;
  verification_results := array_append(verification_results, '');

  IF table_exists('daily_entries') THEN
    SELECT array_cat(verification_results, verify_table_schema(
      'daily_entries',
      ARRAY[
        'id',
        'user_id',
        'date',
        'mood_score',
        'is_bipolar',
        'sleep_hours',
        'tracking_data',
        'created_at',
        'updated_at'
      ]
    )) INTO verification_results;
    
    SELECT array_append(verification_results, verify_rls('daily_entries')) INTO verification_results;
    SELECT array_cat(verification_results, verify_policies('daily_entries')) INTO verification_results;
    SELECT array_cat(verification_results, verify_foreign_keys('daily_entries')) INTO verification_results;

    SELECT array_append(verification_results, (
      SELECT CASE 
        WHEN EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'daily_entries' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name LIKE '%user_id%date%'
        ) THEN '✅ daily_entries has unique constraint on user_id and date'
        ELSE '❌ daily_entries missing unique constraint on user_id and date'
      END
    )) INTO verification_results;
  END IF;

  RAISE NOTICE E'Schema Verification Results:\n%', array_to_string(verification_results, E'\n');
END $$; 