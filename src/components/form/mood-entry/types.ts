export interface MoodEntry {
  mood_score: number
  notes: string | null
  is_bipolar_scale: boolean
}

export interface MoodEntryFormProps {
  value: MoodEntry
  onUpdate: (data: MoodEntry) => void
  isEditing?: boolean
} 