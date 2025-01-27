'use client'

import { 
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem 
} from '@/components/ui'
import { useToast } from '@/hooks'
import { validateSleepHours, validateSleepQuality } from '@/lib/validation'

interface SleepTrackerProps {
  value: {
    sleep_hours: number
    sleep_quality: number | null
  }
  onUpdate: (value: {
    sleep_hours: number
    sleep_quality: number | null
  }) => void
  isEditing?: boolean
}

export function SleepTracker({
  value,
  onUpdate,
  isEditing
}: SleepTrackerProps) {
  const { toast } = useToast()

  const handleHoursChange = (hours: number) => {
    if (!validateSleepHours(hours)) {
      toast({
        title: "Invalid Hours",
        description: "Sleep hours must be between 0 and 24",
        variant: "destructive"
      })
      return
    }

    onUpdate({
      ...value,
      sleep_hours: hours
    })
  }

  const handleQualityChange = (quality: number) => {
    if (!validateSleepQuality(quality)) {
      toast({
        title: "Invalid Rating",
        description: "Sleep quality must be between 1 and 5",
        variant: "destructive"
      })
      return
    }

    onUpdate({
      ...value,
      sleep_quality: quality
    })
  }

  return (
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Hours Slept</Label>
          <Input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={value.sleep_hours}
            onChange={(e) => handleHoursChange(parseFloat(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Sleep Quality (1-5)</Label>
          <Input
            type="number"
            min="1"
            max="5"
            value={value.sleep_quality || ''}
            onChange={(e) => handleQualityChange(parseInt(e.target.value))}
          />
        </div>
      </div>
    </CardContent>
  )
} 