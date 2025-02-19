'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ResponsiveLine } from '@nivo/line'

interface MoodChartProps {
  dateRange: { from: Date; to: Date }
}

export function MoodChart({ dateRange }: MoodChartProps) {
  const { supabase, user } = useSupabase()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadMoodData()
    } else {
      setLoading(false)
    }
  }, [dateRange, user])

  const loadMoodData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('daily_entries')
        .select('mood_score, created_at, is_bipolar')
        .eq('user_id', user?.id)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at')

      if (error) {
        console.error('Supabase error loading mood data:', error)
        throw error
      }

      if (!data) {
        console.warn('No data returned from mood query')
        setData([])
        return
      }

      console.log('Successfully loaded mood data:', data.length, 'entries')
      setData(data.map(entry => ({
        date: format(new Date(entry.created_at), 'MMM d'),
        score: entry.is_bipolar ? ((entry.mood_score - 5) * 2) : entry.mood_score,
        tooltip: entry.is_bipolar ? 
          (entry.mood_score === 5 ? 'Balanced' : 
           entry.mood_score < 5 ? `Depression Level ${entry.mood_score}` : 
           `Mania Level ${entry.mood_score}`) :
          `${entry.mood_score}/10`
      })))
    } catch (err) {
      console.error('Error loading mood data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mood data')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Please sign in to view your mood data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-[300px] bg-muted rounded" />
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-destructive">{error}</div>
            <button 
              onClick={loadMoodData}
              className="text-sm text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : data.length > 0 ? (
          <div className="h-[300px] w-full -ml-2 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                <XAxis 
                  dataKey="date"
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis 
                  domain={[-10, 10]} 
                  stroke="hsl(var(--foreground))"
                  ticks={[-10, -5, 0, 5, 10]}
                  width={30}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded p-2">
                          <p className="text-sm">{format(new Date(payload[0].payload.date), 'MMM d, yyyy')}</p>
                          <p className="text-sm font-bold">{payload[0].payload.tooltip}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No mood data available for the selected date range.</p>
            <p className="text-sm mt-2">Try selecting a different date range or add more mood entries.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 