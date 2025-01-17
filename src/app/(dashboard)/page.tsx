'use client'

import { useState, useCallback } from 'react'
import { MoodOverview } from '@/components/dashboard/MoodOverview'
import { BasicStats } from '@/components/dashboard/BasicStats'
import { DateRangeSelector } from '@/components/dashboard/controls/DateRangeSelector'
import { MoodChart } from '@/components/dashboard/charts/MoodChart'
import { MoodPatterns } from '@/components/dashboard/charts/MoodPatterns'
import { RecentEntries } from '@/components/dashboard/RecentEntries'
import { useSupabase } from '@/components/providers/SupabaseProvider'

export default function DashboardPage() {
  const { session } = useSupabase()
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  })

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <MoodOverview />
        <BasicStats />
      </div>

      <DateRangeSelector onRangeChange={handleRangeChange} />
      
      <div className="grid gap-6 grid-cols-1">
        <MoodChart dateRange={dateRange} />
        <MoodPatterns dateRange={dateRange} />
      </div>

      <RecentEntries />
    </div>
  )
} 