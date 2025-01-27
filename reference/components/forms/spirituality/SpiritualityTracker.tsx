'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from './FormEditContext'
import { validateRating, validateDuration, sanitizeText } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

export interface SpiritualPractice {
  id: string
  type: string
  is_custom: boolean
}

export interface SpiritualPracticeEntry {
  practice_id: string
  duration_minutes: number
  impact_rating: number
  notes?: string
}

export interface SpiritualityTrackerProps {
  items: SpiritualPractice[]
  entries: SpiritualPracticeEntry[]
  onUpdate: (items: SpiritualPractice[], entries: SpiritualPracticeEntry[]) => void
  onNewPractice: (practice: Omit<SpiritualPractice, 'id'>) => void
}

export function SpiritualityTracker({ 
  items, 
  entries, 
  onUpdate, 
  onNewPractice 
}: SpiritualityTrackerProps) {
  const { isEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPractice, setNewPractice] = useState('')

  const validateEntry = (entry: SpiritualPracticeEntry): boolean => {
    if (!validateDuration(entry.duration_minutes)) {
      toast({
        title: "Invalid Duration",
        description: "Duration must be between 1 minute and 24 hours",
        variant: "destructive"
      })
      return false
    }
    if (!validateRating(entry.impact_rating)) {
      toast({
        title: "Invalid Rating",
        description: "Impact rating must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const togglePractice = (practiceId: string) => {
    const existingEntry = entries.find(e => e.practice_id === practiceId)
    
    if (existingEntry) {
      onUpdate(items, entries.filter(e => e.practice_id !== practiceId))
    } else {
      const newEntry: SpiritualPracticeEntry = {
        practice_id: practiceId,
        duration_minutes: 30,
        impact_rating: 3,
        notes: ''
      }
      
      if (validateEntry(newEntry)) {
        onUpdate(items, [...entries, newEntry])
      }
    }
  }

  const updateEntry = (practiceId: string, updates: Partial<SpiritualPracticeEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.practice_id !== practiceId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.duration_minutes !== undefined && !validateDuration(updates.duration_minutes)) {
        toast({
          title: "Invalid Duration",
          description: "Duration must be between 1 minute and 24 hours",
          variant: "destructive"
        })
        return entry
      }

      if (updates.impact_rating !== undefined && !validateRating(updates.impact_rating)) {
        toast({
          title: "Invalid Rating",
          description: "Impact rating must be between 1 and 5",
          variant: "destructive"
        })
        return entry
      }

      if (updates.notes !== undefined) {
        updatedEntry.notes = sanitizeText(updates.notes) || ''
      }

      return updatedEntry
    })

    onUpdate(items, updatedEntries)
  }

  const handleAddPractice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPractice.trim()) {
      toast({
        title: "Invalid Input",
        description: "Practice type is required",
        variant: "destructive"
      })
      return
    }

    onNewPractice({
      type: newPractice.trim(),
      is_custom: true
    })
    setNewPractice('')
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map((practice) => {
          const entry = entries.find(e => e.practice_id === practice.id)
          
          return (
            <Card key={practice.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{practice.type}</h4>
                </div>
                <Button
                  variant={entry ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePractice(practice.id)}
                >
                  {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              {entry && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={entry.duration_minutes}
                      onChange={(e) => updateEntry(practice.id, { 
                        duration_minutes: parseInt(e.target.value) 
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Impact on Wellbeing (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={entry.impact_rating}
                      onChange={(e) => updateEntry(practice.id, { 
                        impact_rating: parseInt(e.target.value) 
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      value={entry.notes}
                      onChange={(e) => updateEntry(practice.id, { 
                        notes: e.target.value 
                      })}
                      placeholder="Add notes about this practice..."
                    />
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {showAddForm ? (
          <form onSubmit={handleAddPractice} className="space-y-4">
            <div className="space-y-2">
              <Label>Practice Type</Label>
              <Input
                value={newPractice}
                onChange={(e) => setNewPractice(e.target.value)}
                placeholder="e.g., Meditation, Prayer, Yoga"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          isEditing && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              Add Practice
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 