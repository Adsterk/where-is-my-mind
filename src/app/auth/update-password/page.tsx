import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export const metadata: Metadata = {
  title: 'Update Password | Mood Tracker',
  description: 'Set a new password for your Mood Tracker account',
}

export default function UpdatePasswordPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <UpdatePasswordForm />
    </div>
  )
} 