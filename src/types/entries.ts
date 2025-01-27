import type { 
  MedicationEntry,
  ActivityEntry,
  BehaviorEntry,
  SkillEntry,
  SocialConnectionEntry,
  SpiritualPracticeEntry 
} from '@/components/forms/trackers'

export type EntryWithType<T extends string, E> = E & { type: T }

export type TypedEntry = 
  | EntryWithType<'medication', MedicationEntry>
  | EntryWithType<'activity', ActivityEntry>
  | EntryWithType<'behavior', BehaviorEntry>
  | EntryWithType<'skill', SkillEntry>
  | EntryWithType<'social', SocialConnectionEntry>
  | EntryWithType<'spirituality', SpiritualPracticeEntry>

export type TypedMedicationEntry = EntryWithType<'medication', MedicationEntry>
export type TypedActivityEntry = EntryWithType<'activity', ActivityEntry>
export type TypedBehaviorEntry = EntryWithType<'behavior', BehaviorEntry>
export type TypedSkillEntry = EntryWithType<'skill', SkillEntry>
export type TypedSocialEntry = EntryWithType<'social', SocialConnectionEntry>
export type TypedSpiritualityEntry = EntryWithType<'spirituality', SpiritualPracticeEntry>

export const getEntryId = (entry: TypedEntry): string => {
  switch (entry.type) {
    case 'medication':
      return entry.medication_id
    case 'activity':
      return entry.activities_id
    case 'behavior':
      return entry.behaviors_id
    case 'skill':
      return entry.skills_id
    case 'social':
      return entry.social_id
    case 'spirituality':
      return entry.spirituality_id
  }
} 