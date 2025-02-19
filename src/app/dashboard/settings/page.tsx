'use client'

import { UserPreferences } from '@/components/settings/UserPreferences'
import { DataManagement } from '@/components/settings/DataManagement'
import { AccountSettings } from '@/components/settings/AccountSettings'

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          <UserPreferences />
          <DataManagement />
          <AccountSettings />
        </div>
      </div>
    </div>
  )
} 