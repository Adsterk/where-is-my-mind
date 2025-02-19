import type {
  MoodEntry,
  SleepEntry,
  TrackingItem,
  Medication,
  MedicationEntry,
  BehaviorEntry,
  SkillsEntry,
  SocialEntry,
  SelfCareEntry
} from '@/lib/types'

import type { Database } from '@/lib/supabase/types'

type Tables = Database['public']['Tables']

export interface MoodEntryFormProps {
  value: MoodEntry
  onUpdate: (data: MoodEntry) => void
  isEditing?: boolean
}

export interface SleepScoreProps {
  value: SleepEntry
  onUpdate: (data: SleepEntry) => void
  isEditing?: boolean
}

export interface MedicationTrackerProps {
  value: MedicationEntry
  onUpdate: (data: MedicationEntry) => void
  isEditing?: boolean
}

export interface BehaviorTrackerProps {
  value: BehaviorEntry
  onUpdate: (data: BehaviorEntry) => void
  isEditing?: boolean
}

export interface SkillsTrackerProps {
  value: SkillsEntry
  onUpdate: (data: SkillsEntry) => void
  isEditing?: boolean
}

export interface SocialTrackerProps {
  value: SocialEntry
  onUpdate: (data: SocialEntry) => void
  isEditing?: boolean
}

export interface SelfCareTrackerProps {
  value: SelfCareEntry
  onUpdate: (data: SelfCareEntry) => void
  isEditing?: boolean
}

export interface DailyEntryData extends Omit<Tables['daily_entries']['Insert'], 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  mood_entry: MoodEntry
  sleep_entry: SleepEntry
  medication_entry: MedicationEntry
  behavior_entry: BehaviorEntry
  skills_entry: SkillsEntry
  social_entry: SocialEntry
  self_care_entry: SelfCareEntry
}

export type SkillTrackingItem = Omit<TrackingItem, 'severity' | 'quality' | 'impact'>
export type SocialTrackingItem = Omit<TrackingItem, 'severity' | 'effectiveness' | 'impact'>
export type SelfCareTrackingItem = Omit<TrackingItem, 'severity' | 'effectiveness' | 'quality'>

// Re-export types needed by the components
export type {
  MoodEntry,
  SleepEntry,
  TrackingItem,
  Medication,
  MedicationEntry,
  BehaviorEntry,
  SkillsEntry,
  SocialEntry,
  SelfCareEntry
} 