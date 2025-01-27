import type { EntryWithType } from '@/types/entries'

export interface Activity {
  id: string
  name: string
  category: string
  is_custom: boolean
}

export interface ActivityEntry {
  activities_id: string
  duration_minutes: number
  intensity: number
  notes?: string
}

export type TypedActivityEntry = EntryWithType<'activity', ActivityEntry>

export interface ActivityTrackerProps {
  items: Activity[]
  entries: TypedActivityEntry[]
  onUpdate: (items: Activity[], entries: TypedActivityEntry[]) => void
  onNewActivity?: (activity: Omit<Activity, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}
