'use client'

import { BaseTracker } from './BaseTracker'
import type { TrackingItem, SeverityValue } from '@/lib/types/entries'

type BehaviorItem = Omit<TrackingItem, 'effectiveness' | 'quality' | 'impact'>

interface BehaviorTrackerProps {
  value: {
    behaviors: Array<{
      id: string
      name: string
      completed: boolean
      severity?: SeverityValue
    }>
    notes: string | null
  }
  isEditing?: boolean
}

/**
 * BehaviorTracker Component
 * 
 * A component for tracking problematic behaviors and their severity.
 * Uses BaseTracker for core functionality while adding behavior-specific features.
 */
export function BehaviorTracker({ 
  value,
  isEditing = true
}: BehaviorTrackerProps) {
  // Convert behaviors to tracking items
  const trackingItems: TrackingItem[] = (value?.behaviors || []).map(behavior => ({
    id: behavior.id,
    name: behavior.name,
    completed: behavior.completed,
    severity: behavior.severity,
    // Behaviors only use severity rating
    effectiveness: undefined,
    quality: undefined,
    impact: undefined
  }))

  return (
    <BaseTracker
      title="Behavior Tracker"
      items={trackingItems}
      notes={value?.notes ?? null}
      isEditing={isEditing}
      itemPlaceholder="Enter a behavior to track..."
      notesPlaceholder="Add any notes about these behaviors..."
      showSeverity={true}
      sectionId="behaviors"
    />
  )
} 