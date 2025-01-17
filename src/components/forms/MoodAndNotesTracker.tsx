'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CardContent } from '@/components/ui/card'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export interface MoodAndNotesEntry {
  mood_score: number
  notes: string | null
  is_bipolar_scale: boolean
}

interface MoodAndNotesTrackerProps {
  value: MoodAndNotesEntry
  onUpdate: (data: MoodAndNotesEntry) => void
}

export function MoodAndNotesTracker({ value, onUpdate }: MoodAndNotesTrackerProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    loadUserPreferences()
  }, [user])

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('use_bipolar_scale')
        .single()

      if (error) throw error

      if (data) {
        onUpdate({
          ...value,
          is_bipolar_scale: data.use_bipolar_scale
        })
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive"
      })
    }
  }

  const handleMoodChange = (values: number[]) => {
    onUpdate({
      ...value,
      mood_score: values[0]
    })
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...value,
      notes: e.target.value
    })
  }

  const handleBipolarToggle = async (checked: boolean) => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ use_bipolar_scale: checked })
        .eq('user_id', user.id)

      if (error) throw error

      onUpdate({
        ...value,
        is_bipolar_scale: checked
      })
    } catch (error) {
      console.error('Failed to update preference:', error)
      toast({
        title: "Error",
        description: "Failed to update preference",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Mood Scale Type</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={value.is_bipolar_scale}
              onCheckedChange={handleBipolarToggle}
              disabled={isSaving || !user}
            />
            <span className="text-sm text-muted-foreground">
              {value.is_bipolar_scale ? 'Bipolar' : 'Standard'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>
          Mood Score: {value.mood_score}
        </Label>
        <div>
          <Slider
            value={[value.mood_score]}
            onValueChange={handleMoodChange}
            max={10}
            step={1}
            className={cn(
              value.is_bipolar_scale && "slider-bipolar"
            )}
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          {value.is_bipolar_scale ? (
            <>
              <span>Depressed</span>
              <span>Neutral</span>
              <span>Manic</span>
            </>
          ) : (
            <>
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very Good</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={value.notes || ''}
          onChange={handleNotesChange}
          placeholder="Add any notes about your mood..."
        />
      </div>
    </CardContent>
  )
} 