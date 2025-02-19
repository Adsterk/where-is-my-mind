'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { MoodScoreProps } from '@/lib/types/components'

export function MoodScore({
  score,
  bipolarMode,
  notes,
  onScoreChange,
  onBipolarToggle,
  onNotesChange,
  disabled = false
}: MoodScoreProps) {
  const scoreLabel = bipolarMode
    ? score === 5
      ? 'Balanced'
      : score < 5
      ? `Depression Level ${score}`
      : `Mania Level ${score}`
    : `${score}/10`

  const scoreColor = bipolarMode
    ? score < 5
      ? 'bg-red-500'
      : score > 5
      ? 'bg-yellow-500'
      : 'bg-green-500'
    : score <= 3
    ? 'bg-red-500'
    : score <= 7
    ? 'bg-yellow-500'
    : 'bg-green-500'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mood Score</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Label htmlFor="bipolar-mode" className="text-sm font-normal">
              Bipolar Scale
            </Label>
            <Switch
              id="bipolar-mode"
              checked={bipolarMode}
              onCheckedChange={onBipolarToggle}
              disabled={disabled}
              aria-label="Toggle bipolar mode"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-2">
        <div className="space-y-4">
          <div>
            <Slider
              value={[score]}
              onValueChange={(values) => onScoreChange(values[0])}
              max={10}
              step={1}
              disabled={disabled}
              className={cn("w-full", scoreColor)}
              aria-label="Mood score"
            />
          </div>
          
          <div className="grid grid-cols-3 text-sm text-muted-foreground">
            {bipolarMode ? (
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
            {scoreLabel}
          </div>
        </div>

        <Textarea
          placeholder="Describe how this score affected you..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
          className="resize-none h-[4.5em]"
          aria-label="Mood notes"
        />
      </CardContent>
    </Card>
  )
} 