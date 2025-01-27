'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface TestActivity {
  id: string
  name: string
}

export interface TestActivityEntry {
  activity_id: string
  duration_minutes: number
  engagement_level: number
}

interface TestActivityTrackerProps {
  activities: TestActivity[]
  entries: TestActivityEntry[]
  onActivityAdd: (activity: Omit<TestActivity, 'id'>) => void
  onEntryChange: (entries: TestActivityEntry[]) => void
}

export function TestActivityTracker({
  activities,
  entries,
  onActivityAdd,
  onEntryChange
}: TestActivityTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newActivity, setNewActivity] = useState('')

  const handleAddActivity = () => {
    if (!newActivity.trim()) {
      toast({
        title: "Required",
        description: "Please enter an activity name",
        variant: "destructive"
      })
      return
    }

    onActivityAdd({
      name: newActivity.trim()
    })
    
    setNewActivity('')
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Activity added successfully",
    })
  }

  // Handle enter key press separately
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddActivity()
    }
  }

  const toggleActivity = (activityId: string) => {
    const existingEntry = entries.find(e => e.activity_id === activityId)
    
    if (existingEntry) {
      // Remove entry
      onEntryChange(entries.filter(e => e.activity_id !== activityId))
    } else {
      // Add new entry with defaults
      onEntryChange([...entries, {
        activity_id: activityId,
        duration_minutes: 30,
        engagement_level: 3
      }])
    }
  }

  const updateEntry = (activityId: string, updates: Partial<TestActivityEntry>) => {
    onEntryChange(
      entries.map(entry => 
        entry.activity_id === activityId 
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

      {activities.length > 0 && (
        <div className="space-y-2">
          {activities.map((activity) => {
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