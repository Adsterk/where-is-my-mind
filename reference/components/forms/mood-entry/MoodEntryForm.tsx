'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { useSupabase } from '@/components/providers'
import { useLocalStore } from '@/lib/stores/localStore'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useFormInitialization } from '@/lib/hooks/form/useFormInitialization'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { MoodScoreEntryForm } from './MoodScoreEntryForm'
import { SleepEntryForm } from './SleepEntryForm'
import { MedicationEntryForm } from './MedicationEntryForm'
import { BehaviorEntryForm } from './BehaviorEntryForm'
import { SkillsEntryForm } from './SkillsEntryForm'
import { SocialEntryForm } from './SocialEntryForm'
import { SelfCareEntryForm } from './SelfCareEntryForm'

function MoodEntryFormComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase, user } = useSupabase()
  const { formDraft, clearFormDraft, setFormDraft } = useLocalStore()
  const { isLoading: isInitializing, error: initError } = useFormInitialization()
  const [error, setError] = useState<Error | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset all form components except preserved fields
  const resetForm = useCallback(() => {
    // Reset form draft while preserving specific fields
    setFormDraft(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        moodScore: 5,
        moodNotes: '',
        sleepHours: 7,
        sleepNotes: '',
        medications: prev.formData.medications.map(med => ({ ...med, completed: false })),
        behaviors: prev.formData.behaviors.map(item => ({ ...item, completed: false, severity: undefined })),
        skills: prev.formData.skills.map(item => ({ ...item, completed: false, effectiveness: undefined })),
        socialActivities: prev.formData.socialActivities.map(item => ({ ...item, completed: false, quality: undefined })),
        selfCareActivities: prev.formData.selfCareActivities.map(item => ({ ...item, completed: false, impact: undefined })),
        medicationNotes: '',
        behaviorNotes: '',
        skillsNotes: '',
        socialNotes: '',
        selfCareNotes: ''
      }
    }))

    toast({
      title: "Form Reset",
      description: "All items and ratings have been reset to their default state."
    })
  }, [setFormDraft, toast])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isSubmitting) return

    setIsSubmitting(true)
    try {
      const today = new Date().toLocaleDateString('en-CA')
      
      // First check if an entry exists for today
      const { data: existingEntry } = await supabase
        .from('daily_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      const entryData = {
        user_id: user.id,
        date: today,
        mood_score: formDraft.formData.moodScore,
        is_bipolar: formDraft.formData.isBipolarMode,
        tracking_data: {
          mood: {
            notes: formDraft.formData.moodNotes
          },
          sleep: {
            hours: formDraft.formData.sleepHours,
            notes: formDraft.formData.sleepNotes
          },
          medications: {
            items: formDraft.formData.medications,
            notes: formDraft.formData.medicationNotes
          },
          behaviors: {
            items: formDraft.formData.behaviors,
            notes: formDraft.formData.behaviorNotes
          },
          skills: {
            items: formDraft.formData.skills,
            notes: formDraft.formData.skillsNotes
          },
          social: {
            items: formDraft.formData.socialActivities,
            notes: formDraft.formData.socialNotes
          },
          selfCare: {
            items: formDraft.formData.selfCareActivities,
            notes: formDraft.formData.selfCareNotes
          }
        },
        updated_at: new Date().toISOString()
      }

      let submitError
      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('daily_entries')
          .update(entryData)
          .eq('id', existingEntry.id)
        submitError = error
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('daily_entries')
          .insert({
            ...entryData,
            created_at: new Date().toISOString()
          })
        submitError = error
      }

      if (submitError) throw submitError
      
      toast({
        title: "Success!",
        description: "Your mood entry has been saved."
      })
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Failed to save mood entry:', error)
      setError(error)
      toast({
        title: "Error",
        description: error.message || "Failed to save mood entry",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [user, isSubmitting, formDraft, supabase, toast, router])

  if (isInitializing) {
    return <LoadingScreen message="Loading form..." />
  }

  if (initError || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">
            {initError?.message || error?.message || "An error occurred"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 lg:px-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Daily Mood Entry</h1>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          className="ml-4"
        >
          Reset Form
        </Button>
      </div>

      <div className="space-y-4">
        <MoodScoreEntryForm />
        <SleepEntryForm />
        <MedicationEntryForm />
        <BehaviorEntryForm />
        <SkillsEntryForm />
        <SocialEntryForm />
        <SelfCareEntryForm />
      </div>

      <div className="flex justify-center lg:justify-end pb-20 lg:pb-6">
        <Button 
          type="submit" 
          size="lg"
          disabled={isSubmitting}
          className="min-w-[324px] lg:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Entry'
          )}
        </Button>
      </div>
    </form>
  )
}

export const MoodEntryForm = MoodEntryFormComponent 