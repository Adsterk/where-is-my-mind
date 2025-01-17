'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from './FormEditContext'
import { validateIntensity, sanitizeText } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

export interface Behavior {
  id: string;
  name: string;
  is_custom: boolean;
}

export interface BehaviorEntry {
  behavior_id: string;
  intensity: number;  // Matches DB constraint 1-5
  notes?: string;
}

export interface ProblematicBehaviorTrackerProps {
  items: Behavior[]
  entries: BehaviorEntry[]
  onUpdate: (items: Behavior[], entries: BehaviorEntry[]) => void
  onNewBehavior: (behavior: Omit<Behavior, 'id'>) => void
}

export function ProblematicBehaviorTracker({ 
  items, 
  entries, 
  onUpdate, 
  onNewBehavior 
}: ProblematicBehaviorTrackerProps) {
  const { isEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBehavior, setNewBehavior] = useState({ name: '' })

  const validateEntry = (entry: BehaviorEntry): boolean => {
    if (!validateIntensity(entry.intensity)) {
      toast({
        title: "Invalid intensity",
        description: "Intensity must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const toggleBehavior = (behaviorId: string) => {
    const existingEntry = entries.find(e => e.behavior_id === behaviorId)
    
    if (existingEntry) {
      onUpdate(items, entries.filter(e => e.behavior_id !== behaviorId))
    } else {
      const newEntry: BehaviorEntry = {
        behavior_id: behaviorId,
        intensity: 3,
        notes: ''
      }
      
      if (validateEntry(newEntry)) {
        onUpdate(items, [...entries, newEntry])
      }
    }
  }

  const updateEntry = (behaviorId: string, updates: Partial<BehaviorEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.behavior_id !== behaviorId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.intensity !== undefined && !validateIntensity(updates.intensity)) {
        toast({
          title: "Invalid intensity",
          description: "Intensity must be between 1 and 5",
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

  const handleAddBehavior = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBehavior.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Behavior name is required",
        variant: "destructive"
      })
      return
    }

    onNewBehavior({
      name: newBehavior.name.trim(),
      is_custom: true
    })
    
    setNewBehavior({ name: '' })
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map((behavior) => {
          const entry = entries.find(e => e.behavior_id === behavior.id)
          
          return (
            <Card key={behavior.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{behavior.name}</h4>
                </div>
                <Button
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
                      value={entry.notes}
                      onChange={(e) => updateEntry(behavior.id, { 
                        notes: e.target.value 
                      })}
                      placeholder="What notes do you have?"
                    />
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {showAddForm ? (
          <form onSubmit={handleAddBehavior} className="space-y-4">
            <div className="space-y-2">
              <Label>Behavior Name</Label>
              <Input
                value={newBehavior.name}
                onChange={(e) => setNewBehavior(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter behavior name"
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
              Add Behavior
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 