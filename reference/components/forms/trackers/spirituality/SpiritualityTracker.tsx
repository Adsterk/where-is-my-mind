'use client'

import { useState } from 'react'
import { 
  Button,
  Input,
  Label,
  Card,
  CardContent 
} from '@/components/ui'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from '@/components/providers'
import { useToast } from '@/hooks'
import { validateDuration, validateFulfillment, sanitizeText } from '@/lib/validation'
import type { 
  SpiritualPractice, 
  SpiritualPracticeEntry, 
  TypedSpiritualityEntry,
  SpiritualityTrackerProps 
} from './types'

export function SpiritualityTracker({
  items,
  entries,
  onUpdate,
  onNewPractice,
  onDeleteItem,
  isEditing
}: SpiritualityTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPractice, setNewPractice] = useState({ name: '' })

  const togglePractice = (practiceId: string) => {
    const existingEntry = entries.find(e => e.spirituality_id === practiceId)
    
    if (existingEntry) {
      onUpdate(
        items,
        entries.filter(e => e.spirituality_id !== practiceId)
      )
    } else {
      const newEntry: TypedSpiritualityEntry = {
        type: 'spirituality',
        spirituality_id: practiceId,
        duration_minutes: 30,
        fulfillment_rating: 3
      }
      onUpdate(items, [...entries, newEntry])
    }
  }

  const updateEntry = (practiceId: string, updates: Partial<SpiritualPracticeEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.spirituality_id !== practiceId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.duration_minutes !== undefined && !validateDuration(updates.duration_minutes)) {
        toast({
          title: "Invalid Duration",
          description: "Duration must be greater than 0",
          variant: "destructive"
        })
        return entry
      }

      if (updates.fulfillment_rating !== undefined && !validateFulfillment(updates.fulfillment_rating)) {
        toast({
          title: "Invalid Rating",
          description: "Fulfillment rating must be between 1 and 5",
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
    if (!newPractice.name.trim()) return

    onNewPractice({
      name: sanitizeText(newPractice.name),
      is_custom: true
    })
    setNewPractice({ name: '' })
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map(practice => {
          const entry = entries.find(e => e.spirituality_id === practice.id)
          
          return (
            <Card key={practice.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{practice.name}</h4>
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
              <Label>Practice Name</Label>
              <Input
                value={newPractice.name}
                onChange={(e) => setNewPractice({ name: e.target.value })}
                placeholder="Enter practice name"
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
              Add Practice
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 