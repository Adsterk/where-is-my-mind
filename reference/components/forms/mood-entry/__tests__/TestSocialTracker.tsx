'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useLocalStore } from '@/lib/stores/localStore'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface SocialActivity {
  id: string
  name: string
  completed: boolean
  quality?: 'not helpful' | 'somewhat helpful' | 'very helpful'
}

interface TestSocialTrackerProps {
  onActivitiesChange?: (activities: SocialActivity[]) => void
}

export function TestSocialTracker({
  onActivitiesChange
}: TestSocialTrackerProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const [activities, setActivities] = useState<SocialActivity[]>(
    formDraft.socialActivities ?? []
  )
  const [newActivityName, setNewActivityName] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [notes, setNotes] = useState(formDraft.socialNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setActivities(formDraft.socialActivities ?? [])
    setNotes(formDraft.socialNotes ?? '')
  }, [formDraft.socialActivities, formDraft.socialNotes])

  const updateActivities = (newActivities: SocialActivity[]) => {
    setActivities(newActivities)
    setFormDraft({ ...formDraft, socialActivities: newActivities })
    onActivitiesChange?.(newActivities)
  }

  const handleAddActivity = () => {
    if (!newActivityName.trim()) return

    const newActivity: SocialActivity = {
      id: crypto.randomUUID(),
      name: newActivityName.trim(),
      completed: false
    }

    updateActivities([...activities, newActivity])
    setNewActivityName('')
  }

  const handleToggleActivity = (id: string) => {
    const updatedActivities = activities.map(activity =>
      activity.id === id ? { ...activity, completed: !activity.completed } : activity
    )
    updateActivities(updatedActivities)
  }

  const handleRemoveActivity = (id: string) => {
    const updatedActivities = activities.filter(activity => activity.id !== id)
    updateActivities(updatedActivities)
  }

  const handleQualityChange = (id: string, quality: SocialActivity['quality']) => {
    const updatedActivities = activities.map(activity =>
      activity.id === id ? { ...activity, quality } : activity
    )
    updateActivities(updatedActivities)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (!isEditMode) {
      setNewActivityName('')
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setFormDraft({ ...formDraft, socialNotes: newNotes })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Social Activities</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {activities.length === 0 && !isEditMode && (
              <span>Click to add items</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleEditMode}
              className="h-8 w-8"
            >
              {isEditMode ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-2">
        {/* Add New Activity - Only shown in edit mode */}
        {isEditMode && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter social activity"
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
            />
            <Button 
              onClick={handleAddActivity}
              disabled={!newActivityName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No activities added yet
            </div>
          ) : (
            activities.map(activity => (
              <div
                key={activity.id}
                className="flex flex-col gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      id={activity.id}
                      checked={activity.completed}
                      onCheckedChange={() => handleToggleActivity(activity.id)}
                    />
                    <Label
                      htmlFor={activity.id}
                      className={activity.completed ? 'text-muted-foreground' : ''}
                    >
                      {activity.name}
                    </Label>
                  </div>
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveActivity(activity.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {activity.completed && (
                  <div className="flex flex-wrap gap-1">
                    <Button
                      key="not-helpful"
                      variant={activity.quality === 'not helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQualityChange(activity.id, 'not helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        activity.quality === 'not helpful' && 'bg-red-500 hover:bg-red-600'
                      )}
                    >
                      not helpful
                    </Button>
                    <Button
                      key="somewhat-helpful"
                      variant={activity.quality === 'somewhat helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQualityChange(activity.id, 'somewhat helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        activity.quality === 'somewhat helpful' && 'bg-yellow-500 hover:bg-yellow-600'
                      )}
                    >
                      somewhat helpful
                    </Button>
                    <Button
                      key="very-helpful"
                      variant={activity.quality === 'very helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleQualityChange(activity.id, 'very helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        activity.quality === 'very helpful' && 'bg-green-500 hover:bg-green-600'
                      )}
                    >
                      very helpful
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <Textarea
          placeholder="Describe how this affected you..."
          value={notes}
          onChange={handleNotesChange}
          className="resize-none h-[4.5em]"
        />
      </CardContent>
    </Card>
  )
} 