'use client'

import { useState, useCallback } from 'react'
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

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end })
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
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