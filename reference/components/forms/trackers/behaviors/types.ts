import type { EntryWithType } from '@/types/entries'

export interface Behavior {
  id: string
  name: string
  category?: string
  is_custom: boolean
}

export interface BehaviorEntry {
  behaviors_id: string
  intensity: number
  trigger?: string
  notes?: string
}

export type TypedBehaviorEntry = EntryWithType<'behavior', BehaviorEntry>

export interface BehaviorTrackerProps {
  items: Behavior[]
  entries: TypedBehaviorEntry[]
  onUpdate: (items: Behavior[], entries: TypedBehaviorEntry[]) => void
  onNewBehavior?: (behavior: Omit<Behavior, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}
