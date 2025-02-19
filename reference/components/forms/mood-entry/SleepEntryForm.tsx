'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { SleepScore } from './SleepScore'

interface SleepEntry {
  hours: number;
  notes: string;
}

const defaultSleepEntry: SleepEntry = {
  hours: 7,
  notes: ''
}

export function SleepEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (formDraft.formData.sleepHours === undefined) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          sleepHours: defaultSleepEntry.hours,
          sleepNotes: defaultSleepEntry.notes
        }
      }))
    }
  }, [])

  const handleHoursChange = (hours: number) => {
    setFormDraft(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        sleepHours: hours
      }
    }))
  }

  const handleNotesChange = (notes: string) => {
    setFormDraft(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        sleepNotes: notes
      }
    }))
  }

  return (
    <Card>
      <SleepScore 
        hours={formDraft.formData.sleepHours}
        notes={formDraft.formData.sleepNotes}
        onHoursChange={handleHoursChange}
        onNotesChange={handleNotesChange}
      />
    </Card>
  )
} 