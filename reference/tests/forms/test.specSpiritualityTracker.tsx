'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface TestSpiritualPractice {
  id: string
  name: string
}

export interface TestSpiritualPracticeEntry {
  practice_id: string
  duration_minutes: number
  fulfillment_rating: number
  notes?: string
}

interface TestSpiritualityTrackerProps {
  practices: TestSpiritualPractice[]
  entries: TestSpiritualPracticeEntry[]
  onPracticeAdd: (practice: Omit<TestSpiritualPractice, 'id'>) => void
  onEntryChange: (entries: TestSpiritualPracticeEntry[]) => void
}

export function TestSpiritualityTracker({
  practices,
  entries,
  onPracticeAdd,
  onEntryChange
}: TestSpiritualityTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPractice, setNewPractice] = useState('')

  const handleAddPractice = () => {
    if (!newPractice.trim()) {
      toast({
        title: "Required",
        description: "Practice name is required",
        variant: "destructive"
      })
      return
    }

    onPracticeAdd({
      name: newPractice.trim()
    })
    
    setNewPractice('')
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Spiritual practice added successfully",
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPractice()
    }
  }

  const togglePractice = (practiceId: string) => {
    const existingEntry = entries.find(e => e.practice_id === practiceId)
    
    if (existingEntry) {
      onEntryChange(entries.filter(e => e.practice_id !== practiceId))
    } else {
      onEntryChange([...entries, {
        practice_id: practiceId,
        duration_minutes: 15,
        fulfillment_rating: 3
      }])
    }
  }

  const updateEntry = (practiceId: string, updates: Partial<TestSpiritualPracticeEntry>) => {
    onEntryChange(
      entries.map(entry => 
        entry.practice_id === practiceId 
          ? { ...entry, ...updates }
          : entry
      )
    )
  }

  return (
    <div className="space-y-4">
      {!showAddForm ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Spiritual Practice
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Practice Name</Label>
              <Input
                value={newPractice}
                onChange={(e) => setNewPractice(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter practice name"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleAddPractice}
              >
                Save
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewPractice('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {practices.length > 0 && (
        <div className="space-y-2">
          {practices.map((practice) => {
            const entry = entries.find(e => e.practice_id === practice.id)
            
            return (
              <Card key={practice.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{practice.name}</h4>
                  <Button
                    type="button"
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
                      <Label>Fulfillment Rating (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={entry.fulfillment_rating}
                        onChange={(e) => updateEntry(practice.id, { 
                          fulfillment_rating: parseInt(e.target.value) 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(practice.id, { 
                          notes: e.target.value 
                        })}
                        placeholder="Add any notes..."
                      />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 