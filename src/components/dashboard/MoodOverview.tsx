'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface MoodEntry {
  id: string
  mood_score: number
  notes: string | null
  created_at: string
}

export function MoodOverview() {
  const supabase = useSupabase()
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTodayMood()
  }, [])

  const loadTodayMood = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setTodayMood(data)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Mood</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : todayMood ? (
          <div className="space-y-2">
            <div className="text-4xl font-bold">{todayMood.mood_score}/10</div>
            {todayMood.notes && (
              <p className="text-muted-foreground">{todayMood.notes}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Recorded at {format(new Date(todayMood.created_at), 'h:mm a')}
            </p>
          </div>
        ) : (
          <p>No mood recorded today</p>
        )}
      </CardContent>
    </Card>
  )
} 