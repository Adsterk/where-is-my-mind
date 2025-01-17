'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface TestSkill {
  id: string
  name: string
}

export interface TestSkillEntry {
  skill_id: string
  effectiveness: number
  difficulty: number
  notes?: string
}

interface TestSkillsTrackerProps {
  skills: TestSkill[]
  entries: TestSkillEntry[]
  onSkillAdd: (skill: Omit<TestSkill, 'id'>) => void
  onEntryChange: (entries: TestSkillEntry[]) => void
}

export function TestSkillsTracker({
  skills,
  entries,
  onSkillAdd,
  onEntryChange
}: TestSkillsTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      toast({
        title: "Required",
        description: "Skill name is required",
        variant: "destructive"
      })
      return
    }

    onSkillAdd({
      name: newSkill.trim()
    })
    
    setNewSkill('')
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Skill added successfully",
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const toggleSkill = (skillId: string) => {
    const existingEntry = entries.find(e => e.skill_id === skillId)
    
    if (existingEntry) {
      onEntryChange(entries.filter(e => e.skill_id !== skillId))
    } else {
      onEntryChange([...entries, {
        skill_id: skillId,
        effectiveness: 3,
        difficulty: 3
      }])
    }
  }

  const updateEntry = (skillId: string, updates: Partial<TestSkillEntry>) => {
    onEntryChange(
      entries.map(entry => 
        entry.skill_id === skillId 
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
          Add Skill
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Skill Name</Label>
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter skill name"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleAddSkill}
              >
                Save
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewSkill('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {skills.length > 0 && (
        <div className="space-y-2">
          {skills.map((skill) => {
            const entry = entries.find(e => e.skill_id === skill.id)
            
            return (
              <Card key={skill.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{skill.name}</h4>
                  <Button
                    type="button"
                    variant={entry ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {entry && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Effectiveness (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={entry.effectiveness}
                        onChange={(e) => updateEntry(skill.id, { 
                          effectiveness: parseInt(e.target.value) 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={entry.difficulty}
                        onChange={(e) => updateEntry(skill.id, { 
                          difficulty: parseInt(e.target.value) 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(skill.id, { 
                          notes: e.target.value 
                        })}
                        placeholder="Add any notes..."
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