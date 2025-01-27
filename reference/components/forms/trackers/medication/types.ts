import type { EntryWithType } from '@/types/entries'

export interface Medication {
  id: string
  name: string
  dosage?: string
  schedule: MedicationSchedule
  is_custom?: boolean
}

export interface MedicationEntry {
  medication_id: string
  time_taken: string
  notes?: string
  side_effects?: string
  effectiveness: 'none' | 'mild' | 'moderate' | 'significant'
}

export type TypedMedicationEntry = EntryWithType<'medication', MedicationEntry>

export type MedicationSchedule = 'as_needed' | 'daily' | 'weekly'

export interface NewMedicationState {
  name: string
  dosage: string
  schedule: MedicationSchedule
}

export interface MedicationTrackerProps {
  items: Medication[]
  entries: TypedMedicationEntry[]
  onUpdate: (items: Medication[], entries: TypedMedicationEntry[]) => void
  onNewMedication?: (medication: Omit<Medication, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing: boolean
}
