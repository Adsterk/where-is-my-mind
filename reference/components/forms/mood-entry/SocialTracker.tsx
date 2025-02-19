'use client'

import { BaseTracker } from './BaseTracker'
import type { TrackingItem, RatingValue } from '@/lib/types/entries'

type SocialItem = Omit<TrackingItem, 'severity' | 'effectiveness' | 'impact'>

interface SocialTrackerProps {
  value: {
    activities: Array<{
      id: string
      name: string
      completed: boolean
      quality?: RatingValue
    }>
    notes: string | null
  }
  isEditing?: boolean
}

/**
 * SocialTracker Component
 * 
 * A component for tracking social activities and their quality.
 * Uses BaseTracker for core functionality while adding social-specific features.
 */
export function SocialTracker({ 
  value,
  isEditing = true
}: SocialTrackerProps) {
  // Convert activities to tracking items
  const trackingItems: TrackingItem[] = (value?.activities || []).map(activity => ({
    id: activity.id,
    name: activity.name,
    completed: activity.completed,
    quality: activity.quality,
    // Social activities only use quality rating
    severity: undefined,
    effectiveness: undefined,
    impact: undefined
  }))

  return (
    <BaseTracker
      title="Social Activities"
      items={trackingItems}
      notes={value?.notes ?? null}
      isEditing={isEditing}
      itemPlaceholder="Enter a social activity..."
      notesPlaceholder="Add any notes about these activities..."
      showQuality={true}
      sectionId="social"
    />
  )
} 