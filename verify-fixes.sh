#!/bin/bash

echo "Verifying fixes..."

# Check validation functions
if ! grep -q "validateMoodScore" src/lib/validation.ts; then
  echo "❌ Missing validateMoodScore function"
fi

# Check provider exports
if ! grep -q "export { useSupabase }" src/components/providers/index.ts; then
  echo "❌ Missing useSupabase export"
else
  echo "✅ Found useSupabase export"
fi

# Check tracker imports
if ! grep -q "import.*MoodTracker.*from '../trackers'" src/components/forms/entry/MoodEntryForm.tsx; then
  echo "❌ Incorrect MoodTracker import"
else
  echo "✅ Found correct MoodTracker import"
fi

# Check UI component imports
if grep -q "@/components/ui/button" src/components/forms/trackers/*/*.tsx; then
  echo "❌ Found old UI component imports"
else
  echo "✅ UI component imports are correct"
fi

echo "Verification complete!" 