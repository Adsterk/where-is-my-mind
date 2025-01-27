'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface TestBehavior {
  id: string
  name: string
}

export interface TestBehaviorEntry {
  behavior_id: string
  intensity: number
  notes?: string
}

interface TestProblematicBehaviorTrackerProps {
  behaviors: TestBehavior[]
  entries: TestBehaviorEntry[]
  onBehaviorAdd: (behavior: Omit<TestBehavior, 'id'>) => void
  onEntryChange: (entries: TestBehaviorEntry[]) => void
}

export function TestProblematicBehaviorTracker({
  behaviors,
  entries,
  onBehaviorAdd,
  onEntryChange
}: TestProblematicBehaviorTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBehavior, setNewBehavior] = useState('')

  const handleAddBehavior = () => {
    if (!newBehavior.trim()) {
      toast({
        title: "Required",
        description: "Behavior name is required",
        variant: "destructive"
      })
      return
    }

    onBehaviorAdd({
      name: newBehavior.trim()
    })
    
    setNewBehavior('')
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Behavior added successfully",
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddBehavior()
    }
  }

  const toggleBehavior = (behaviorId: string) => {
    const existingEntry = entries.find(e => e.behavior_id === behaviorId)
    
    if (existingEntry) {
      onEntryChange(entries.filter(e => e.behavior_id !== behaviorId))
    } else {
      onEntryChange([...entries, {
        behavior_id: behaviorId,
        intensity: 3
      }])
    }
  }

  const updateEntry = (behaviorId: string, updates: Partial<TestBehaviorEntry>) => {
    onEntryChange(
      entries.map(entry => 
        entry.behavior_id === behaviorId 
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
          Add Behavior
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Behavior Name</Label>
              <Input
                value={newBehavior}
                onChange={(e) => setNewBehavior(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter behavior name"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleAddBehavior}
              >
                Save
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewBehavior('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {behaviors.length > 0 && (
        <div className="space-y-2">
          {behaviors.map((behavior) => {
            const entry = entries.find(e => e.behavior_id === behavior.id)
            
            return (
              <Card key={behavior.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{behavior.name}</h4>
                  <Button
                    type="button"
                    variant={entry ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleBehavior(behavior.id)}
                  >
                    {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {entry && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Intensity (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={entry.intensity}
                        onChange={(e) => updateEntry(behavior.id, { 
                          intensity: parseInt(e.target.value) 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(behavior.id, { 
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