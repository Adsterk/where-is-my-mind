-- Migration: 20250129111025

-- Enable pg_cron extension if not exists
create extension if not exists "pg_cron" with schema extensions;

-- Grant usage to postgres
grant usage on schema cron to postgres;

-- Grant execute on all functions in schema cron to postgres
grant execute on all functions in schema cron to postgres;
