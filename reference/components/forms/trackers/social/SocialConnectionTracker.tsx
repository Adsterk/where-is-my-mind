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
import { validateQualityRating, validateImpactRating, sanitizeText } from '@/lib/validation'
import type { 
  SocialConnection, 
  SocialConnectionEntry, 
  TypedSocialEntry,
  SocialConnectionTrackerProps 
} from './types'

export function SocialConnectionTracker({
  items,
  entries,
  onUpdate,
  onNewConnection,
  onDeleteItem,
  isEditing
}: SocialConnectionTrackerProps) {
  const { isEditing: formEditIsEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newConnection, setNewConnection] = useState('')

  const validateEntry = (entry: SocialConnectionEntry): boolean => {
    if (!validateQualityRating(entry.quality_rating)) {
      toast({
        title: "Invalid Rating",
        description: "Quality rating must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }
    if (!validateImpactRating(entry.impact_rating)) {
      toast({
        title: "Invalid Rating",
        description: "Impact rating must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const toggleConnection = (connectionId: string) => {
    const existingEntry = entries.find(e => e.social_id === connectionId)
    
    if (existingEntry) {
      onUpdate(
        items,
        entries.filter(e => e.social_id !== connectionId)
      )
    } else {
      const newEntry: TypedSocialEntry = {
        type: 'social',
        social_id: connectionId,
        quality_rating: 3,
        impact_rating: 3
      }
      onUpdate(items, [...entries, newEntry])
    }
  }

  const updateEntry = (connectionId: string, updates: Partial<SocialConnectionEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.social_id !== connectionId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.quality_rating !== undefined && !validateQualityRating(updates.quality_rating)) {
        toast({
          title: "Invalid Rating",
          description: "Quality rating must be between 1 and 5",
          variant: "destructive"
        })
        return entry
      }

      if (updates.impact_rating !== undefined && !validateImpactRating(updates.impact_rating)) {
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

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newConnection.trim()) return

    onNewConnection({
      name: newConnection.trim(),
      type: newConnection.trim(),
      is_custom: true
    })
    setNewConnection('')
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map((connection) => {
          const entry = entries.find(e => e.social_id === connection.id)
          
          return (
            <Card key={connection.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{connection.type}</h4>
                </div>
                <Button
                  variant={entry ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleConnection(connection.id)}
                >
                  {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>

              {entry && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Quality Rating (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={entry.quality_rating}
                      onChange={(e) => updateEntry(connection.id, { 
                        quality_rating: parseInt(e.target.value) 
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
                      onChange={(e) => updateEntry(connection.id, { 
                        impact_rating: parseInt(e.target.value) 
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      value={entry.notes}
                      onChange={(e) => updateEntry(connection.id, { 
                        notes: e.target.value 
                      })}
                      placeholder="Add notes about this interaction..."
                    />
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {showAddForm ? (
          <form onSubmit={handleAddConnection} className="space-y-4">
            <div className="space-y-2">
              <Label>Connection Type</Label>
              <Input
                value={newConnection}
                onChange={(e) => setNewConnection(e.target.value)}
                placeholder="e.g., Family, Friend, Therapist"
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
          formEditIsEditing && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              Add Connection
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 