'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from '@/components/providers'
import { useToast } from '@/hooks/use-toast'
import { validateDuration, validateIntensity, sanitizeText } from '@/lib/validation'
import type { TypedActivityEntry } from './types'

export interface Activity {
  id: string
  name: string
  category: string
  is_custom: boolean
}

interface ActivityTrackerProps {
  items: Activity[]
  entries: TypedActivityEntry[]
  onUpdate: (items: Activity[], entries: TypedActivityEntry[]) => void
  onNewActivity?: (activity: Omit<Activity, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}

export function ActivityTracker({
  items,
  entries,
  onUpdate,
  onNewActivity,
  onDeleteItem,
  isEditing
}: ActivityTrackerProps) {
  const { isEditing: formEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState({ name: '', category: '' })

  const toggleActivity = (activityId: string) => {
    const existingEntry = entries.find(e => e.activities_id === activityId)
    
    if (existingEntry) {
      onUpdate(
        items,
        entries.filter(e => e.activities_id !== activityId)
      )
    } else {
      const newEntry: TypedActivityEntry = {
        type: 'activity',
        activities_id: activityId,
        duration_minutes: 30,
        intensity: 3
      }
      onUpdate(items, [...entries, newEntry])
    }
  }

  const updateEntry = (activityId: string, updates: Partial<TypedActivityEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.activities_id !== activityId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.duration_minutes !== undefined && !validateDuration(updates.duration_minutes)) {
        toast({
          title: "Invalid Duration",
          description: "Duration must be greater than 0",
          variant: "destructive"
        })
        return entry
      }

      if (updates.intensity !== undefined && !validateIntensity(updates.intensity)) {
        toast({
          title: "Invalid Rating",
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

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActivity.name.trim()) return

    onNewActivity({
      name: sanitizeText(newActivity.name),
      category: sanitizeText(newActivity.category),
      is_custom: true
    })
    setNewActivity({ name: '', category: '' })
    setShowAddForm(false)
  }

  return (
    <CardContent className="space-y-4">
      <div className="space-y-4">
        {items.map(activity => {
          const entry = entries.find(e => e.activities_id === activity.id)
          
          return (
            <Card key={activity.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{activity.name}</h4>
                  <p className="text-sm text-muted-foreground">{activity.category}</p>
                </div>
                <Button
                  variant={entry ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActivity(activity.id)}
                >
                  {entry ? <Check className="h-4 w-4" /> : "Add"}
                </Button>
              </div>

              {entry && (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={entry.duration_minutes}
                      onChange={(e) => updateEntry(activity.id, {
                        duration_minutes: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Intensity (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={entry.intensity}
                      onChange={(e) => updateEntry(activity.id, {
                        intensity: parseInt(e.target.value)
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      value={entry.notes || ''}
                      onChange={(e) => updateEntry(activity.id, {
                        notes: e.target.value
                      })}
                      placeholder="Add notes about this activity..."
                    />
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {showAddForm ? (
          <form onSubmit={handleAddActivity} className="space-y-4">
            <div className="space-y-2">
              <Label>Activity Name</Label>
              <Input
                value={newActivity.name}
                onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter activity name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={newActivity.category}
                onChange={(e) => setNewActivity(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Exercise, Hobby"
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
          formEditing && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 