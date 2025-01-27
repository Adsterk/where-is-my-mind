'use client'

import { useState } from 'react'
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
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks'
import { validateIntensity, sanitizeText } from '@/lib/validation'
import type { 
  Behavior, 
  BehaviorEntry, 
  TypedBehaviorEntry,
  BehaviorTrackerProps 
} from './types'

export function BehaviorTracker({
  items,
  entries,
  onUpdate,
  onNewBehavior,
  onDeleteItem,
  isEditing
}: BehaviorTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBehavior, setNewBehavior] = useState<{
    name: string
    category: string
  }>({ 
    name: '', 
    category: '' 
  })

  const toggleBehavior = (behaviorId: string) => {
    const existingEntry = entries.find(e => e.behaviors_id === behaviorId)
    
    if (existingEntry) {
      onUpdate(
        items,
        entries.filter(e => e.behaviors_id !== behaviorId)
      )
    } else {
      const newEntry: TypedBehaviorEntry = {
        type: 'behavior',
        behaviors_id: behaviorId,
        intensity: 3,
        trigger: ''
      }
      onUpdate(items, [...entries, newEntry])
    }
  }

  const updateEntry = (behaviorId: string, updates: Partial<BehaviorEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.behaviors_id !== behaviorId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.intensity !== undefined && !validateIntensity(updates.intensity)) {
        toast({
          title: "Invalid Rating",
          description: "Intensity must be between 1 and 5",
          variant: "destructive"
        })
        return entry
      }

      if (updates.trigger !== undefined) {
        updatedEntry.trigger = sanitizeText(updates.trigger) || ''
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
    if (!newBehavior.name.trim()) return

    onNewBehavior({
      name: sanitizeText(newBehavior.name),
      category: sanitizeText(newBehavior.category || ''),
      is_custom: true
    })
    setNewBehavior({ name: '', category: '' })
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map(behavior => {
          const entry = entries.find(e => e.behaviors_id === behavior.id)
          
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
                  {entry ? <Check className="h-4 w-4" /> : "Add"}
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
                      placeholder="Add notes about this behavior..."
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
                onChange={(e) => setNewBehavior(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
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
              <Plus className="h-4 w-4 mr-2" />
              Add Behavior
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 