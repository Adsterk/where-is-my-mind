'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { MoodScore } from './MoodScore'

interface MoodEntry {
  score: number;
  bipolarMode: boolean;
  notes: string;
}

const defaultMoodEntry: MoodEntry = {
  score: 5,
  bipolarMode: false,
  notes: ''
}

export function MoodScoreEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (formDraft.formData.moodScore === undefined) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          moodScore: defaultMoodEntry.score,
          isBipolarMode: defaultMoodEntry.bipolarMode,
          moodNotes: defaultMoodEntry.notes
        }
      }))
    }
  }, [])

  const handleScoreChange = (score: number) => {
    setFormDraft(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        moodScore: score
      }
    }))
  }

  const handleBipolarToggle = (bipolarMode: boolean) => {
    setFormDraft(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        isBipolarMode: bipolarMode
      }
    }))
  }

  const handleNotesChange = (notes: string) => {
    setFormDraft(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        moodNotes: notes
      }
    }))
  }

  return (
    <Card className="border-0 shadow-none lg:border lg:shadow-sm">
      <MoodScore 
        score={formDraft.formData.moodScore}
        bipolarMode={formDraft.formData.isBipolarMode}
        notes={formDraft.formData.moodNotes}
        onScoreChange={handleScoreChange}
        onBipolarToggle={handleBipolarToggle}
        onNotesChange={handleNotesChange}
      />
    </Card>
  )
} 