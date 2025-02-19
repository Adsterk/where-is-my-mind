'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { BehaviorTracker } from './BehaviorTracker'

interface BehaviorEntry {
  behaviors: Array<{
    id: string
    name: string
    completed: boolean
    severity?: 'mild' | 'moderate' | 'severe'
  }>
  notes: string | null
}

const defaultBehaviorEntry: BehaviorEntry = {
  behaviors: [],
  notes: ''
}

export function BehaviorEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (!formDraft.formData.behaviors) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          behaviors: defaultBehaviorEntry.behaviors,
          behaviorNotes: defaultBehaviorEntry.notes || ''
        }
      }))
    }
  }, [])

  return (
    <Card>
      <BehaviorTracker 
        value={{
          behaviors: formDraft.formData.behaviors || [],
          notes: formDraft.formData.behaviorNotes
        }}
      />
    </Card>
  )
} 