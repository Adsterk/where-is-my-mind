'use client'

import { ErrorBoundary } from '@/components/error-boundary'
import { MedicationTracker } from './MedicationTracker'
import type { MedicationTrackerProps } from './types'

export function MedicationTrackerWithErrorBoundary(props: MedicationTrackerProps) {
  return (
    <ErrorBoundary>
      <MedicationTracker {...props} />
    </ErrorBoundary>
  )
} 