import {
  validateAndSanitizeInput,
  sanitizeHtml,
  sanitizeObject,
  loginSchema,
  registerSchema,
  moodEntrySchema,
  emailSchema,
  passwordSchema,
} from '../validation'

describe('Input Validation and Sanitization', () => {
  describe('HTML Sanitization', () => {
    it('removes HTML tags from input', () => {
      const input = '<script>alert("xss")</script><p>Hello</p>'
      const sanitized = sanitizeHtml(input)
      expect(sanitized).toBe('alert("xss")Hello')
    })

    it('handles nested objects with HTML content', () => {
      const input = {
        name: '<p>John</p>',
        details: {
          bio: '<script>alert("xss")</script>Developer',
        },
      }
      const sanitized = sanitizeObject(input)
      expect(sanitized).toEqual({
        name: 'John',
        details: {
          bio: 'alert("xss")Developer',
        },
      })
    })
  })

  describe('Email Validation', () => {
    it('validates correct email format', async () => {
      const result = await validateAndSanitizeInput(emailSchema, 'test@example.com')
      expect(result.success).toBe(true)
    })

    it('rejects invalid email format', async () => {
      const result = await validateAndSanitizeInput(emailSchema, 'invalid-email')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid email format')
    })
  })

  describe('Password Validation', () => {
    it('validates strong password', async () => {
      const result = await validateAndSanitizeInput(passwordSchema, 'StrongPass123!')
      expect(result.success).toBe(true)
    })

    it('rejects weak password', async () => {
      const result = await validateAndSanitizeInput(passwordSchema, 'weak')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Password must be at least 8 characters')
    })
  })

  describe('Login Schema Validation', () => {
    it('validates correct login data', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      }
      const result = await validateAndSanitizeInput(loginSchema, loginData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(loginData)
    })

    it('rejects invalid login data', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'weak',
      }
      const result = await validateAndSanitizeInput(loginSchema, loginData)
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Register Schema Validation', () => {
    it('validates correct registration data', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
      }
      const result = await validateAndSanitizeInput(registerSchema, registerData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(registerData)
    })

    it('rejects mismatched passwords', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        confirmPassword: 'DifferentPass123!',
      }
      const result = await validateAndSanitizeInput(registerSchema, registerData)
      expect(result.success).toBe(false)
      expect(result.error).toBe("Passwords don't match")
    })
  })

  describe('Mood Entry Schema Validation', () => {
    it('validates correct mood entry data', async () => {
      const moodData = {
        mood_score: 7,
        is_bipolar: false,
        notes: 'Feeling good today',
        tracking_data: {
          meditation: true,
          exercise: false,
        },
        date: new Date().toISOString(),
      }
      const result = await validateAndSanitizeInput(moodEntrySchema, moodData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(moodData)
    })

    it('rejects invalid mood score', async () => {
      const moodData = {
        mood_score: 11, // Invalid: should be 1-10
        is_bipolar: false,
        date: new Date().toISOString(),
      }
      const result = await validateAndSanitizeInput(moodEntrySchema, moodData)
      expect(result.success).toBe(false)
    })

    it('sanitizes HTML in notes', async () => {
      const moodData = {
        mood_score: 7,
        is_bipolar: false,
        notes: '<script>alert("xss")</script>Feeling good today',
        date: new Date().toISOString(),
      }
      const result = await validateAndSanitizeInput(moodEntrySchema, moodData)
      expect(result.success).toBe(true)
      expect(result.data?.notes).toBe('alert("xss")Feeling good today')
    })
  })
}) 