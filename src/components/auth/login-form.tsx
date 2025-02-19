'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const { supabase } = useSupabase()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

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
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      toast({
        title: 'Success',
        description: 'You have successfully signed in.',
      })

      // Get the redirect URL from query parameters or default to dashboard
      const redirectedFrom = searchParams.get('redirectedFrom')
      const redirectTo = redirectedFrom && !redirectedFrom.startsWith('/auth/')
        ? redirectedFrom
        : '/dashboard'

      // Use replace to prevent back button issues
      router.replace(redirectTo)
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : 'An error occurred during sign in'
      
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
            disabled={isLoading}
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
            disabled={isLoading}
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
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
              href="/auth/signup" 
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