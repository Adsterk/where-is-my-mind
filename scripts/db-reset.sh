#!/bin/bash

echo "Stopping any running Supabase services..."
supabase stop

echo "Cleaning up any existing data..."
rm -rf supabase/migrations/.temp/* 2>/dev/null
rm -rf supabase/seed/.temp/* 2>/dev/null

echo "Starting Supabase services..."
supabase start

echo "Resetting database..."
supabase db reset

echo "Database reset complete!" 