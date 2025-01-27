import type { ReactNode } from 'react'
import type { 
  Medication, 
  MedicationEntry 
} from './trackers/medication/MedicationTracker'
import type { 
  Activity, 
  ActivityEntry 
} from './trackers/activities/ActivityTracker'
import type { 
  Behavior, 
  BehaviorEntry 
} from './trackers/behaviors/BehaviorTracker'
import type { 
  Skill, 
  SkillEntry 
} from './trackers/skills/SkillTracker'
import type { 
  SocialConnection, 
  SocialConnectionEntry 
} from './trackers/social/SocialConnectionTracker'
import type { 
  SpiritualPractice, 
  SpiritualPracticeEntry 
} from './trackers/spirituality/SpiritualityTracker'

export interface Section {
  id: string
  title: string
  component: ReactNode
  isVisible: boolean
}

export interface TrackerData<T, E> {
  items: T[]
  entries: E[]
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
  medications: TrackerData<Medication, MedicationEntry>
  activities: TrackerData<Activity, ActivityEntry>
  behaviors: TrackerData<Behavior, BehaviorEntry>
  skills: TrackerData<Skill, SkillEntry>
  socialConnections: TrackerData<SocialConnection, SocialConnectionEntry>
  spirituality: TrackerData<SpiritualPractice, SpiritualPracticeEntry>
}
