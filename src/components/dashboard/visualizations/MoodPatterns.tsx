'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/lib/hooks/useData'
import { fetchMoodRange } from '@/lib/api/mood'

interface MoodPatternsProps {
  dateRange: { from: Date; to: Date }
}

export function MoodPatterns({ dateRange }: MoodPatternsProps) {
  const { supabase, user } = useSupabase()
  const [patterns, setPatterns] = useState<string[]>([])

  const fetchMoodDataCallback = useCallback(async () => {
    if (!user?.id) throw new Error('User not authenticated')
    return fetchMoodRange(supabase, user.id, dateRange.from, dateRange.to)
  }, [supabase, user?.id, dateRange])

  const { data: moodData, error, isLoading } = useData(
    fetchMoodDataCallback,
    {
      key: `patterns-${user?.id}-${dateRange.from.toISOString()}-${dateRange.to.toISOString()}`,
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!user?.id,
      staleTime: 30000 // 30 seconds
    }
  )

  useEffect(() => {
    if (moodData && moodData.length > 0) {
      const patterns = []
      let prevScore = null
      let trend = 0
      let volatility = 0
      let bipolarEntries = 0
      let regularEntries = 0

      for (const entry of moodData) {
        if (entry.is_bipolar_scale) {
          bipolarEntries++
        } else {
          regularEntries++
        }

        const normalizedScore = entry.is_bipolar_scale ? 
          ((entry.mood_score - 5) * 2) : 
          entry.mood_score

        if (prevScore !== null) {
          const change = normalizedScore - prevScore
          trend += change
          volatility += Math.abs(change)
        }
        prevScore = normalizedScore
      }

      const avgVolatility = volatility / (moodData.length - 1)

      if (trend > moodData.length * 0.2) {
        patterns.push('Your mood has been trending upward significantly')
      } else if (trend > 0) {
        patterns.push('Your mood shows a slight upward trend')
      } else if (trend < -moodData.length * 0.2) {
        patterns.push('Your mood has been trending downward significantly')
      } else if (trend < 0) {
        patterns.push('Your mood shows a slight downward trend')
      } else {
        patterns.push('Your mood has been relatively stable')
      }

      if (avgVolatility > 3) {
        patterns.push('Your mood shows high variability')
      } else if (avgVolatility > 1.5) {
        patterns.push('Your mood shows moderate variability')
      } else {
        patterns.push('Your mood shows low variability')
      }

      if (bipolarEntries > 0 && regularEntries > 0) {
        patterns.push('You have mixed entries using both bipolar and regular scales')
      }

      setPatterns(patterns)
    } else {
      setPatterns([])
    }
  }, [moodData])

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Please sign in to view your mood patterns</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-destructive">{error.message}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : patterns.length > 0 ? (
          <ul className="space-y-3">
            {patterns.map((pattern, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>{pattern}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No patterns detected in the selected date range.</p>
            <p className="text-sm mt-1">Try selecting a different date range or add more mood entries.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 