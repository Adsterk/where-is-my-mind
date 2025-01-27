export interface Mood {
  id: string
  name: string
  is_custom: boolean
}

export interface MoodEntry {
  mood_id: string
  mood_score: number
  notes: string | null
  is_bipolar_scale: boolean
}
