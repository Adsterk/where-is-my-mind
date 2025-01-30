'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  averageMood: number
  totalEntries: number
  highestMood: number
  lowestMood: number
}

export function BasicStats() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('mood_score')

      if (error) throw error

      if (data && data.length > 0) {
        const moodScores = data.map(entry => entry.mood_score)
        setStats({
          averageMood: Number((moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1)),
          totalEntries: moodScores.length,
          highestMood: Math.max(...moodScores),
          lowestMood: Math.min(...moodScores)
        })
      } else {
        setStats(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )

  if (error) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-destructive">{error}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {['Average Mood', 'Total Entries', 'Highest Mood', 'Lowest Mood'].map((title) => (
          <StatCard key={title} title={title} value="No data" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Average Mood" value={`${stats.averageMood}/10`} />
      <StatCard title="Total Entries" value={stats.totalEntries} />
      <StatCard title="Highest Mood" value={`${stats.highestMood}/10`} />
      <StatCard title="Lowest Mood" value={`${stats.lowestMood}/10`} />
    </div>
  )
} 