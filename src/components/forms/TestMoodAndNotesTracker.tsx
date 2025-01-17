'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { CardContent } from '@/components/ui/card'

export interface TestMoodAndNotesEntry {
  mood_score: number
  notes: string | null
  is_bipolar_scale: boolean
}

interface TestMoodAndNotesTrackerProps {
  value: TestMoodAndNotesEntry
  onUpdate: (data: TestMoodAndNotesEntry) => void
}

export function TestMoodAndNotesTracker({ value, onUpdate }: TestMoodAndNotesTrackerProps) {
  const handleMoodChange = (values: number[]) => {
    onUpdate({
      ...value,
      mood_score: values[0]
    })
  }

  const handleNotesChange = (notes: string) => {
    onUpdate({
      ...value,
      notes: notes.trim() || null
    })
  }

  const handleBipolarToggle = (checked: boolean) => {
    onUpdate({
      ...value,
      is_bipolar_scale: checked
    })
  }

  const getMoodDescription = (score: number, isBipolar: boolean) => {
    if (!isBipolar) {
      return `(${score}/10)`
    }

    if (score === 5) return '(Balanced)'
    if (score < 5) return `(Depression Level ${score})`
    return `(Mania Level ${score})`
  }

  return (
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="bipolar-toggle" className="text-sm font-medium">
          Use Bipolar Scale
        </Label>
        <Switch
          id="bipolar-toggle"
          checked={value.is_bipolar_scale}
          onCheckedChange={handleBipolarToggle}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mood-slider">
          How are you feeling today? {getMoodDescription(value.mood_score, value.is_bipolar_scale)}
        </Label>
        {value.is_bipolar_scale && (
          <div className="grid grid-cols-3 text-sm text-muted-foreground mb-2">
            <div>Depression</div>
            <div className="text-center">Balanced</div>
            <div className="text-right">Mania</div>
          </div>
        )}
        <Slider
          id="mood-slider"
          min={0}
          max={10}
          step={1}
          value={[value.mood_score]}
          onValueChange={handleMoodChange}
          className={value.is_bipolar_scale ? 'mt-6' : ''}
        />
        {value.is_bipolar_scale && (
          <div className="text-sm text-muted-foreground mt-2">
            {value.mood_score === 5 ? (
              'You are feeling balanced and stable'
            ) : value.mood_score < 5 ? (
              'Lower scores indicate depression symptoms'
            ) : (
              'Higher scores indicate mania symptoms'
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about your mood..."
          value={value.notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
      </div>
    </CardContent>
  )
} 