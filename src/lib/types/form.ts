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

export interface FormSection {
  id: string
  name: string
  type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'spiritual'
  default_order: number
  is_required: boolean
  is_visible?: boolean
  created_at: string
}

export interface MoodEntry {
  mood_score: number
  is_bipolar: boolean
  notes?: string | null
  tracking_data?: Record<string, boolean>
  date: string
}

export interface FormState {
  sections: FormSection[]
  trackingItems: Record<string, TrackingItem[]>
  currentEntry: MoodEntry | null
  isDirty: boolean
} 