'use client'

import { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface ResetPasswordFormProps {
  supabaseClient?: SupabaseClient;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export function ResetPasswordForm({ supabaseClient }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const { supabase: defaultClient } = useSupabase()
  const { toast } = useToast()

  const client = supabaseClient || defaultClient

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
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

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsSuccess(false)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await client.auth.resetPasswordForEmail(email)

      if (error) {
        if (error.message.includes('network')) {
          throw new Error('Network error')
        }
        throw error
      }

      setIsSuccess(true)
      toast({
        title: 'Success',
        description: 'Check your email for the password reset link',
      })
    } catch (error: any) {
      const errorMessage = error.message === 'Network error'
        ? 'Network error'
        : 'Failed to send reset link'
      
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
        <h1 className="text-2xl font-semibold">Reset Password</h1>
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

        {errors.general && (
          <div className="text-sm text-red-500">{errors.general}</div>
        )}

        {isSuccess && (
          <div className="text-sm text-green-500">
            Check your email for the password reset link
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        <div className="text-center text-sm">
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
} 