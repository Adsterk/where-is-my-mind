'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MoodPatternsProps {
  dateRange: { start: Date; end: Date }
}

export function MoodPatterns({ dateRange }: MoodPatternsProps) {
  const { supabase } = useSupabase()
  const [patterns, setPatterns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyzePatterns()
  }, [dateRange])

  const analyzePatterns = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('mood_score, created_at')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at')

    if (data) {
      // Simple pattern analysis - you can make this more sophisticated
      const patterns = []
      let prevScore = null
      let trend = 0

      for (const entry of data) {
        if (prevScore !== null) {
          if (entry.mood_score > prevScore) trend++
          if (entry.mood_score < prevScore) trend--
        }
        prevScore = entry.mood_score
      }

      if (trend > 0) patterns.push('Your mood is trending upward')
      if (trend < 0) patterns.push('Your mood is trending downward')
      if (trend === 0) patterns.push('Your mood has been stable')

      setPatterns(patterns)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : patterns.length > 0 ? (
          <ul className="space-y-2">
            {patterns.map((pattern, index) => (
              <li key={index}>{pattern}</li>
            ))}
          </ul>
        ) : (
          <p>No patterns detected in the selected date range.</p>
        )}
      </CardContent>
    </Card>
  )
} 