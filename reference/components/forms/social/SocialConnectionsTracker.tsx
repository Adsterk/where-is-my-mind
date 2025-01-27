'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from './FormEditContext'
import { validateRating, sanitizeText } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

export interface SocialConnection {
  id: string
  type: string
  is_custom: boolean
}

export interface SocialConnectionEntry {
  connection_id: string
  quality_rating: number
  impact_rating: number
  notes?: string
}

export interface SocialConnectionsTrackerProps {
  items: SocialConnection[]
  entries: SocialConnectionEntry[]
  onUpdate: (items: SocialConnection[], entries: SocialConnectionEntry[]) => void
  onNewConnection: (connection: Omit<SocialConnection, 'id'>) => void
}

export function SocialConnectionsTracker({ 
  items, 
  entries, 
  onUpdate, 
  onNewConnection 
}: SocialConnectionsTrackerProps) {
  const { isEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newConnection, setNewConnection] = useState('')

  const validateEntry = (entry: SocialConnectionEntry): boolean => {
    if (!validateRating(entry.quality_rating)) {
      toast({
        title: "Invalid Rating",
        description: "Quality rating must be between 1 and 5",
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

  const toggleConnection = (connectionId: string) => {
    const existingEntry = entries.find(e => e.connection_id === connectionId)
    
    if (existingEntry) {
      onUpdate(items, entries.filter(e => e.connection_id !== connectionId))
    } else {
      const newEntry: SocialConnectionEntry = {
        connection_id: connectionId,
        quality_rating: 3,
        impact_rating: 3,
        notes: ''
      }
      
      if (validateEntry(newEntry)) {
        onUpdate(items, [...entries, newEntry])
      }
    }
  }

  const updateEntry = (connectionId: string, updates: Partial<SocialConnectionEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.connection_id !== connectionId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.quality_rating !== undefined && !validateRating(updates.quality_rating)) {
        toast({
          title: "Invalid Rating",
          description: "Quality rating must be between 1 and 5",
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

  const handleAddConnection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newConnection.trim()) {
      toast({
        title: "Invalid Input",
        description: "Connection type is required",
        variant: "destructive"
      })
      return
    }

    onNewConnection({
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
          const entry = entries.find(e => e.connection_id === connection.id)
          
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
          isEditing && (
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