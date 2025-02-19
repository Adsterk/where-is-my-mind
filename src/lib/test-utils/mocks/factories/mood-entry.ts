import type { MoodEntry, FormSection, TrackingItem } from '@/lib/types/form'

export const createMockMoodEntry = (overrides?: Partial<MoodEntry>): MoodEntry => ({
  mood_score: 5,
  is_bipolar: false,
  notes: null,
  tracking_data: {},
  date: new Date().toISOString().split('T')[0],
  ...overrides
})

export const createMockFormSection = (overrides?: Partial<FormSection>): FormSection => ({
  id: `section-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Section',
  type: 'mood',
  default_order: 0,
  is_required: false,
  is_visible: true,
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockTrackingItem = (overrides?: Partial<TrackingItem>): TrackingItem => ({
  id: `item-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Item',
  is_active: true,
  display_order: 0,
  section_id: 'test-section',
  user_id: 'test-user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
})

export const createMockFormState = () => ({
  sections: [
    createMockFormSection({ type: 'mood', name: 'Mood', is_required: true }),
    createMockFormSection({ type: 'sleep', name: 'Sleep', is_required: true }),
    createMockFormSection({ type: 'medication', name: 'Medication' }),
    createMockFormSection({ type: 'behavior', name: 'Behaviors' }),
    createMockFormSection({ type: 'skill', name: 'Skills' }),
    createMockFormSection({ type: 'social', name: 'Social' }),
    createMockFormSection({ type: 'self-care', name: 'Self-Care' })
  ],
  trackingItems: {},
  currentEntry: createMockMoodEntry(),
  isDirty: false
}) 