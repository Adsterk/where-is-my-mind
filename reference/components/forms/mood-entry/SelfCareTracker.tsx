'use client'

import { BaseTracker } from './BaseTracker'
import type { TrackingItem, RatingValue } from '@/lib/types/entries'

type SelfCareItem = Omit<TrackingItem, 'severity' | 'effectiveness' | 'quality'>

interface SelfCareTrackerProps {
  value: {
    activities: Array<{
      id: string
      name: string
      completed: boolean
      impact?: RatingValue
    }>
    notes: string | null
  }
  isEditing?: boolean
}

/**
 * SelfCareTracker Component
 * 
 * A component for tracking self-care activities and their impact.
 * Uses BaseTracker for core functionality while adding self-care-specific features.
 */
export function SelfCareTracker({ 
  value,
  isEditing = true
}: SelfCareTrackerProps) {
  // Convert activities to tracking items
  const trackingItems: TrackingItem[] = (value?.activities || []).map(activity => ({
    id: activity.id,
    name: activity.name,
    completed: activity.completed,
    impact: activity.impact,
    // Self-care activities only use impact rating
    severity: undefined,
    effectiveness: undefined,
    quality: undefined
  }))

  return (
    <BaseTracker
      title="Self-Care Activities"
      items={trackingItems}
      notes={value?.notes ?? null}
      isEditing={isEditing}
      itemPlaceholder="Enter a self-care activity..."
      notesPlaceholder="Add any notes about these activities..."
      showImpact={true}
      sectionId="self-care"
    />
  )
} 