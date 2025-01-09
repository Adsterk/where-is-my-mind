'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/hooks/useSupabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  averageMood: number
  totalEntries: number
  highestMood: number
  lowestMood: number
}

export function BasicStats() {
  const supabase = useSupabase()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('mood_score')

    if (data) {
      const moodScores = data.map(entry => entry.mood_score)
      setStats({
        averageMood: Number((moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1)),
        totalEntries: moodScores.length,
        highestMood: Math.max(...moodScores),
        lowestMood: Math.min(...moodScores)
      })
    }
    setLoading(false)
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats?.averageMood || 0}/10
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats?.totalEntries || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Highest Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats?.highestMood || 0}/10
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Lowest Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats?.lowestMood || 0}/10
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 