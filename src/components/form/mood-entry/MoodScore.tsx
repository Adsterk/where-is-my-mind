'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MoodEntry } from './types'

interface MoodScoreProps {
  value: MoodEntry
  onUpdate: (data: MoodEntry) => void
}

export function MoodScore({ value, onUpdate }: MoodScoreProps) {
  const handleMoodChange = (values: number[]) => {
    onUpdate({
      ...value,
      mood_score: values[0]
    })
  }

  const handleBipolarToggle = (checked: boolean) => {
    onUpdate({
      ...value,
      is_bipolar_scale: checked
    })
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
    </CardContent>
  )
} 