# Dashboard Implementation Guide

## Overview

The dashboard page serves as the main interface for users to view their mood tracking data. It includes various components for visualizing mood data, recent entries, and statistics.

## Page Structure

### Layout
```tsx
// src/app/dashboard/layout.tsx
import { Navigation } from '@/components/shared/Navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### Page Component
```tsx
// src/app/dashboard/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { 
  MoodOverview,
  BasicStats,
  DateRangeSelector,
  MoodChart,
  MoodPatterns,
  RecentEntries 
} from '@/components/dashboard'

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <Link href="/form/mood-entry">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Daily Entry
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <MoodOverview />
        <BasicStats />
      </div>

      <DateRangeSelector onRangeChange={(start, end) => setDateRange({ start, end })} />
      
      <div className="grid gap-6 grid-cols-1">
        <MoodChart dateRange={dateRange} />
        <MoodPatterns dateRange={dateRange} />
      </div>

      <RecentEntries />
    </div>
  )
}
```

## Components

### 1. BasicStats Component
```tsx
// src/components/dashboard/stats/BasicStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface Stats {
  averageMood: number
  totalEntries: number
  highestMood: number
  lowestMood: number
}

export function BasicStats() {
  const { supabase, user } = useSupabase()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadStats()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_entries')
        .select('mood_score')
        .eq('user_id', user?.id)
        .not('mood_score', 'is', null)

      if (error) throw error

      if (data && data.length > 0) {
        const moodScores = data.map(entry => entry.mood_score!).filter(Boolean)
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
      console.error('Error loading stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {['Average Mood', 'Total Entries', 'Highest Mood', 'Lowest Mood'].map((title) => (
          <StatCard key={title} title={title} value="Sign in to view" />
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
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="text-destructive">{error}</div>
                <Button 
                  onClick={loadStats}
                  variant="outline"
                  size="sm"
                >
                  Try again
                </Button>
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
```

### 2. MoodChart Component
```tsx
// src/components/dashboard/charts/MoodChart.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMoodData()
  }, [dateRange])

  const loadMoodData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_entries')
        .select('mood_score, created_at')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at')

      if (error) throw error

      if (data) {
        setData(data.map(entry => ({
          date: format(new Date(entry.created_at), 'MMM d'),
          score: entry.mood_score
        })))
      }
    } catch (err) {
      console.error('Error loading mood data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load mood data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-[300px] bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-destructive">{error}</div>
            <Button 
              onClick={loadMoodData}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No mood data available for the selected date range.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 3. RecentEntries Component
```tsx
// src/components/dashboard/RecentEntries.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
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

export function RecentEntries() {
  const { supabase } = useSupabase()
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecentEntries()
  }, [])

  const loadRecentEntries = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      if (data) {
        setEntries(data)
      }
    } catch (err) {
      console.error('Error loading recent entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load recent entries')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
            ))}
          </div>
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
            <div className="text-destructive">{error}</div>
            <Button 
              onClick={loadRecentEntries}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
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
                <div className="text-2xl font-bold">
                  {entry.is_bipolar_scale
                    ? entry.mood_score === 5
                      ? 'Balanced'
                      : entry.mood_score < 5
                      ? `Depression Level ${entry.mood_score}`
                      : `Mania Level ${entry.mood_score}`
                    : `${entry.mood_score}/10`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <p className="text-muted-foreground">No entries recorded yet</p>
            <Link 
              href="/form/mood-entry" 
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
```

## Implementation Notes

1. **Authentication Flow**
   - Authentication is handled at the layout level
   - Unauthenticated users are redirected to login
   - All data fetching components check for user existence

2. **Data Loading States**
   - Each component handles its own loading state
   - Loading states show appropriate skeleton UI
   - Error states include retry functionality

3. **Error Handling**
   - All database operations are wrapped in try-catch blocks
   - Error messages are displayed to users
   - Retry functionality is provided where appropriate

4. **Component Dependencies**
   - All components use the Supabase context
   - UI components from shadcn/ui
   - Date formatting using date-fns
   - Charts using recharts

5. **Database Schema**
```sql
create table public.daily_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  mood_score integer check (mood_score >= 0 and mood_score <= 10),
  is_bipolar boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, date)
);

-- Enable RLS
alter table public.daily_entries enable row level security;

-- Create policies
create policy "Users can read their own daily entries"
  on public.daily_entries for select
  using (auth.uid() = user_id);
```

## Troubleshooting

1. **Infinite Loading**
   - Check if user is properly set in Supabase context
   - Verify loading state is being set to false in finally block
   - Ensure error states are properly handled

2. **Missing Data**
   - Verify database queries include user_id filter
   - Check RLS policies are properly configured
   - Ensure date ranges are properly formatted

3. **Authentication Issues**
   - Verify SupabaseProvider is properly configured
   - Check layout-level authentication
   - Ensure proper error handling for auth state changes 