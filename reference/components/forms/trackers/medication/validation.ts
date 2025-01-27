import { z } from 'zod'
import type { TypedMedicationEntry, Medication } from './types'

export const medicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  dosage: z.string(),
  schedule: z.enum(['as_needed', 'daily', 'weekly']),
  is_custom: z.boolean()
})

export const medicationEntrySchema = z.object({
  type: z.literal('medication'),
  medication_id: z.string().uuid(),
  time_taken: z.string().datetime(),
  notes: z.string().optional(),
  side_effects: z.string().optional(),
  effectiveness: z.enum(['none', 'mild', 'moderate', 'significant'])
})

export function validateMedication(data: unknown): data is Medication {
  return medicationSchema.safeParse(data).success
}

export function validateMedicationEntry(data: unknown): data is TypedMedicationEntry {
  return medicationEntrySchema.safeParse(data).success
} 