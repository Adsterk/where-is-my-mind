import type { EntryWithType } from '@/types/entries'

export interface SpiritualPractice {
  id: string
  name: string
  is_custom: boolean
}

export interface SpiritualPracticeEntry {
  spirituality_id: string
  duration_minutes: number
  fulfillment_rating: number
  notes?: string
}

export type TypedSpiritualityEntry = EntryWithType<'spirituality', SpiritualPracticeEntry>

export interface SpiritualityTrackerProps {
  items: SpiritualPractice[]
  entries: TypedSpiritualityEntry[]
  onUpdate: (items: SpiritualPractice[], entries: TypedSpiritualityEntry[]) => void
  onNewPractice?: (practice: Omit<SpiritualPractice, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}
