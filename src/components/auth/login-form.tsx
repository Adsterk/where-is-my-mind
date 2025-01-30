'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface LoginFormProps {
  supabaseClient?: SupabaseClient;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm({ supabaseClient }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const { supabase: defaultClient } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
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

    if (!password) {
      newErrors.password = 'Password is required'
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
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('network')) {
          throw new Error('Network error')
        }
        throw error
      }

      // Get the redirect URL from query parameters or default to dashboard
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      router.push(redirectTo)
      
      toast({
        title: 'Success',
        description: 'You have successfully signed in.',
      })
    } catch (error: any) {
      const errorMessage = error.message === 'Network error'
        ? 'Network error'
        : 'Invalid login credentials'
      
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
        <h1 className="text-2xl font-semibold">Sign In</h1>
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

        {errors.general && (
          <div className="text-sm text-red-500">{errors.general}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="space-y-2 text-center text-sm">
          <div>
            <Link 
              href="/auth/reset-password" 
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div>
            Don't have an account?{' '}
            <Link 
              href="/auth/register" 
              className="text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
} 