#!/bin/bash

# Create directories if they don't exist
mkdir -p supabase/migrations/archive

# List of files to keep in migrations folder
KEEP_FILES=(
    "20240123000001_consolidated_schema.sql"
    "20240123000002_mood_entries.sql"
    "20240123000003_entry_sections.sql"
    "README.md"
)

# Move all .sql files to archive except the ones we want to keep
cd supabase/migrations
for file in *.sql; do
    if [[ ! " ${KEEP_FILES[@]} " =~ " ${file} " ]]; then
        mv "$file" "archive/$file"
        echo "Moved $file to archive/"
    else
        echo "Kept $file in migrations/"
    fi
done

# Print summary
echo -e "\nMigration files organized:"
echo "Files in migrations/"
ls -1 .
echo -e "\nFiles in archive/"
ls -1 archive/

# Create or update README.md if it doesn't contain our documentation
if [ ! -f README.md ] || ! grep -q "Database Migrations" README.md; then
    cat > README.md << 'EOF'
# Database Migrations

## Migration History

### Pre-Consolidation (Archived)
Original migrations from January 2024 have been archived for reference. These included:
- Initial user preferences setup
- Form customization
- Notification settings
- Auth improvements
- Form section handling

### Post-Consolidation (Current)
The schema was consolidated on January 23, 2024 into three main migrations:

1. `20240123000001_consolidated_schema.sql`
   - Core user profile
   - User preferences
   - Form section preferences
   - All RLS policies and indexes

2. `20240123000002_mood_entries.sql`
   - Mood entry core functionality
   - Basic entry structure

3. `20240123000003_entry_sections.sql`
   - Section-specific tables
   - Related triggers and policies

## Schema Changes
Major changes during consolidation:
- Unified theme management in user_preferences
- Streamlined form section handling
- Improved RLS policies
- Added proper indexing
EOF
    echo "Created/Updated README.md"
fi 