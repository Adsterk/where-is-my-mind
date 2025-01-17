'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface TestSleepEntry {
  sleep_hours: number
  sleep_quality: string | null
}

interface TestSleepTrackerProps {
  value: TestSleepEntry
  onUpdate: (data: TestSleepEntry) => void
}

export function TestSleepTracker({ value, onUpdate }: TestSleepTrackerProps) {
  const handleHoursChange = (values: number[]) => {
    onUpdate({
      ...value,
      sleep_hours: values[0]
    })
  }

  const handleQualityChange = (newQuality: string) => {
    onUpdate({
      ...value,
      sleep_quality: newQuality === "0" ? null : newQuality
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
          onValueChange={handleHoursChange}
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
            <SelectItem value="poor">Poor</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  )
} 