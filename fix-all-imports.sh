#!/bin/bash

# Fix provider imports
for file in $(find src -type f -name "*.tsx"); do
  if [ -f "$file" ]; then
    # Create a temporary file
    tmp_file=$(mktemp)
    
    # Apply all replacements to the temporary file
    sed \
      -e 's|@/components/providers/FormEditContext|@/components/providers|g' \
      -e 's|@/components/providers/SupabaseProvider|@/components/providers|g' \
      -e 's|@/components/forms/mood/MoodEntryForm|@/components/forms/entry/MoodEntryForm|g' \
      -e 's|@/components/forms/mood/MoodAndNotesTracker|@/components/forms/trackers/mood/MoodTracker|g' \
      -e 's|@/components/forms/sleep/SleepTracker|@/components/forms/trackers/sleep/SleepTracker|g' \
      "$file" > "$tmp_file"
    
    # Move the temporary file back to the original
    mv "$tmp_file" "$file"
  fi
done

# Fix test imports
mkdir -p src/tests/components/forms/specs
touch src/tests/components/forms/specs/.gitkeep

# Fix type exports
cat > src/types/index.ts << EOL
export * from './auth.types'
export * from './api.types'
EOL 