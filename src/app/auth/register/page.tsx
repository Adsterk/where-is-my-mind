import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Register | Mood Tracker',
  description: 'Create a new Mood Tracker account',
}

export default function RegisterPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <RegisterForm />
    </div>
  )
} 