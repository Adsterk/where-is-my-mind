'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ErrorBoundary } from '@/components/ui'

interface UserPreferences {
  use_bipolar_scale: boolean
  notification_enabled: boolean
  reminder_time?: string
}

function SettingsContent() {
  const { toast } = useToast()
  const { supabase, auth } = useSupabase()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    use_bipolar_scale: false,
    notification_enabled: false
  })
  const [loading, setLoading] = useState(true)

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load preferences when user is available and component is mounted
  useEffect(() => {
    if (mounted && auth.user) {
      loadUserPreferences()
    }
  }, [mounted, auth.user])

  const loadUserPreferences = async () => {
    if (!auth.user) return

    try {
      setLoading(true)
      
      // Load theme from profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', auth.user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Error loading profile:', profileError)
        // Don't throw here, continue loading preferences
      } else if (profile?.theme) {
        setTheme(profile.theme)
      }

      // Then try to get existing preferences
      const { data: existingPrefs, error: selectError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', auth.user.id)
        .maybeSingle()

      if (selectError && selectError.code === 'PGRST204') {
        // Preferences don't exist, create them
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert([
            {
              user_id: auth.user.id,
              use_bipolar_scale: false,
              notification_enabled: false
            }
          ])
          .select()
          .single()

        if (insertError) throw insertError
        
        if (newPrefs) {
          setPreferences({
            use_bipolar_scale: newPrefs.use_bipolar_scale,
            notification_enabled: newPrefs.notification_enabled,
            reminder_time: newPrefs.reminder_time
          })
        }
      } else if (selectError) {
        throw selectError
      } else if (existingPrefs) {
        setPreferences({
          use_bipolar_scale: existingPrefs.use_bipolar_scale,
          notification_enabled: existingPrefs.notification_enabled,
          reminder_time: existingPrefs.reminder_time
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!auth.user) return

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: auth.user.id,
          [key]: value,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setPreferences(prev => ({ ...prev, [key]: value }))
      
      toast({
        title: "Settings Updated",
        description: `Successfully updated ${key.replace('_', ' ')}`
      })
    } catch (error) {
      console.error('Error updating preference:', error)
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      })
    }
  }

  const updateTheme = async (newTheme: string) => {
    if (!auth.user) return

    try {
      // Update theme immediately for better UX
      setTheme(newTheme)

      const { error } = await supabase
        .from('profiles')
        .update({ 
          theme: newTheme,
          updated_at: new Date().toISOString()
        })
        .eq('id', auth.user.id)

      if (error) throw error

      toast({
        title: "Theme Updated",
        description: `Theme set to ${newTheme}`
      })
    } catch (error) {
      console.error('Error updating theme:', error)
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive"
      })
      // Revert theme if update failed
      setTheme(theme)
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return null
  }

  // Show loading state while loading preferences
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => updateTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => updateTheme('dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => updateTheme('system')}
              >
                System
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Scale Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="bipolar-mode">Bipolar Scale</Label>
                <p className="text-sm text-muted-foreground">
                  Use depression/mania scale instead of standard 1-10
                </p>
              </div>
              <Switch
                id="bipolar-mode"
                checked={preferences.use_bipolar_scale}
                onCheckedChange={(checked) => updatePreference('use_bipolar_scale', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications">Daily Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily reminders to log your mood
                </p>
              </div>
              <Switch
                id="notifications"
                checked={preferences.notification_enabled}
                onCheckedChange={(checked) => updatePreference('notification_enabled', checked)}
              />
            </div>
            
            {preferences.notification_enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={preferences.reminder_time || '09:00'}
                  onChange={(e) => updatePreference('reminder_time', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  )
} 