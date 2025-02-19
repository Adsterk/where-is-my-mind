'use client'

import { BaseTracker } from './BaseTracker'
import type { TrackingItem, RatingValue } from '@/lib/types/entries'

type SkillItem = Omit<TrackingItem, 'severity' | 'quality' | 'impact'>

interface SkillsTrackerProps {
  value: {
    skills: Array<{
      id: string
      name: string
      completed: boolean
      effectiveness?: RatingValue
    }>
    notes: string | null
  }
  isEditing?: boolean
}

/**
 * SkillsTracker Component
 * 
 * A component for tracking coping skills and their effectiveness.
 * Uses BaseTracker for core functionality while adding skills-specific features.
 */
export function SkillsTracker({ 
  value,
  isEditing = true
}: SkillsTrackerProps) {
  // Convert skills to tracking items
  const trackingItems: TrackingItem[] = (value?.skills || []).map(skill => ({
    id: skill.id,
    name: skill.name,
    completed: skill.completed,
    effectiveness: skill.effectiveness,
    // Skills only use effectiveness rating
    severity: undefined,
    quality: undefined,
    impact: undefined
  }))

  return (
    <BaseTracker
      title="Skills Tracker"
      items={trackingItems}
      notes={value?.notes ?? null}
      isEditing={isEditing}
      itemPlaceholder="Enter a coping skill..."
      notesPlaceholder="Add any notes about these skills..."
      showEffectiveness={true}
      sectionId="skills"
    />
  )
} 