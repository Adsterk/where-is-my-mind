'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useLocalStore } from '@/lib/stores/localStore'

interface TestSleepScoreProps {
  defaultValue?: number
  onScoreChange?: (value: number) => void
}

export function TestSleepScore({
  defaultValue = 7,
  onScoreChange
}: TestSleepScoreProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const [hours, setHours] = useState(formDraft.sleepHours ?? defaultValue)
  const [notes, setNotes] = useState(formDraft.sleepNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setHours(formDraft.sleepHours ?? defaultValue)
    setNotes(formDraft.sleepNotes ?? '')
  }, [formDraft.sleepHours, formDraft.sleepNotes, defaultValue])

  const handleHoursChange = (values: number[]) => {
    const newHours = values[0]
    setHours(newHours)
    setFormDraft({ ...formDraft, sleepHours: newHours })
    onScoreChange?.(newHours)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setFormDraft({ ...formDraft, sleepNotes: newNotes })
  }

  const getQualityLabel = (hours: number) => {
    if (hours < 4) return 'Very Poor'
    if (hours < 6) return 'Poor'
    if (hours < 8) return 'Fair'
    if (hours < 10) return 'Good'
    return 'Excellent'
  }

  const getQualityColor = (hours: number) => {
    if (hours < 4) return 'bg-red-500'
    if (hours < 6) return 'bg-orange-500'
    if (hours < 8) return 'bg-yellow-500'
    if (hours < 10) return 'bg-green-500'
    return 'bg-emerald-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sleep Duration</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hours of Sleep</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-2">
        <div className="space-y-4">
          <div>
            <Slider
              value={[hours]}
              onValueChange={handleHoursChange}
              max={12}
              step={0.5}
              className={cn(
                "w-full",
                getQualityColor(hours)
              )}
            />
          </div>
          
          <div className="grid grid-cols-3 text-sm text-muted-foreground">
            <span className="text-left">Poor Sleep</span>
            <span className="text-center">Average</span>
            <span className="text-right">Optimal Sleep</span>
          </div>

          <div className="text-center space-y-1">
            <div className="font-medium text-lg">
              {hours} Hours
            </div>
            <div className="text-sm text-muted-foreground">
              {getQualityLabel(hours)}
            </div>
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