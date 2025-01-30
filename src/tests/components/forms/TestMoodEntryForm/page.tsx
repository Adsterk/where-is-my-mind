'use client'

import TestMoodEntryPage from '@/tests/components/forms/TestMoodEntryForm'
import { ErrorBoundary } from '@/tests/components/forms/ErrorBoundary'

export default function TestPage() {
  return (
    <ErrorBoundary>
      <TestMoodEntryPage />
    </ErrorBoundary>
  )
} 