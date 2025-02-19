'use client'

import { BaseTracker } from './BaseTracker'
import type { TrackingItem } from '@/lib/types/entries'

interface MedicationTrackerProps {
  value: {
    medications: Array<{
      id: string
      name: string
      completed: boolean
    }>
    notes: string | null
  }
  isEditing?: boolean
}

/**
 * MedicationTracker Component
 * 
 * A component for tracking medications and whether they were completed.
 * Uses BaseTracker for core functionality while adding medication-specific features.
 */
export function MedicationTracker({ 
  value,
  isEditing = true
}: MedicationTrackerProps) {
  // Convert medications to tracking items
  const trackingItems: TrackingItem[] = (value?.medications || []).map(med => ({
    id: med.id,
    name: med.name,
    completed: med.completed,
    // Medications don't use any ratings
    severity: undefined,
    effectiveness: undefined,
    quality: undefined,
    impact: undefined
  }))

  return (
    <BaseTracker
      title="Medication Tracker"
      items={trackingItems}
      notes={value?.notes ?? null}
      isEditing={isEditing}
      itemPlaceholder="Enter a medication..."
      notesPlaceholder="Add any notes about your medications..."
      sectionId="medications"
    />
  )
} 