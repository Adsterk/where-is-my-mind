// Form Section Types
export interface FormSection {
  id: string
  name: string
  type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'self-care'
  default_order: number
  is_required: boolean
  is_visible?: boolean
  created_at: string
}

// Tracking Item Types
export interface TrackingItem {
  id: string
  name: string
  is_active: boolean
  display_order: number
  section_id: string
  user_id: string
  created_at: string
  updated_at: string
}

// Mood Entry Types
export interface MoodEntry {
  mood_score: number
  is_bipolar: boolean
  notes?: string | null
  tracking_data?: Record<string, boolean>
  date: string
}

// Form State Types
export interface FormState {
  sections: FormSection[]
  trackingItems: Record<string, TrackingItem[]>
  currentEntry: MoodEntry | null
  isDirty: boolean
}

// Component Props Types
export interface MoodScoreProps {
  value: number
  isBipolar: boolean
  onChange: (value: number) => void
  onBipolarChange: (value: boolean) => void
  disabled?: boolean
}

export interface TrackingSectionProps {
  title: string
  description?: string
  items: TrackingItem[]
  onItemAdd: (name: string) => void
  onItemToggle: (itemId: string, checked: boolean) => void
  onItemDelete: (itemId: string) => void
  isEditing?: boolean
  disabled?: boolean
}

export interface SectionManagerProps {
  sections: FormSection[]
  onOrderChange: (sections: FormSection[]) => void
  onVisibilityChange: (sectionId: string, isVisible: boolean) => void
  disabled?: boolean
}
