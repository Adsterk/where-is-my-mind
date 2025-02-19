'use client'

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import type { SleepScoreProps } from '@/lib/types/components'

export function SleepScore({
  hours,
  notes,
  onHoursChange,
  onNotesChange,
  disabled = false
}: SleepScoreProps) {
  const getHoursLabel = () => {
    if (hours < 6) return 'Not enough sleep'
    if (hours < 8) return 'Adequate sleep'
    return 'Good sleep'
  }

  const getHoursColor = () => {
    if (hours < 6) return 'bg-red-500'
    if (hours < 8) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-2">
        <div className="space-y-4">
          <div>
            <Slider
              value={[hours]}
              onValueChange={(values) => onHoursChange(values[0])}
              min={0}
              max={12}
              step={0.5}
              disabled={disabled}
              className={getHoursColor()}
            />
          </div>
          
          <div className="grid grid-cols-3 text-sm text-muted-foreground">
            <span className="text-left">Poor</span>
            <span className="text-center">Adequate</span>
            <span className="text-right">Excellent</span>
          </div>

          <div className="text-center font-medium text-lg">
            {hours} hours - {getHoursLabel()}
          </div>
        </div>

        <Textarea
          placeholder="How was your sleep quality?"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          disabled={disabled}
          className="resize-none h-[4.5em]"
        />
      </CardContent>
    </Card>
  )
} 