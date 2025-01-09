'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import type { NewMoodEntry } from '@/lib/types/mood'

export function MoodEntryForm() {
  const supabase = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [moodScore, setMoodScore] = useState(5)
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const entry = {
        user_id: user.id,
        mood_score: moodScore,
        notes: notes || null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      const { error: submitError } = await supabase
        .from('mood_entries')
        .insert(entry)

      if (submitError) {
        throw submitError
      }

      // Reset form on success
      setMoodScore(5)
      setNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mood Score: {moodScore}
            </label>
            <Slider
              value={[moodScore]}
              onValueChange={([value]) => setMoodScore(value)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day? What made you feel this way?"
              className="min-h-[100px]"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Mood Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 