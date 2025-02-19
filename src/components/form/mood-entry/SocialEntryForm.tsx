'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { SocialTracker } from './SocialTracker'
import type { SocialEntry } from '@/lib/types/entries'

const defaultSocialEntry: SocialEntry = {
  activities: [],
  notes: ''
}

export function SocialEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (!formDraft.formData.socialActivities) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          socialActivities: defaultSocialEntry.activities,
          socialNotes: defaultSocialEntry.notes || ''
        }
      }))
    }
  }, [])

  return (
    <Card>
      <SocialTracker 
        value={{
          activities: formDraft.formData.socialActivities || [],
          notes: formDraft.formData.socialNotes
        }}
      />
    </Card>
  )
} 