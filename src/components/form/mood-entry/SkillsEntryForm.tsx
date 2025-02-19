'use client'

import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useLocalStore } from '@/lib/stores/localStore'
import { SkillsTracker } from './SkillsTracker'
import type { SkillsEntry } from '@/lib/types/entries'

const defaultSkillsEntry: SkillsEntry = {
  skills: [],
  notes: ''
}

export function SkillsEntryForm() {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Initialize default values if not in draft
  useEffect(() => {
    if (!formDraft.formData.skills) {
      setFormDraft(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          skills: defaultSkillsEntry.skills,
          skillsNotes: defaultSkillsEntry.notes || ''
        }
      }))
    }
  }, [])

  return (
    <Card>
      <SkillsTracker 
        value={{
          skills: formDraft.formData.skills || [],
          notes: formDraft.formData.skillsNotes
        }}
      />
    </Card>
  )
} 