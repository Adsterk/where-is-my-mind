#!/bin/bash

echo "Verifying mood tracker structure..."

# Check for duplicate files
if [ -f "src/components/forms/mood/MoodEntryForm.tsx" ]; then
    echo "❌ Found duplicate MoodEntryForm in old location"
    echo "   Please remove src/components/forms/mood/MoodEntryForm.tsx"
fi

# Verify correct files exist
declare -a required_files=(
    "src/components/forms/entry/MoodEntryForm.tsx"
    "src/components/forms/entry/index.ts"
    "src/components/forms/trackers/mood/MoodTracker.tsx"
    "src/components/forms/trackers/mood/index.ts"
    "src/components/forms/trackers/mood/types.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing required file: $file"
    else
        echo "✅ Found $file"
    fi
done 