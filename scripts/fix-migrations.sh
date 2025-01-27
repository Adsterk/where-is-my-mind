#!/bin/bash

echo "Fixing migration history..."

# Revert old migrations
for migration in \
    20240116000001 20240116000002 20240116000003 20240116000004 \
    20250120000005 20250120000006 20250120000007 20250120000008 \
    20250120000009 20250120000010 20250120000011 20250120000012 \
    20250122175724
do
    echo "Reverting migration $migration..."
    supabase migration repair --status reverted $migration
done

# Apply new migrations
for migration in 20240123000001 20240123000002 20240123000003
do
    echo "Marking migration $migration as applied..."
    supabase migration repair --status applied $migration
done

echo "Resetting database..."
supabase db reset

echo "Migration fix complete!" 