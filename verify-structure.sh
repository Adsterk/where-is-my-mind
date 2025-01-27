#!/bin/bash

echo "Verifying src folder structure..."

# Required directories
declare -a directories=(
  "src/components/forms/trackers/activities"
  "src/components/forms/trackers/behaviors"
  "src/components/forms/trackers/medication"
  "src/components/forms/trackers/mood"
  "src/components/forms/trackers/skills"
  "src/components/forms/trackers/sleep"
  "src/components/forms/trackers/social"
  "src/components/forms/trackers/spirituality"
  "src/components/forms/entry"
)

# Required files
declare -a files=(
  "src/components/forms/index.ts"
  "src/components/forms/types.ts"
  "src/components/forms/entry/index.ts"
  "src/components/forms/entry/MoodEntryForm.tsx"
  "src/components/forms/trackers/index.ts"
)

# Check for backup folders
if [ -d "src/components/forms.backup.*" ]; then
  echo "❌ Found backup folder that should be removed"
fi

# Check directories
for dir in "${directories[@]}"; do
  if [ ! -d "$dir" ]; then
    echo "❌ Missing directory: $dir"
  else
    echo "✅ Found directory: $dir"
  fi
done

# Check files
for file in "${files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing file: $file"
  else
    echo "✅ Found file: $file"
  fi
done

# Check for duplicate MoodTracker implementations
mood_trackers=$(find src -name "MoodTracker.tsx" | wc -l)
if [ "$mood_trackers" -gt 1 ]; then
  echo "❌ Found multiple MoodTracker implementations"
  find src -name "MoodTracker.tsx"
fi

# Check for old MoodEntryForm locations
old_forms=$(find src/components/forms -path "*/mood/*MoodEntryForm.tsx" | wc -l)
if [ "$old_forms" -gt 0 ]; then
  echo "❌ Found MoodEntryForm in old location"
  find src/components/forms -path "*/mood/*MoodEntryForm.tsx"
fi 