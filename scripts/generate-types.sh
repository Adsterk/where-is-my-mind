#!/bin/bash

echo "Generating Supabase types..."
npx supabase gen types typescript --project-id "your-project-id" --schema public > types/supabase.ts 