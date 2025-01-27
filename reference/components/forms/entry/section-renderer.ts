import React from 'react'
import type { SectionId, TrackerSectionId, SectionEntryMap } from '@/types/forms'
import type { Section } from '@/components/forms/types'
import {
  MedicationTrackerWithErrorBoundary,
  ActivityTracker,
  BehaviorTracker,
  SkillTracker,
  SocialConnectionTracker,
  SpiritualityTracker
} from '@/components/forms/trackers'
import type {
  Medication,
  Activity,
  Behavior,
  Skill,
  SocialConnection,
  SpiritualPractice,
  TypedMedicationEntry,
  TypedActivityEntry,
  TypedBehaviorEntry,
  TypedSkillEntry,
  TypedSocialEntry,
  TypedSpiritualityEntry
} from '@/components/forms/trackers'

// Create a discriminated union for section types
type TrackerSectionType = {
  medications: {
    type: 'medications'
    items: Medication[]
    entries: TypedMedicationEntry[]
  }
  activities: {
    type: 'activities'
    items: Activity[]
    entries: TypedActivityEntry[]
  }
  behaviors: {
    type: 'behaviors'
    items: Behavior[]
    entries: TypedBehaviorEntry[]
  }
  skills: {
    type: 'skills'
    items: Skill[]
    entries: TypedSkillEntry[]
  }
  socialConnections: {
    type: 'socialConnections'
    items: SocialConnection[]
    entries: TypedSocialEntry[]
  }
  spirituality: {
    type: 'spirituality'
    items: SpiritualPractice[]
    entries: TypedSpiritualityEntry[]
  }
}

// Define base props that all trackers share
interface BaseTrackerProps {
  isEditing?: boolean
  onDeleteItem?: (itemId: string) => void
}

// Define specific props for each tracker type
type TrackerProps<T extends TrackerSectionId> = BaseTrackerProps & {
  items: any[]
  entries: SectionEntryMap[T]
  onUpdate: (items: any[], entries: SectionEntryMap[T]) => void
}

// Map tracker types to their components
const trackerComponents = {
  medications: MedicationTrackerWithErrorBoundary,
  activities: ActivityTracker,
  behaviors: BehaviorTracker,
  skills: SkillTracker,
  socialConnections: SocialConnectionTracker,
  spirituality: SpiritualityTracker
} as const

const sectionTitles: Record<TrackerSectionId, string> = {
  medications: 'Medications',
  activities: 'Activities',
  behaviors: 'Behaviors',
  skills: 'Skills',
  socialConnections: 'Social Connections',
  spirituality: 'Spirituality'
}

export function createTrackerSection<T extends TrackerSectionId>(
  sectionId: T,
  props: TrackerProps<T>
): Section {
  const Component = trackerComponents[sectionId]
  
  return {
    id: sectionId,
    title: getTitleForType(sectionId),
    component: React.createElement(Component as React.ComponentType<TrackerProps<T>>, props),
    isVisible: true
  }
}

function getTitleForType(type: TrackerSectionId): string {
  const titles: Record<TrackerSectionId, string> = {
    medications: 'Medications',
    activities: 'Activities',
    behaviors: 'Behaviors',
    skills: 'Skills',
    socialConnections: 'Social Connections',
    spirituality: 'Spirituality'
  }
  return titles[type]
} 