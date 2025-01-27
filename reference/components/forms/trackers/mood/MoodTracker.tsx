'use client'

import { 
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Switch 
} from '@/components/ui'
import { useToast } from '@/hooks'
import { validateMoodScore, sanitizeText } from '@/lib/validation'

interface MoodTrackerProps {
  value: {
    mood_score: number
    notes: string | null
    is_bipolar_scale: boolean
  }
  onUpdate: (value: {
    mood_score: number
    notes: string | null
    is_bipolar_scale: boolean
  }) => void
  isEditing?: boolean
}

export function MoodTracker({
  value,
  onUpdate,
  isEditing
}: MoodTrackerProps) {
  const { toast } = useToast()

  const handleMoodChange = (newScore: number) => {
    if (!validateMoodScore(newScore)) {
      toast({
        title: "Invalid Score",
        description: "Mood score must be between 1 and 10",
        variant: "destructive"
      })
      return
    }

    onUpdate({
      ...value,
      mood_score: newScore
    })
  }

  const handleNotesChange = (notes: string) => {
    onUpdate({
      ...value,
      notes: sanitizeText(notes)
    })
  }

  const toggleBipolarScale = () => {
    onUpdate({
      ...value,
      is_bipolar_scale: !value.is_bipolar_scale
    })
  }

  return (
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Mood Score (1-10)</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={value.mood_score}
            onChange={(e) => handleMoodChange(parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Input
            value={value.notes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="How are you feeling?"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Use Bipolar Scale</Label>
          <Switch
            checked={value.is_bipolar_scale}
            onCheckedChange={toggleBipolarScale}
          />
        </div>
      </div>
    </CardContent>
  )
} 