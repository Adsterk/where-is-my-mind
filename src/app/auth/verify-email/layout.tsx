import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verify Email | Mood Tracker',
  description: 'Verify your email address for your Mood Tracker account',
}

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 