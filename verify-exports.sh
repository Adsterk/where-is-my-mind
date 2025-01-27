#!/bin/bash

echo "Verifying tracker exports..."

# Check for correct component names
declare -a expected_trackers=(
  "ActivityTracker:activities"
  "BehaviorTracker:behaviors"
  "MedicationTracker:medication"
  "MoodTracker:mood"
  "SkillTracker:skills"
  "SleepTracker:sleep"
  "SocialConnectionTracker:social"
  "SpiritualityTracker:spirituality"
)

# Verify each tracker
for pair in "${expected_trackers[@]}"; do
  IFS=":" read -r tracker dir <<< "$pair"
  file="src/components/forms/trackers/$dir/${tracker}.tsx"
  
  if [ ! -f "$file" ]; then
    echo "❌ Missing tracker file: $file"
  else
    if ! grep -q "export function $tracker" "$file"; then
      echo "❌ Missing or incorrect export in $file"
    else
      echo "✅ Verified $tracker"
    fi
  fi
done

# Verify index exports
index_file="src/components/forms/trackers/index.ts"
for pair in "${expected_trackers[@]}"; do
  IFS=":" read -r tracker dir <<< "$pair"
  if ! grep -q "export { $tracker } from './$dir'" "$index_file"; then
    echo "❌ Missing export for $tracker in index.ts"
  fi
done

echo "Verification complete!" 