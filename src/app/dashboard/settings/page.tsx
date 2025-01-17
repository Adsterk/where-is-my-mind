'use client'

import { UserSettingsForm } from '@/components/forms/UserSettingsForm'

export default function SettingsPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <UserSettingsForm />
    </div>
  )
} 