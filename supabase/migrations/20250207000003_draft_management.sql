-- Migration: 20250129110305_draft_management

-- Create draft management functions schema
create schema if not exists app_utils;

-- Grant necessary permissions
grant usage on schema app_utils to postgres;
grant all privileges on all tables in schema app_utils to postgres;
grant execute on all functions in schema app_utils to postgres;
