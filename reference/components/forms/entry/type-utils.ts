import type { TrackerSectionId, SectionEntryMap } from '@/types/forms'

export function convertEntries<T extends TrackerSectionId>(
  entries: any[],
  sectionId: T
): SectionEntryMap[T] {
  const typeMap = {
    medications: 'medication',
    activities: 'activity',
    behaviors: 'behavior',
    skills: 'skill',
    socialConnections: 'social',
    spirituality: 'spirituality'
  } as const

  return entries.map(entry => ({
    ...entry,
    type: typeMap[sectionId]
  })) as SectionEntryMap[T]
}

function getEntryType(sectionId: TrackerSectionId) {
  const typeMap = {
    medications: 'medication',
    activities: 'activity',
    behaviors: 'behavior',
    skills: 'skill',
    socialConnections: 'social',
    spirituality: 'spirituality'
  } as const
  
  return typeMap[sectionId]
}

export type { TrackerSectionId, SectionEntryMap } 