'use client'

import { Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { 
  MoodOverview,
  BasicStats,
  RecentEntries,
  MoodChart,
  MoodPatterns,
  DateRangeSelector
} from '@/components/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export function DashboardContent() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
          <Button
            onClick={() => router.push('/form/mood-entry')}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Daily Entry
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[200px]" />}>
          <MoodOverview />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[200px]" />}>
          <BasicStats />
        </Suspense>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <div className="space-y-6">
          <DateRangeSelector 
            defaultValue={dateRange}
            onRangeChange={(from: Date, to: Date) => setDateRange({ from, to })}
          />
          <MoodChart dateRange={dateRange} />
          <MoodPatterns dateRange={dateRange} />
        </div>
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[200px]" />}>
        <RecentEntries />
      </Suspense>
    </div>
  )
} 