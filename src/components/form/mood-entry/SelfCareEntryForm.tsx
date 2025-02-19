'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { SelfCareTracker } from './SelfCareTracker'
import type { SelfCareEntry } from '@/lib/types/entries'

const defaultSelfCareEntry: SelfCareEntry = {
  activities: [],
  notes: ''
}

export function SelfCareEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (!formDraft.formData.selfCareActivities) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          selfCareActivities: defaultSelfCareEntry.activities,
          selfCareNotes: defaultSelfCareEntry.notes || ''
        }
      }))
    }
  }, [])

  return (
    <Card>
      <SelfCareTracker 
        value={{
          activities: formDraft.formData.selfCareActivities || [],
          notes: formDraft.formData.selfCareNotes
        }}
      />
    </Card>
  )
} 