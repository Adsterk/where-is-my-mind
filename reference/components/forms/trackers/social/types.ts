import type { EntryWithType } from '@/types/entries'

export interface SocialConnection {
  id: string
  name: string
  type: string
  is_custom: boolean
}

export interface SocialConnectionEntry {
  social_id: string
  quality_rating: number
  impact_rating: number
  notes?: string
}

export type TypedSocialEntry = EntryWithType<'social', SocialConnectionEntry>

export interface SocialConnectionTrackerProps {
  items: SocialConnection[]
  entries: TypedSocialEntry[]
  onUpdate: (items: SocialConnection[], entries: TypedSocialEntry[]) => void
  onNewConnection?: (connection: Omit<SocialConnection, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}
