import { SupabaseClient } from '@supabase/supabase-js'

// Common Types
export interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

// Component Props Types
export interface LoginFormProps {
  supabaseClient?: SupabaseClient
}

export interface RegisterFormProps {
  supabaseClient?: SupabaseClient
}

export interface ResetPasswordFormProps {
  supabaseClient?: SupabaseClient
}

export interface UpdatePasswordFormProps {
  supabaseClient?: SupabaseClient
}

export interface EmailVerificationProps {
  supabaseClient?: SupabaseClient
  email?: string
}

// Form State Types
export interface AuthFormState {
  email: string
  password: string
  confirmPassword?: string
  isLoading: boolean
  errors: FormErrors
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: FormErrors
}

// Auth Response Types
export interface AuthResponse {
  success: boolean
  message: string
  error?: string
}
