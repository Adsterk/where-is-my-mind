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

interface UserPreferences {
  use_bipolar_scale: boolean
  notification_enabled: boolean
  reminder_time?: string
  theme: 'light' | 'dark' | 'system'
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { supabase, user } = useSupabase()
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    use_bipolar_scale: false,
    notification_enabled: false,
    theme: 'system'
  })
  const [loading, setLoading] = useState(true)

  // Handle mounting
  useEffect(() => {
    setMounted(true)
    // Set initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme-preference')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [setTheme])

  // Load preferences when user is available
  useEffect(() => {
    if (user) {
      loadUserPreferences()
    }
  }, [user])

  // Sync theme with preferences
  useEffect(() => {
    if (mounted && preferences.theme) {
      setTheme(preferences.theme)
    }
  }, [mounted, preferences.theme, setTheme])

  const loadUserPreferences = async () => {
    try {
      // First try to get existing preferences
      const { data: existingPrefs, error: selectError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (selectError && selectError.code === 'PGRST204') {
        // Preferences don't exist, create them
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert([
            {
              user_id: user?.id,
              theme: 'system',
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
            theme: newPrefs.theme || 'system',
            reminder_time: newPrefs.reminder_time
          })
          setTheme(newPrefs.theme || 'system')
        }
      } else if (selectError) {
        throw selectError
      } else if (existingPrefs) {
        setPreferences({
          use_bipolar_scale: existingPrefs.use_bipolar_scale,
          notification_enabled: existingPrefs.notification_enabled,
          theme: existingPrefs.theme || 'system',
          reminder_time: existingPrefs.reminder_time
        })
        setTheme(existingPrefs.theme || 'system')
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

  // Add the updatePreference function
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    try {
      // Handle theme updates immediately for better UX
      if (key === 'theme') {
        setTheme(value as string)
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
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
      // Revert theme if update failed
      if (key === 'theme') {
        setTheme(preferences.theme)
      }
    }
  }

  // Update theme handling to use profiles table
  const updateTheme = async (newTheme: string) => {
    try {
      // Update theme immediately for better UX
      setTheme(newTheme)

      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user?.id)

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
      setTheme(preferences.theme)
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
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

      <Card>
        <CardHeader>
          <CardTitle>Theme Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {(['light', 'dark', 'system'] as const).map((themeOption) => (
              <Button
                key={themeOption}
                variant={theme === themeOption ? 'default' : 'outline'}
                onClick={() => updateTheme(themeOption)}
                className="capitalize"
              >
                {themeOption}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Current theme: {theme} 
            {theme === 'system' && ` (${resolvedTheme || systemTheme})`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 