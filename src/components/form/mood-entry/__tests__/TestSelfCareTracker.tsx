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

interface SelfCareActivity {
  id: string
  name: string
  completed: boolean
  impact?: 'not helpful' | 'somewhat helpful' | 'very helpful'
}

interface TestSelfCareTrackerProps {
  onActivitiesChange?: (activities: SelfCareActivity[]) => void
}

export function TestSelfCareTracker({
  onActivitiesChange
}: TestSelfCareTrackerProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newActivityName, setNewActivityName] = useState('')
  const [activities, setActivities] = useState<SelfCareActivity[]>(
    formDraft.selfCareActivities ?? []
  )
  const [notes, setNotes] = useState(formDraft.selfCareNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setActivities(formDraft.selfCareActivities ?? [])
    setNotes(formDraft.selfCareNotes ?? '')
  }, [formDraft.selfCareActivities, formDraft.selfCareNotes])

  const updateActivities = (newActivities: SelfCareActivity[]) => {
    setActivities(newActivities)
    setFormDraft({ ...formDraft, selfCareActivities: newActivities })
    onActivitiesChange?.(newActivities)
  }

  const handleAddActivity = () => {
    if (newActivityName.trim()) {
      const newActivity: SelfCareActivity = {
        id: Math.random().toString(36).substr(2, 9),
        name: newActivityName.trim(),
        completed: false
      }
      updateActivities([...activities, newActivity])
      setNewActivityName('')
    }
  }

  const handleToggleActivity = (id: string) => {
    updateActivities(
      activities.map(activity =>
        activity.id === id
          ? { ...activity, completed: !activity.completed }
          : activity
      )
    )
  }

  const handleRemoveActivity = (id: string) => {
    updateActivities(activities.filter(activity => activity.id !== id))
  }

  const handleImpactChange = (id: string, impact: SelfCareActivity['impact']) => {
    updateActivities(
      activities.map(activity =>
        activity.id === id ? { ...activity, impact } : activity
      )
    )
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
    setFormDraft({ ...formDraft, selfCareNotes: newNotes })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Self-Care Activities</CardTitle>
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
        {isEditMode && (
          <div className="flex gap-2">
            <Input
              value={newActivityName}
              onChange={(e) => setNewActivityName(e.target.value)}
              placeholder="Enter self-care activity"
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

        <div className="space-y-2">
          {activities.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No activities added yet
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={activity.id}
                      checked={activity.completed}
                      onCheckedChange={() => handleToggleActivity(activity.id)}
                    />
                    <Label
                      htmlFor={activity.id}
                      className={cn(
                        activity.completed && "text-muted-foreground"
                      )}
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
                      variant={activity.impact === 'not helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleImpactChange(activity.id, 'not helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        activity.impact === 'not helpful' && 'bg-red-500 hover:bg-red-600'
                      )}
                    >
                      not helpful
                    </Button>
                    <Button
                      variant={activity.impact === 'somewhat helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleImpactChange(activity.id, 'somewhat helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        activity.impact === 'somewhat helpful' && 'bg-yellow-500 hover:bg-yellow-600'
                      )}
                    >
                      somewhat helpful
                    </Button>
                    <Button
                      variant={activity.impact === 'very helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleImpactChange(activity.id, 'very helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        activity.impact === 'very helpful' && 'bg-green-500 hover:bg-green-600'
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