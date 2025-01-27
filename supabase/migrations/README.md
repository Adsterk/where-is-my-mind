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