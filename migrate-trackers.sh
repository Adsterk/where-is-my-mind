#!/bin/bash

# Create base directories
mkdir -p src/components/forms/trackers/{activities,behaviors,medication,mood,skills,sleep,social,spirituality}

# Function to create tracker structure
create_tracker_structure() {
    local name=$1
    local pascal_name=$2
    local dir="src/components/forms/trackers/$name"

    # Create types file
    cat > "$dir/types.ts" << EOL
export interface ${pascal_name} {
  id: string
  name: string
  is_custom: boolean
}

export interface ${pascal_name}Entry {
  ${name}_id: string
  // Add specific fields here
}
EOL

    # Create index file
    cat > "$dir/index.ts" << EOL
export { ${pascal_name}Tracker } from './${pascal_name}Tracker'
export type { ${pascal_name}, ${pascal_name}Entry } from './types'
EOL

    # Move tracker file if it exists
    if [ -f "src/components/forms/$name/${pascal_name}Tracker.tsx" ]; then
        mv "src/components/forms/$name/${pascal_name}Tracker.tsx" "$dir/"
    fi
}

# Create structures for each tracker
create_tracker_structure "activities" "Activity"
create_tracker_structure "behaviors" "Behavior"
create_tracker_structure "medication" "Medication"
create_tracker_structure "mood" "Mood"
create_tracker_structure "skills" "Skill"
create_tracker_structure "sleep" "Sleep"
create_tracker_structure "social" "SocialConnection"
create_tracker_structure "spirituality" "SpiritualPractice"

# Create main trackers index file
cat > src/components/forms/trackers/index.ts << EOL
// Export all trackers
export { ActivityTracker } from './activities'
export { BehaviorTracker } from './behaviors'
export { MedicationTracker } from './medication'
export { MoodAndNotesTracker } from './mood'
export { SkillsTracker } from './skills'
export { SleepTracker } from './sleep'
export { SocialConnectionTracker } from './social'
export { SpiritualityTracker } from './spirituality'

// Export all types
export type {
  Activity,
  ActivityEntry
} from './activities'

export type {
  Behavior,
  BehaviorEntry
} from './behaviors'

export type {
  Medication,
  MedicationEntry
} from './medication'

export type {
  Skill,
  SkillEntry
} from './skills'

export type {
  SocialConnection,
  SocialConnectionEntry
} from './social'

export type {
  SpiritualPractice,
  SpiritualPracticeEntry
} from './spirituality'
EOL

# Update main forms index
cat > src/components/forms/index.ts << EOL
export * from './trackers'
export * from './entry'
export type * from './types'
EOL

# Create forms types file
cat > src/components/forms/types.ts << EOL
import type { ReactNode } from 'react'
import type { TrackerProps } from '@/types/forms'

export interface Section {
  id: string
  title: string
  component: ReactNode
  isVisible: boolean
}

export interface FormData {
  moodAndNotes: {
    mood_score: number
    notes: string | null
    is_bipolar_scale: boolean
  }
  sleep: {
    sleep_hours: number
    sleep_quality: number | null
  }
  medications: {
    items: Array<{
      id: string
      name: string
      dosage: string
    }>
    entries: Array<{
      medication_id: string
      time_taken: string
      notes?: string
      side_effects?: string
    }>
  }
  // ... other section types
}

export type { TrackerProps }
EOL

# Clean up old files
rm -rf src/components/forms/[type]
