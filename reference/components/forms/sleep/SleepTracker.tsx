'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface SleepEntry {
  sleep_hours: number
  sleep_quality: number | null
}

interface SleepTrackerProps {
  value: SleepEntry
  onUpdate: (data: SleepEntry) => void
}

export function SleepTracker({ value, onUpdate }: SleepTrackerProps) {
  const handleHoursChange = (newHours: number) => {
    onUpdate({
      ...value,
      sleep_hours: newHours
    })
  }

  const handleQualityChange = (newQuality: string) => {
    onUpdate({
      ...value,
      sleep_quality: newQuality === "0" ? null : parseInt(newQuality, 10)
    })
  }

  return (
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sleep-hours">
          Hours of Sleep: {value.sleep_hours}
        </Label>
        <Slider
          id="sleep-hours"
          min={0}
          max={24}
          step={0.5}
          value={[value.sleep_hours]}
          onValueChange={(values) => handleHoursChange(values[0])}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sleep-quality">Sleep Quality (optional)</Label>
        <Select
          value={value.sleep_quality?.toString() ?? "0"}
          onValueChange={handleQualityChange}
        >
          <SelectTrigger id="sleep-quality">
            <SelectValue placeholder="Rate your sleep quality..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Not rated</SelectItem>
            <SelectItem value="1">1 - Very Poor</SelectItem>
            <SelectItem value="2">2 - Poor</SelectItem>
            <SelectItem value="3">3 - Fair</SelectItem>
            <SelectItem value="4">4 - Good</SelectItem>
            <SelectItem value="5">5 - Excellent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  )
} 