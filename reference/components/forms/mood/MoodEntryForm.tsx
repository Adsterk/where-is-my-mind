'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { MoodAndNotesTracker, type MoodAndNotesEntry } from './MoodAndNotesTracker'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function MoodEntryForm() {
  const { supabase, user } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [entry, setEntry] = useState<MoodAndNotesEntry>({
    mood_score: 5,
    notes: '',
    is_bipolar_scale: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: entry.mood_score,
          notes: entry.notes,
          is_bipolar_scale: entry.is_bipolar_scale,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Mood entry saved successfully"
      })

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Failed to save mood entry:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save mood entry",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <form onSubmit={handleSubmit}>
      <MoodAndNotesTracker 
        value={entry}
        onUpdate={setEntry}
      />
      <CardContent className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Entry'}
        </Button>
      </CardContent>
    </form>
  )
} 