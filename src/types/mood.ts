export interface NewMoodEntry {
  user_id: string
  mood_score: number
  notes: string | null
  sleep_hours: number
  sleep_quality: string | null
  timezone: string
}

export interface MoodEntry extends NewMoodEntry {
  id: string
  created_at: string
} 