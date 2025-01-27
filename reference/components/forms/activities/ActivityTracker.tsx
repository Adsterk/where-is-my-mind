'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from './FormEditContext'
import { validateRating, validateDuration, sanitizeText } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/hooks/useSupabase'

export interface Activity {
  id: string
  name: string
  is_custom: boolean
}

export interface ActivityEntry {
  activity_id: string
  duration_minutes: number
  engagement_level: number
  impact_rating: number
  notes?: string
}

interface ActivityTrackerProps {
  items: Activity[]
  entries: ActivityEntry[]
  onUpdate: (items: Activity[], entries: ActivityEntry[]) => void
  onNewActivity: (activity: Omit<Activity, 'id'>) => void
}

export function ActivityTracker({ 
  items: propItems, 
  entries,
  onUpdate, 
  onNewActivity 
}: ActivityTrackerProps) {
  const { supabase } = useSupabase()
  const { isEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [items, setItems] = useState<Activity[]>(propItems)

  // Remove entries from dependencies to prevent infinite loop
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: activities, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', user.id) // Only fetch user's activities
          .order('name')

        if (error) throw error

        if (activities) {
          setItems(activities)
          onUpdate(activities, entries)
        }
        
      } catch (err) {
        console.error('Error fetching activities:', err)
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [supabase]) // Remove onUpdate and entries from dependencies

  const handleAddActivity = async () => {
    if (!newActivity.trim()) {
      toast({
        title: "Required",
        description: "Activity name is required",
        variant: "destructive"
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          name: newActivity.trim(),
          user_id: user.id,
          is_custom: true,
          is_default: false
        })
        .select()
        .single()

      if (error) throw error

      if (activity) {
        const updatedItems = [...items, activity]
        setItems(updatedItems)
        onUpdate(updatedItems, entries)
        
        setNewActivity('')
        setShowAddForm(false)

        toast({
          title: "Success",
          description: "Activity added successfully",
        })
      }
    } catch (err) {
      console.error('Error adding activity:', err)
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive"
      })
    }
  }

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddActivity()
    }
  }

  const toggleActivity = (activityId: string) => {
    const existingEntry = entries.find(e => e.activity_id === activityId)
    
    if (existingEntry) {
      onUpdate(items, entries.filter(e => e.activity_id !== activityId))
    } else {
      const newEntry: ActivityEntry = {
        activity_id: activityId,
        duration_minutes: 30,
        engagement_level: 3,
        impact_rating: 3,
        notes: ''
      }
      
      if (validateEntry(newEntry)) {
        onUpdate(items, [...entries, newEntry])
      }
    }
  }

  const validateEntry = (entry: ActivityEntry): boolean => {
    if (!validateDuration(entry.duration_minutes)) {
      toast({
        title: "Invalid Duration",
        description: "Duration must be between 1 minute and 24 hours",
        variant: "destructive"
      })
      return false
    }
    if (!validateRating(entry.engagement_level) || !validateRating(entry.impact_rating)) {
      toast({
        title: "Invalid Rating",
        description: "Ratings must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const updateEntry = (activityId: string, updates: Partial<ActivityEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.activity_id !== activityId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.duration_minutes !== undefined && !validateDuration(updates.duration_minutes)) {
        toast({
          title: "Invalid Duration",
          description: "Duration must be between 1 minute and 24 hours",
          variant: "destructive"
        })
        return entry
      }

      if (updates.engagement_level !== undefined && !validateRating(updates.engagement_level)) {
        toast({
          title: "Invalid Rating",
          description: "Engagement level must be between 1 and 5",
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

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center p-4">Loading activities...</div>
      ) : (
        <>
          {!showAddForm ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          ) : (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Activity Name</Label>
                  <Input
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter activity name"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={handleAddActivity}
                  >
                    Save
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewActivity('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {items.length > 0 && (
            <div className="space-y-2">
              {items.map((activity) => {
                const entry = entries.find(e => e.activity_id === activity.id)
                
                return (
                  <Card key={activity.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.name}</h4>
                      <Button
                        type="button"
                        variant={entry ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleActivity(activity.id)}
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
                            onChange={(e) => updateEntry(activity.id, { 
                              duration_minutes: parseInt(e.target.value) 
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Engagement Level (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={entry.engagement_level}
                            onChange={(e) => updateEntry(activity.id, { 
                              engagement_level: parseInt(e.target.value) 
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Impact on Mood (1-5)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="5"
                            value={entry.impact_rating}
                            onChange={(e) => updateEntry(activity.id, { 
                              impact_rating: parseInt(e.target.value) 
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Notes (optional)</Label>
                          <Input
                            value={entry.notes}
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
            </div>
          )}
        </>
      )}
    </div>
  )
} 