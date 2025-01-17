'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

interface UserSettings {
  theme: string
  email: string
  name: string | null
  use_bipolar_scale: boolean
}

export function UserSettingsForm() {
  const { supabase, user } = useSupabase()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [settings, setSettings] = useState<UserSettings>({
    theme: theme || 'system',
    email: user?.email || '',
    name: user?.user_metadata?.name || '',
    use_bipolar_scale: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserSettings()
    }
  }, [user])

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single()

      if (error) throw error

      if (data) {
        setSettings(prev => ({
          ...prev,
          use_bipolar_scale: data.use_bipolar_scale,
          theme: data.theme || theme,
          name: user?.user_metadata?.name || ''
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user!.id,
          use_bipolar_scale: settings.use_bipolar_scale,
          theme: settings.theme
        })

      if (updateError) throw updateError

      const { error: profileError } = await supabase.auth.updateUser({
        data: { name: settings.name }
      })

      if (profileError) throw profileError

      setTheme(settings.theme)
      toast({
        title: "Success",
        description: "Settings updated successfully"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={settings.name || ''}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="bipolar-scale"
              checked={settings.use_bipolar_scale}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, use_bipolar_scale: checked })
              }
            />
            <Label htmlFor="bipolar-scale">Use Bipolar Scale</Label>
          </div>

          <Button type="submit">Save Changes</Button>
        </CardContent>
      </Card>
    </form>
  )
} 