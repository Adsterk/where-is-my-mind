'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useLocalStore } from '@/lib/stores/localStore'

interface TestMoodScoreProps {
  defaultValue?: number
  defaultBipolar?: boolean
  onScoreChange?: (value: number) => void
  onBipolarChange?: (value: boolean) => void
}

export function TestMoodScore({
  defaultValue = 5,
  defaultBipolar = false,
  onScoreChange,
  onBipolarChange
}: TestMoodScoreProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const isBipolar = formDraft.isBipolarMode ?? defaultBipolar
  const [score, setScore] = useState(formDraft.moodScore ?? defaultValue)
  const [notes, setNotes] = useState(formDraft.moodNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setScore(formDraft.moodScore ?? defaultValue)
    setNotes(formDraft.moodNotes ?? '')
  }, [formDraft.moodScore, formDraft.moodNotes, defaultValue])

  const handleScoreChange = (values: number[]) => {
    const newScore = values[0]
    setScore(newScore)
    setFormDraft({ ...formDraft, moodScore: newScore })
    onScoreChange?.(newScore)
  }

  const handleBipolarToggle = (checked: boolean) => {
    setFormDraft({ ...formDraft, isBipolarMode: checked })
    onBipolarChange?.(checked)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setFormDraft({ ...formDraft, moodNotes: newNotes })
  }

  const getScoreLabel = () => {
    if (isBipolar) {
      if (score === 5) return 'Balanced'
      if (score < 5) return `Depression Level ${score}`
      return `Mania Level ${score}`
    }
    return `${score}/10`
  }

  const getScoreColor = () => {
    if (isBipolar) {
      if (score < 5) return 'bg-red-500'
      if (score > 5) return 'bg-yellow-500'
      return 'bg-green-500'
    }
    if (score <= 3) return 'bg-red-500'
    if (score <= 7) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mood Score</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Label htmlFor="bipolar-mode" className="text-sm font-normal">Bipolar Scale</Label>
            <Switch
              id="bipolar-mode"
              checked={isBipolar}
              onCheckedChange={handleBipolarToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-2">
        <div className="space-y-4">
          <div>
            <Slider
              value={[score]}
              onValueChange={handleScoreChange}
              max={10}
              step={1}
              className={cn(
                "w-full",
                getScoreColor()
              )}
            />
          </div>
          
          <div className="grid grid-cols-3 text-sm text-muted-foreground">
            {isBipolar ? (
              <>
                <span className="text-left">Severe Depression</span>
                <span className="text-center">Balanced</span>
                <span className="text-right">Severe Mania</span>
              </>
            ) : (
              <>
                <span className="text-left">Very Low</span>
                <span className="text-center">Neutral</span>
                <span className="text-right">Very Good</span>
              </>
            )}
          </div>

          <div className="text-center font-medium text-lg">
            {getScoreLabel()}
          </div>
        </div>

        <Textarea
          placeholder="Describe how this score affected you..."
          value={notes}
          onChange={handleNotesChange}
          className="resize-none h-[4.5em]"
        />
      </CardContent>
    </Card>
  )
} 