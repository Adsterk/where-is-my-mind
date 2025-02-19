'use client'

import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { useData } from '@/lib/hooks/useData'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { RecentEntriesProps } from '../types'

interface DailyEntry {
  id: string
  mood_score: number | null
  tracking_data: {
    mood?: {
      notes?: string | null
    }
  }
  created_at: string
  is_bipolar: boolean
}

const ENTRIES_PER_PAGE = 5

export function RecentEntries({ initialData }: RecentEntriesProps) {
  const { supabase, user } = useSupabase()
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchRecentEntries = async () => {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user?.id)
      .order('date', { ascending: false })
      .range(page * ENTRIES_PER_PAGE, (page + 1) * ENTRIES_PER_PAGE - 1)

    if (error) throw error

    // Check if there are more entries
    const { count } = await supabase
      .from('daily_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)

    setHasMore(count ? (page + 1) * ENTRIES_PER_PAGE < count : false)
    
    return data
  }

  const { data: entries, error, isLoading, mutate } = useData<DailyEntry[]>(
    fetchRecentEntries,
    {
      key: `recent-entries-${user?.id}-${page}`,
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!user,
      initialData: page === 0 ? initialData : undefined
    }
  )

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1)
      mutate()
    }
  }

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1)
      mutate()
    }
  }

  const getMoodDisplay = (entry: DailyEntry) => {
    if (!entry.mood_score) return 'No mood recorded'
    if (entry.is_bipolar) {
      if (entry.mood_score === 5) return 'Balanced'
      return entry.mood_score < 5 
        ? `Depression Level ${entry.mood_score}`
        : `Mania Level ${entry.mood_score}`
    }
    return `${entry.mood_score}/10`
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Sign in to view your recent entries</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingScreen message="Loading entries..." size="sm" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-destructive">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {page === 0 ? 'No entries found' : 'No more entries found'}
          </p>
          {page > 0 && (
            <Button
              onClick={handlePreviousPage}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to previous entries
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Recent Entries</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPage}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={!hasMore}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{getMoodDisplay(entry)}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(entry.created_at), 'PPP')}
                </p>
              </div>
              <Link href={`/entries/${entry.id}`}>
                <Button variant="ghost" size="sm">View Details</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 