'use client'

import { useSearchParams } from 'next/navigation'
import { EmailVerification } from '@/components/auth/email-verification'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="container max-w-md mx-auto py-12">
      <EmailVerification email={email ?? undefined} />
    </div>
  )
} 