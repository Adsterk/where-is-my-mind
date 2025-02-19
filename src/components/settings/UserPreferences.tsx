'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

interface UserPreferencesData {
  use_bipolar_scale: boolean
}

export function UserPreferences() {
  const { toast } = useToast()
  const { supabase, user } = useSupabase()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferencesData>({
    use_bipolar_scale: false
  })
  const [loading, setLoading] = useState(true)

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load preferences when user is available and component is mounted
  useEffect(() => {
    if (mounted && user) {
      loadUserPreferences()
    }
  }, [mounted, user])

  const loadUserPreferences = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load theme from profile first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
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
        .eq('user_id', user.id)
        .maybeSingle()

      if (selectError && selectError.code === 'PGRST204') {
        // Preferences don't exist, create them
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert([
            {
              user_id: user.id,
              use_bipolar_scale: false
            }
          ])
          .select()
          .single()

        if (insertError) throw insertError
        
        if (newPrefs) {
          setPreferences({
            use_bipolar_scale: newPrefs.use_bipolar_scale
          })
        }
      } else if (selectError) {
        throw selectError
      } else if (existingPrefs) {
        setPreferences({
          use_bipolar_scale: existingPrefs.use_bipolar_scale
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

  const updatePreference = async <K extends keyof UserPreferencesData>(
    key: K,
    value: UserPreferencesData[K]
  ) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
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
    if (!user) return

    try {
      // Update theme immediately for better UX
      setTheme(newTheme)

      const { error } = await supabase
        .from('profiles')
        .update({ 
          theme: newTheme,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

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
      // Revert theme if update failed, using 'system' as fallback
      setTheme(theme ?? 'system')
    }
  }

  // Prevent hydration issues
  if (!mounted) {
    return null
  }

  if (loading) {
    return <LoadingScreen message="Loading preferences..." />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={theme}
            onValueChange={setTheme}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
} 