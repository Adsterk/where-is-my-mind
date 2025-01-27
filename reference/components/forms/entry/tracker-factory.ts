import React from 'react'
import type { Section } from '@/components/forms/types'
import {
  MedicationTrackerWithErrorBoundary,
  ActivityTracker,
  BehaviorTracker,
  SkillTracker,
  SocialConnectionTracker,
  SpiritualityTracker,
  type TypedMedicationEntry,
  type TypedActivityEntry,
  type TypedBehaviorEntry,
  type TypedSkillEntry,
  type TypedSocialEntry,
  type TypedSpiritualityEntry
} from '@/components/forms/trackers'

// Define the configuration type
type TrackerConfig = {
  medications: {
    component: typeof MedicationTrackerWithErrorBoundary
    entryType: TypedMedicationEntry[]
  }
  activities: {
    component: typeof ActivityTracker
    entryType: TypedActivityEntry[]
  }
  behaviors: {
    component: typeof BehaviorTracker
    entryType: TypedBehaviorEntry[]
  }
  skills: {
    component: typeof SkillTracker
    entryType: TypedSkillEntry[]
  }
  socialConnections: {
    component: typeof SocialConnectionTracker
    entryType: TypedSocialEntry[]
  }
  spirituality: {
    component: typeof SpiritualityTracker
    entryType: TypedSpiritualityEntry[]
  }
}

const trackerConfig: TrackerConfig = {
  medications: {
    component: MedicationTrackerWithErrorBoundary,
    entryType: [] as TypedMedicationEntry[]
  },
  activities: {
    component: ActivityTracker,
    entryType: [] as TypedActivityEntry[]
  },
  behaviors: {
    component: BehaviorTracker,
    entryType: [] as TypedBehaviorEntry[]
  },
  skills: {
    component: SkillTracker,
    entryType: [] as TypedSkillEntry[]
  },
  socialConnections: {
    component: SocialConnectionTracker,
    entryType: [] as TypedSocialEntry[]
  },
  spirituality: {
    component: SpiritualityTracker,
    entryType: [] as TypedSpiritualityEntry[]
  }
} as const

type TrackerKey = keyof typeof trackerConfig

interface CreateTrackerProps<T extends TrackerKey> {
  items: any[]
  entries: typeof trackerConfig[T]['entryType']
  onUpdate: (items: any[], entries: typeof trackerConfig[T]['entryType']) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}

export function createTracker<T extends TrackerKey>(
  type: T,
  props: CreateTrackerProps<T>
): Section {
  const config = trackerConfig[type]
  const Component = config.component
  const typedEntries = getTypedEntries(props.entries, type)

  return {
    id: type,
    title: getTitleForType(type),
    component: React.createElement(Component as React.ComponentType<any>, {
      ...props,
      entries: typedEntries
    }),
    isVisible: true
  }
}

function getTitleForType(type: TrackerKey): string {
  const titles: Record<TrackerKey, string> = {
    medications: 'Medications',
    activities: 'Activities',
    behaviors: 'Behaviors',
    skills: 'Skills',
    socialConnections: 'Social Connections',
    spirituality: 'Spirituality'
  }
  return titles[type]
}

function getTypedEntries<T extends TrackerKey>(
  entries: any[],
  type: T
): typeof trackerConfig[T]['entryType'] {
  const typeMap = {
    medications: 'medication',
    activities: 'activity',
    behaviors: 'behavior',
    skills: 'skill',
    socialConnections: 'social',
    spirituality: 'spirituality'
  } as const

  return entries.filter(
    entry => entry?.type === typeMap[type]
  ) as typeof trackerConfig[T]['entryType']
} 