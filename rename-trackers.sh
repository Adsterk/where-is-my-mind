#!/bin/bash

# Rename files for consistency
mv src/components/forms/trackers/skills/SkillsTracker.tsx src/components/forms/trackers/skills/SkillTracker.tsx 2>/dev/null || true
mv src/components/forms/trackers/social/SocialConnectionsTracker.tsx src/components/forms/trackers/social/SocialConnectionTracker.tsx 2>/dev/null || true

# Remove old files
rm src/components/forms/trackers/behaviors/ProblematicBehaviorTracker.tsx 2>/dev/null || true
rm src/components/forms/trackers/mood/MoodAndNotesTracker.tsx 2>/dev/null || true

# Run verifications
./verify-exports.sh
./fix-imports.sh 