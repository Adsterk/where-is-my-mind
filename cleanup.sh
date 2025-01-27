#!/bin/bash

# Remove backup folder
rm -rf src/components/forms.backup.*

# Remove any duplicate tracker files
find src/components/forms -path "*/mood/*MoodTracker.tsx" ! -path "*/trackers/mood/*" -delete
find src/components/forms -path "*/behaviors/*ProblematicBehaviorTracker.tsx" -delete
find src/components/forms -path "*/mood/*MoodAndNotesTracker.tsx" -delete

# Rename files for consistency
mv src/components/forms/trackers/skills/SkillsTracker.tsx src/components/forms/trackers/skills/SkillTracker.tsx 2>/dev/null || true
mv src/components/forms/trackers/social/SocialConnectionsTracker.tsx src/components/forms/trackers/social/SocialConnectionTracker.tsx 2>/dev/null || true

# Fix imports - Modified to work on macOS and Linux
for file in src/components/forms/trackers/*/*.tsx; do
  if [ -f "$file" ]; then
    # Create a temporary file
    tmp_file=$(mktemp)
    
    # Apply all replacements to the temporary file
    sed \
      -e 's|import { Button } from "@/components/ui/button"|import { Button } from "@/components/ui"|g' \
      -e 's|import { Input } from "@/components/ui/input"|import { Input } from "@/components/ui"|g' \
      -e 's|import { Label } from "@/components/ui/label"|import { Label } from "@/components/ui"|g' \
      -e 's|import { Card, CardContent } from "@/components/ui/card"|import { Card, CardContent } from "@/components/ui"|g' \
      -e 's|import { useFormEdit } from "@/components/providers/FormEditContext"|import { useFormEdit } from "@/components/providers"|g' \
      -e 's|import { useToast } from "@/hooks/use-toast"|import { useToast } from "@/hooks"|g' \
      "$file" > "$tmp_file"
    
    # Move the temporary file back to the original
    mv "$tmp_file" "$file"
  fi
done

# Run verifications
./verify-exports.sh 