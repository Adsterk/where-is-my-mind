'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabase } from '@/components/providers'
import { Skeleton } from '@/components/ui/skeleton'
import { useData } from '@/lib/hooks/useData'
import { fetchTodaysMood } from '@/lib/api/mood'
import type { MoodOverviewProps } from '../types'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

interface TodaysMood {
  mood_score: number
  date: string
  is_bipolar: boolean
}

export function MoodOverview({ initialData }: MoodOverviewProps) {
  const router = useRouter()
  const { supabase, user } = useSupabase()

  const fetchTodaysMoodCallback = useCallback(async () => {
    if (!user?.id) return null
    try {
      const entry = await fetchTodaysMood(supabase, user.id)
      if (!entry) return null
      return {
        mood_score: entry.mood_score,
        date: entry.date,
        is_bipolar: entry.is_bipolar_scale
      }
    } catch (error) {
      // Only log unexpected errors, don't show them to the user
      console.error('Unexpected error fetching today\'s mood:', error)
      return null
    }
  }, [supabase, user?.id])

  const { data: todaysMood, isLoading } = useData<TodaysMood | null>(
    fetchTodaysMoodCallback,
    {
      key: `mood-${user?.id}-${new Date().toISOString().split('T')[0]}`,
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!user?.id,
      initialData,
      staleTime: 0, // Always revalidate on mount
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please sign in to view your mood</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Mood</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[200px]" />
          </div>
        ) : !todaysMood ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">No mood entry recorded yet</p>
            <Button
              onClick={() => router.push('/form/mood-entry')}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Record Today's Mood
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {todaysMood.is_bipolar ? (
                todaysMood.mood_score === 5 ? 'Balanced' :
                todaysMood.mood_score < 5 ? `Depression Level ${todaysMood.mood_score}` :
                `Mania Level ${todaysMood.mood_score}`
              ) : (
                `${todaysMood.mood_score}/10`
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Recorded on {new Date(todaysMood.date).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 