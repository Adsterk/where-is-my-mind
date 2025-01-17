'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'

interface MoodEntry {
  id: string
  mood_score: number
  notes: string | null
  created_at: string
  is_bipolar_scale: boolean
}

export function MoodOverview() {
  const { supabase, user } = useSupabase()
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadTodayMood()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadTodayMood = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('mood_entries')
        .select('id, mood_score, notes, created_at, is_bipolar_scale')
        .eq('user_id', user?.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      setTodayMood(data)
    } catch (err) {
      console.error('Error loading mood:', err)
      setError('Unable to load mood data')
    } finally {
      setLoading(false)
    }
  }

  const getMoodDisplay = (entry: MoodEntry) => {
    if (!entry.is_bipolar_scale) {
      return `${entry.mood_score}/10`
    }

    if (entry.mood_score === 5) {
      return 'Balanced'
    }
    if (entry.mood_score < 5) {
      return `Depression Level ${entry.mood_score}`
    }
    return `Mania Level ${entry.mood_score}`
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Please sign in to view your mood data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Mood</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-destructive">{error}</div>
            <button 
              onClick={loadTodayMood}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : todayMood ? (
          <div className="space-y-2">
            <div className="text-4xl font-bold">
              {getMoodDisplay(todayMood)}
            </div>
            {todayMood.notes && (
              <p className="text-muted-foreground">{todayMood.notes}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Recorded at {format(new Date(todayMood.created_at), 'h:mm a')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-muted-foreground">
              No mood recorded today
            </p>
            <Link 
              href="/dashboard/daily-mood" 
              className="inline-block text-sm text-primary hover:underline"
            >
              Record your first mood entry
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 