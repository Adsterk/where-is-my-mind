import type { ReactNode } from 'react'
import type {
  TypedMedicationEntry,
  TypedActivityEntry,
  TypedBehaviorEntry,
  TypedSkillEntry,
  TypedSocialEntry,
  TypedSpiritualityEntry
} from '@/components/forms/trackers'

export const trackerSectionIds = {
  medications: true,
  activities: true,
  behaviors: true,
  skills: true,
  socialConnections: true,
  spirituality: true
} as const

export type TrackerSectionId = keyof typeof trackerSectionIds
export type NonTrackerSectionId = 'mood' | 'sleep'
export type SectionId = TrackerSectionId | NonTrackerSectionId

export type EntryTypeMap = {
  medications: 'medication'
  activities: 'activity'
  behaviors: 'behavior'
  skills: 'skill'
  socialConnections: 'social'
  spirituality: 'spirituality'
}

export type SectionEntryMap = {
  medications: TypedMedicationEntry[]
  activities: TypedActivityEntry[]
  behaviors: TypedBehaviorEntry[]
  skills: TypedSkillEntry[]
  socialConnections: TypedSocialEntry[]
  spirituality: TypedSpiritualityEntry[]
}

export type FormData = {
  moodAndNotes: {
    mood_score: number
    notes: string | null
    is_bipolar_scale: boolean
  }
  sleep: {
    sleep_hours: number
    sleep_quality: number | null
  }
} & {
  [K in TrackerSectionId]: {
    items: any[]
    entries: SectionEntryMap[K]
  }
}

export interface TrackerProps<T, E> {
  items: T[]
  entries: E[]
  onUpdate: (items: T[], entries: E[]) => void
  onNewItem?: (item: Omit<T, 'id'>) => void
} 