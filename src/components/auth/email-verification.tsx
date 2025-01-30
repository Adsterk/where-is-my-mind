'use client'

import { useState, useEffect } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface EmailVerificationProps {
  email?: string;
  supabaseClient?: SupabaseClient;
}

export function EmailVerification({ email, supabaseClient }: EmailVerificationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { supabase: defaultClient } = useSupabase()
  const { toast } = useToast()

  const client = supabaseClient || defaultClient

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResendEmail = async () => {
    if (!email) {
      setError('Email address is missing')
      return
    }

    if (cooldown > 0) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Generate a random password for the resend - it won't be used since we're just triggering a new verification email
      const tempPassword = Math.random().toString(36).slice(-8)
      
      const { error } = await client.auth.signUp({
        email,
        password: tempPassword,
      })

      if (error) {
        if (error.message.includes('network')) {
          throw new Error('Network error')
        }
        throw error
      }

      setSuccess(true)
      setCooldown(60) // 1 minute cooldown
      toast({
        title: 'Success',
        description: 'Verification email has been resent',
      })
    } catch (error: any) {
      const errorMessage = error.message === 'Network error'
        ? 'Network error'
        : 'Failed to resend verification email'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Verify Your Email</h1>
          <p className="text-red-500 mt-4">Email address is missing</p>
        </div>
        <Button disabled className="w-full">
          Resend Email
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Verify Your Email</h1>
        <p className="mt-4">
          A verification link has been sent to<br />
          <span className="font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-500 text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-500 text-center">
          Verification email has been resent
        </div>
      )}

      <div className="space-y-4">
        <Button
          onClick={handleResendEmail}
          className="w-full"
          disabled={isLoading || cooldown > 0}
        >
          {isLoading ? 'Sending...' : cooldown > 0 ? `Please wait (${cooldown}s)` : 'Resend Email'}
        </Button>

        <div className="text-center text-sm">
          <Link 
            href="/auth/login" 
            className="text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
} 