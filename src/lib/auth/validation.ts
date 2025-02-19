import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { PASSWORD_REGEX, EMAIL_REGEX } from '@/config/constants'

// Base schemas for common fields
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .regex(EMAIL_REGEX, 'Invalid email format')

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .regex(
    PASSWORD_REGEX,
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  )

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Mood entry schemas
export const moodEntrySchema = z.object({
  mood_score: z.number().min(1).max(10),
  is_bipolar: z.boolean(),
  notes: z.string().nullable().optional(),
  tracking_data: z.record(z.boolean()).optional(),
  date: z.string().datetime(),
})

// Utility functions for sanitization
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  })
}

export function sanitizeObject<T extends object>(obj: T): T {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key as keyof T] = sanitizeHtml(value) as T[keyof T]
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      acc[key as keyof T] = sanitizeObject(value) as T[keyof T]
    } else {
      acc[key as keyof T] = value
    }
    return acc
  }, {} as T)
}

// Validation functions
export async function validateAndSanitizeInput<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<{
  success: boolean
  data?: z.infer<T>
  error?: string
}> {
  try {
    // First sanitize if the input is an object
    const sanitizedData = typeof data === 'object' ? sanitizeObject(data as object) : data
    
    // Then validate with Zod schema
    const validatedData = await schema.parseAsync(sanitizedData)
    
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: 'Invalid input',
    }
  }
}

// Rate limit validation
export const rateLimitSchema = z.object({
  ip: z.string().ip(),
  route: z.string().min(1),
  timestamp: z.number(),
  count: z.number().min(0),
})

// CSRF token validation
export const csrfSchema = z.object({
  token: z.string().min(32).max(64),
})

// Session validation
export const sessionSchema = z.object({
  user_id: z.string().uuid(),
  expires_at: z.number(),
  refresh_token: z.string().optional(),
}) 