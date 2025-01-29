import { z } from 'zod'

// Mood and Notes validation schema
export const moodAndNotesSchema = z.object({
  mood_score: z.number().min(0).max(10),
  notes: z.string().nullable(),
  is_bipolar_scale: z.boolean()
})

// Sleep validation schema
export const sleepSchema = z.object({
  sleep_hours: z.number().min(0).max(24),
  sleep_quality: z.string().nullable()
})

// Social Connections validation schemas
export const socialConnectionSchema = z.object({
  connection_id: z.string(),
  quality_rating: z.number().min(0).max(10),
  impact_rating: z.number().min(0).max(10),
  notes: z.string().optional()
})

export const socialConnectionsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string()
  })),
  entries: z.array(socialConnectionSchema)
})

// Form sections validation schema
export const formSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  component: z.string()
})

export const formSectionsSchema = z.array(formSectionSchema)

// User preferences validation schema
export const userPreferencesSchema = z.object({
  use_bipolar_scale: z.boolean(),
  form_sections: formSectionsSchema
})

// Helper function to validate form data
export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

export function validateRating(value: number): number {
  if (typeof value !== 'number') throw new Error('Rating must be a number')
  if (value < 0 || value > 10) throw new Error('Rating must be between 0 and 10')
  return value
}

export function sanitizeText(text: string | null | undefined): string | null {
  if (!text) return null
  return text.trim().slice(0, 1000) // Limit to 1000 characters
} 