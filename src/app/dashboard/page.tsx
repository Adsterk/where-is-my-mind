'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  MoodOverview,
  BasicStats,
  DateRangeSelector,
  MoodChart,
  MoodPatterns,
  RecentEntries 
} from '@/components/dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  })

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/auth/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end })
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  }

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