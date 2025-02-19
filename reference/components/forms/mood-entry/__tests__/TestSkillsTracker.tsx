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

interface Skill {
  id: string
  name: string
  used: boolean
  effectiveness?: 'not helpful' | 'somewhat helpful' | 'very helpful'
}

interface TestSkillsTrackerProps {
  onSkillsChange?: (skills: Skill[]) => void
}

export function TestSkillsTracker({
  onSkillsChange
}: TestSkillsTrackerProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const [skills, setSkills] = useState<Skill[]>(
    formDraft.skills ?? []
  )
  const [newSkillName, setNewSkillName] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [notes, setNotes] = useState(formDraft.skillsNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setSkills(formDraft.skills ?? [])
    setNotes(formDraft.skillsNotes ?? '')
  }, [formDraft.skills, formDraft.skillsNotes])

  const updateSkills = (newSkills: Skill[]) => {
    setSkills(newSkills)
    setFormDraft({ ...formDraft, skills: newSkills })
    onSkillsChange?.(newSkills)
  }

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: newSkillName.trim(),
      used: false
    }

    updateSkills([...skills, newSkill])
    setNewSkillName('')
  }

  const handleToggleSkill = (id: string) => {
    const updatedSkills = skills.map(skill =>
      skill.id === id ? { ...skill, used: !skill.used } : skill
    )
    updateSkills(updatedSkills)
  }

  const handleRemoveSkill = (id: string) => {
    const updatedSkills = skills.filter(skill => skill.id !== id)
    updateSkills(updatedSkills)
  }

  const handleEffectivenessChange = (id: string, effectiveness: Skill['effectiveness']) => {
    const updatedSkills = skills.map(skill =>
      skill.id === id ? { ...skill, effectiveness } : skill
    )
    updateSkills(updatedSkills)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (!isEditMode) {
      setNewSkillName('')
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setFormDraft({ ...formDraft, skillsNotes: newNotes })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skills Used</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {skills.length === 0 && !isEditMode && (
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
        {/* Add New Skill - Only shown in edit mode */}
        {isEditMode && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter skill name"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button 
              onClick={handleAddSkill}
              disabled={!newSkillName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Skills List */}
        <div className="space-y-2">
          {skills.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No skills added yet
            </div>
          ) : (
            skills.map(skill => (
              <div
                key={skill.id}
                className="flex flex-col gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Switch
                      id={skill.id}
                      checked={skill.used}
                      onCheckedChange={() => handleToggleSkill(skill.id)}
                    />
                    <Label
                      htmlFor={skill.id}
                      className={skill.used ? 'text-muted-foreground' : ''}
                    >
                      {skill.name}
                    </Label>
                  </div>
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSkill(skill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {skill.used && (
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant={skill.effectiveness === 'not helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleEffectivenessChange(skill.id, 'not helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        skill.effectiveness === 'not helpful' && 'bg-red-500 hover:bg-red-600'
                      )}
                    >
                      not helpful
                    </Button>
                    <Button
                      variant={skill.effectiveness === 'somewhat helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleEffectivenessChange(skill.id, 'somewhat helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        skill.effectiveness === 'somewhat helpful' && 'bg-yellow-500 hover:bg-yellow-600'
                      )}
                    >
                      somewhat helpful
                    </Button>
                    <Button
                      variant={skill.effectiveness === 'very helpful' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleEffectivenessChange(skill.id, 'very helpful')}
                      className={cn(
                        'text-xs whitespace-nowrap',
                        skill.effectiveness === 'very helpful' && 'bg-green-500 hover:bg-green-600'
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