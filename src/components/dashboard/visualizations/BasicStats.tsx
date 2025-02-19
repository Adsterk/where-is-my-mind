'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/components/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useData } from '@/lib/hooks/useData'
import type { BasicStatsProps, Stats } from '../types'

export function BasicStats({ initialData }: BasicStatsProps) {
  const { supabase, user } = useSupabase()

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', user?.id)
      .not('mood_score', 'is', null)

    if (error) throw error
    return data
  }

  const processStats = (data: any[]): Stats => {
    if (!data || data.length === 0) {
      throw new Error('No data available')
    }

    const regularScores = data
      .filter(entry => !entry.is_bipolar)
      .map(entry => entry.mood_score)
    
    const bipolarScores = data
      .filter(entry => entry.is_bipolar)
      .map(entry => entry.mood_score)

    // Determine if user is using bipolar or regular scale based on most recent entry
    const latestEntry = data.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    const isUsingBipolarScale = latestEntry.is_bipolar

    // Calculate average based on the scale type being used
    const relevantScores = isUsingBipolarScale ? bipolarScores : regularScores
    const averageMood = relevantScores.length > 0 ? 
      Number((relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length).toFixed(1)) :
      null

    return {
      totalEntries: data.length,
      regularEntries: regularScores.length,
      bipolarEntries: bipolarScores.length,
      averageMood,
      isUsingBipolarScale,
      averageRegularMood: regularScores.length > 0 ? 
        Number((regularScores.reduce((a, b) => a + b, 0) / regularScores.length).toFixed(1)) : 
        null,
      averageBipolarMood: bipolarScores.length > 0 ? 
        Number((bipolarScores.reduce((a, b) => a + b, 0) / bipolarScores.length).toFixed(1)) : 
        null,
      highestMood: relevantScores.length > 0 ? Math.max(...relevantScores) : 0,
      lowestMood: relevantScores.length > 0 ? Math.min(...relevantScores) : 0
    }
  }

  const { data: stats, error, isLoading } = useData(
    async () => {
      const data = await fetchStats()
      return processStats(data)
    },
    {
      key: `stats-${user?.id}`,
      ttl: 5 * 60 * 1000, // 5 minutes
      enabled: !!user,
      initialData: initialData ? processStats(initialData) : null
    }
  )

  const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )

  if (!user) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {['Average Mood', 'Total Entries', 'Highest Mood', 'Lowest Mood'].map((title) => (
          <StatCard key={title} title={title} value="Sign in to view" />
        ))}
      </div>
    )
  }

  if (isLoading) {
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
                <div className="text-destructive">{error.message}</div>
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
      <StatCard 
        title="Average Mood" 
        value={
          !stats.averageMood ? 'No data' :
          stats.isUsingBipolarScale ? (
            `${stats.averageMood >= 4.5 && stats.averageMood <= 5.5 ? 'Balanced' :
            stats.averageMood > 5.5 ? 'Manic' :
            'Depressive'} (${stats.averageMood})`
          ) : (
            `${stats.averageMood >= 4 && stats.averageMood <= 6 ? 'Neutral' :
            stats.averageMood > 6 ? 'Happy' :
            'Sad'} (${stats.averageMood})`
          )
        }
        subtitle={stats.isUsingBipolarScale ? 
          `${stats.bipolarEntries} bipolar entries` : 
          `${stats.regularEntries} regular entries`}
      />
      <StatCard 
        title={stats.isUsingBipolarScale ? "Highest Score" : "Highest Score"}
        value={stats.highestMood ?? 'No data'}
      />
      <StatCard 
        title={stats.isUsingBipolarScale ? "Lowest Score" : "Lowest Score"}
        value={stats.lowestMood ?? 'No data'}
      />
      <StatCard 
        title="Total Entries" 
        value={stats.totalEntries} 
      />
    </div>
  )
} 