import { SupabaseClient } from '@supabase/supabase-js'

export interface MoodEntry {
  id: string
  user_id: string
  date: string
  mood_score: number
  is_bipolar_scale: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export async function fetchTodaysMood(
  supabase: SupabaseClient,
  userId: string
): Promise<MoodEntry | null> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  console.log('Fetching mood for:', todayStr, 'userId:', userId)

  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', todayStr)
    .single()

  if (error?.code === 'PGRST116') {
    return null
  }

  if (error) {
    console.error('Unexpected error fetching mood:', error)
    throw error
  }

  console.log('Fetched mood data:', data)
  return data
}

export async function fetchMoodRange(
  supabase: SupabaseClient,
  userId: string,
  from: Date,
  to: Date
): Promise<MoodEntry[]> {
  console.log('Fetching mood range:', {
    from: from.toISOString(),
    to: to.toISOString(),
    userId
  })

  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from.toISOString().split('T')[0])
    .lte('date', to.toISOString().split('T')[0])
    .order('date', { ascending: true })

  if (error) {
    console.error('Unexpected error fetching mood range:', error)
    throw error
  }

  console.log('Fetched mood range:', data?.length, 'entries')
  return data || []
} 