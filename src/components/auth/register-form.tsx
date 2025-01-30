'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface RegisterFormProps {
  supabaseClient?: SupabaseClient;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterForm({ supabaseClient }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const { supabase: defaultClient } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  const client = supabaseClient || defaultClient

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}
    let isValid = true

    if (!email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format'
      isValid = false
    }

    if (!password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required'
      isValid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await client.auth.signUp({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('network')) {
          throw new Error('Network error')
        }
        throw error
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      const errorMessage = error.message === 'Network error'
        ? 'Network error'
        : 'Failed to create account'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Sign Up</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {errors.general && (
          <div className="text-sm text-red-500">{errors.general}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign up'}
        </Button>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
} 