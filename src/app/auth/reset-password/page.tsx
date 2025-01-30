import { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password | Mood Tracker',
  description: 'Reset your Mood Tracker account password',
}

export default function ResetPasswordPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <ResetPasswordForm />
    </div>
  )
} 