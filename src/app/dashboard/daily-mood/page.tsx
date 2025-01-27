'use client'

import dynamic from 'next/dynamic'
import { FormEditProvider } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'

// Dynamically import MoodEntryForm with no SSR to prevent hydration issues
const MoodEntryForm = dynamic(
  () => import('@/components/forms/entry/MoodEntryForm').then(mod => mod.MoodEntryForm),
  { ssr: false }
)

export default function DailyMoodPage() {
  return (
    <ErrorBoundary>
      <FormEditProvider initialEditing={true}>
        <MoodEntryForm />
      </FormEditProvider>
    </ErrorBoundary>
  )
} 