'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface MoodEntry {
  id: string
  mood_score: number
  notes: string | null
  created_at: string
}

export function RecentEntries() {
  const { supabase } = useSupabase()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentEntries()
  }, [])

  const loadRecentEntries = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (data) {
      setEntries(data)
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <div className="font-medium">
                    {format(new Date(entry.created_at), 'MMM d, yyyy')}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {entry.notes}
                    </p>
                  )}
                </div>
                <div className="text-2xl font-bold">{entry.mood_score}/10</div>
              </div>
            ))}
          </div>
        ) : (
          <p>No entries yet</p>
        )}
      </CardContent>
    </Card>
  )
} 