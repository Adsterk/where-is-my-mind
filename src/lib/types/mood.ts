export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  notes: string | null
  created_at: string
  timezone: string
}

export type NewMoodEntry = Omit<MoodEntry, 'id' | 'created_at'> 