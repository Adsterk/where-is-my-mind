import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Login | Mood Tracker',
  description: 'Login to your Mood Tracker account',
}

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-12">
      <LoginForm />
    </div>
  )
} 