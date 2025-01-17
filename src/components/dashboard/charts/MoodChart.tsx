'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface MoodChartProps {
  dateRange: { start: Date; end: Date }
}

export function MoodChart({ dateRange }: MoodChartProps) {
  const { supabase } = useSupabase()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMoodData()
  }, [dateRange])

  const loadMoodData = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('mood_score, created_at')
      .gte('created_at', dateRange.start.toISOString())
      .lte('created_at', dateRange.end.toISOString())
      .order('created_at')

    if (data) {
      setData(data.map(entry => ({
        date: format(new Date(entry.created_at), 'MMM d'),
        score: entry.mood_score
      })))
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 