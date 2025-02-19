import type { Tables } from './database'

export type RatingValue = 'not helpful' | 'somewhat helpful' | 'very helpful'
export type SeverityValue = 'mild' | 'moderate' | 'severe'

export interface MoodEntry {
  mood_score: number
  is_bipolar_scale: boolean
  notes: string | null
}

export interface SleepEntry {
  sleep_hours: number
  notes: string | null
}

export interface TrackingItem {
  id: string
  name: string
  completed: boolean
  severity?: SeverityValue
  effectiveness?: RatingValue
  quality?: RatingValue
  impact?: RatingValue
}

export interface Medication extends Omit<TrackingItem, 'completed'> {
  completed: boolean
}

export interface MedicationEntry {
  medications: Medication[]
  notes: string | null
}

export interface BehaviorEntry {
  behaviors: TrackingItem[]
  notes: string | null
}

export interface SkillsEntry {
  skills: TrackingItem[]
  notes: string | null
}

export interface SocialEntry {
  activities: TrackingItem[]
  notes: string | null
}

export interface SelfCareEntry {
  activities: TrackingItem[]
  notes: string | null
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

// Helper types for entry operations
export type EntryWithType<T extends string, E> = E & { type: T }

export type TypedEntry = 
  | EntryWithType<'medication', MedicationEntry>
  | EntryWithType<'behavior', BehaviorEntry>
  | EntryWithType<'skill', SkillsEntry>
  | EntryWithType<'social', SocialEntry>
  | EntryWithType<'self-care', SelfCareEntry>

export type TypedMedicationEntry = EntryWithType<'medication', MedicationEntry>
export type TypedBehaviorEntry = EntryWithType<'behavior', BehaviorEntry>
export type TypedSkillEntry = EntryWithType<'skill', SkillsEntry>
export type TypedSocialEntry = EntryWithType<'social', SocialEntry>
export type TypedSelfCareEntry = EntryWithType<'self-care', SelfCareEntry> 