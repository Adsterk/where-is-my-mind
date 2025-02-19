'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { MedicationTracker } from './MedicationTracker'

interface MedicationEntry {
  medications: Array<{
    id: string
    name: string
    completed: boolean
  }>
  notes: string | null
}

const defaultMedicationEntry: MedicationEntry = {
  medications: [],
  notes: null
}

export function MedicationEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (!formDraft.formData.medications) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          medications: defaultMedicationEntry.medications,
          medicationNotes: defaultMedicationEntry.notes || ''
        }
      }))
    }
  }, [])

  return (
    <Card>
      <MedicationTracker 
        value={{
          medications: formDraft.formData.medications || [],
          notes: formDraft.formData.medicationNotes
        }}
      />
    </Card>
  )
} 