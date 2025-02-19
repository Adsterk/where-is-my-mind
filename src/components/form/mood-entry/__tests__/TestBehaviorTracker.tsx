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

interface Behavior {
  id: string
  name: string
  experienced: boolean
  severity?: 'mild' | 'moderate' | 'severe'
}

interface TestBehaviorTrackerProps {
  onBehaviorsChange?: (behaviors: Behavior[]) => void
}

export function TestBehaviorTracker({
  onBehaviorsChange
}: TestBehaviorTrackerProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const [behaviors, setBehaviors] = useState<Behavior[]>(
    formDraft.behaviors ?? []
  )
  const [newBehaviorName, setNewBehaviorName] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [notes, setNotes] = useState(formDraft.behaviorNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setBehaviors(formDraft.behaviors ?? [])
    setNotes(formDraft.behaviorNotes ?? '')
  }, [formDraft.behaviors, formDraft.behaviorNotes])

  const updateBehaviors = (newBehaviors: Behavior[]) => {
    setBehaviors(newBehaviors)
    setFormDraft({ ...formDraft, behaviors: newBehaviors })
    onBehaviorsChange?.(newBehaviors)
  }

  const handleAddBehavior = () => {
    if (!newBehaviorName.trim()) return

    const newBehavior: Behavior = {
      id: crypto.randomUUID(),
      name: newBehaviorName.trim(),
      experienced: false
    }

    updateBehaviors([...behaviors, newBehavior])
    setNewBehaviorName('')
  }

  const handleToggleBehavior = (id: string) => {
    const updatedBehaviors = behaviors.map(behavior =>
      behavior.id === id ? { ...behavior, experienced: !behavior.experienced } : behavior
    )
    updateBehaviors(updatedBehaviors)
  }

  const handleRemoveBehavior = (id: string) => {
    const updatedBehaviors = behaviors.filter(behavior => behavior.id !== id)
    updateBehaviors(updatedBehaviors)
  }

  const handleSeverityChange = (id: string, severity: Behavior['severity']) => {
    const updatedBehaviors = behaviors.map(behavior =>
      behavior.id === id ? { ...behavior, severity } : behavior
    )
    updateBehaviors(updatedBehaviors)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (!isEditMode) {
      setNewBehaviorName('')
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setFormDraft({ ...formDraft, behaviorNotes: newNotes })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Problematic Behaviors</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {behaviors.length === 0 && !isEditMode && (
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
        {/* Add New Behavior - Only shown in edit mode */}
        {isEditMode && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter behavior"
              value={newBehaviorName}
              onChange={(e) => setNewBehaviorName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBehavior()}
            />
            <Button 
              onClick={handleAddBehavior}
              disabled={!newBehaviorName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Behaviors List */}
        <div className="space-y-2">
          {behaviors.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No behaviors added yet
            </div>
          ) : (
            behaviors.map(behavior => (
              <div
                key={behavior.id}
                className="flex flex-col gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      id={behavior.id}
                      checked={behavior.experienced}
                      onCheckedChange={() => handleToggleBehavior(behavior.id)}
                    />
                    <Label
                      htmlFor={behavior.id}
                      className={behavior.experienced ? 'text-muted-foreground' : ''}
                    >
                      {behavior.name}
                    </Label>
                  </div>
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBehavior(behavior.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {behavior.experienced && (
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant={behavior.severity === 'mild' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSeverityChange(behavior.id, 'mild')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        behavior.severity === 'mild' && 'bg-yellow-500 hover:bg-yellow-600'
                      )}
                    >
                      mild
                    </Button>
                    <Button
                      variant={behavior.severity === 'moderate' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSeverityChange(behavior.id, 'moderate')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        behavior.severity === 'moderate' && 'bg-orange-500 hover:bg-orange-600'
                      )}
                    >
                      moderate
                    </Button>
                    <Button
                      variant={behavior.severity === 'severe' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSeverityChange(behavior.id, 'severe')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        behavior.severity === 'severe' && 'bg-red-500 hover:bg-red-600'
                      )}
                    >
                      severe
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