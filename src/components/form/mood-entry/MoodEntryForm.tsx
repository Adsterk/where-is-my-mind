'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MoodScore } from './MoodScore'
import type { MoodEntryFormProps } from './types'

export function MoodEntryForm({ value, onUpdate, isEditing = true }: MoodEntryFormProps) {
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...value,
      notes: e.target.value || null
    })
  }

  return (
    <Card>
      <MoodScore value={value} onUpdate={onUpdate} />
      
      <div className="px-6 pb-6 space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={value.notes || ''}
          onChange={handleNotesChange}
          placeholder="Add any notes about your mood..."
          disabled={!isEditing}
        />
      </div>
    </Card>
  )
} 