'use client'

import { useState } from 'react'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { FormEditProvider } from '@/components/providers'
import { ErrorBoundary } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { MoodEntry } from '@/components/form/mood-entry/types'

// Dynamically import MoodEntryForm with no SSR to prevent hydration issues
const MoodEntryForm = dynamic(
  () => import('@/components/form/mood-entry/MoodEntryForm').then(mod => mod.MoodEntryForm),
  { 
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }
)

function MoodEntryFormWrapper() {
  const [entry, setEntry] = useState<MoodEntry>({
    mood_score: 5,
    notes: null,
    is_bipolar_scale: false
  })

  return (
    <FormEditProvider initialEditing={true}>
      <MoodEntryForm 
        value={entry}
        onUpdate={setEntry}
      />
    </FormEditProvider>
  )
}

export default function DailyMoodPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Daily Mood Entry</h1>
      
      <ErrorBoundary>
        <Suspense fallback={
          <Card>
            <CardContent className="flex items-center justify-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        }>
          <MoodEntryFormWrapper />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
} 