'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from './FormEditContext'
import { validateEffectiveness, validateDifficulty, sanitizeText } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

export interface Skill {
  id: string
  name: string
  category: string
  is_custom: boolean
}

export interface SkillEntry {
  skill_id: string
  effectiveness: number
  difficulty: number
  notes?: string
}

export interface SkillsTrackerProps {
  items: Skill[]
  entries: SkillEntry[]
  onUpdate: (items: Skill[], entries: SkillEntry[]) => void
  onNewSkill: (skill: Omit<Skill, 'id'>) => void
}

export function SkillsTracker({ 
  items, 
  entries, 
  onUpdate, 
  onNewSkill 
}: SkillsTrackerProps) {
  const { isEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', category: '' })

  const validateEntry = (entry: SkillEntry): boolean => {
    if (!validateEffectiveness(entry.effectiveness)) {
      toast({
        title: "Invalid effectiveness rating",
        description: "Effectiveness must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }

    if (!validateDifficulty(entry.difficulty)) {
      toast({
        title: "Invalid difficulty rating",
        description: "Difficulty must be between 1 and 5",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const toggleSkill = (skillId: string) => {
    const existingEntry = entries.find(e => e.skill_id === skillId)
    
    if (existingEntry) {
      onUpdate(items, entries.filter(e => e.skill_id !== skillId))
    } else {
      const newEntry: SkillEntry = {
        skill_id: skillId,
        effectiveness: 3,
        difficulty: 3,
        notes: ''
      }
      
      if (validateEntry(newEntry)) {
        onUpdate(items, [...entries, newEntry])
      }
    }
  }

  const updateEntry = (skillId: string, updates: Partial<SkillEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.skill_id !== skillId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.effectiveness !== undefined && !validateEffectiveness(updates.effectiveness)) {
        toast({
          title: "Invalid effectiveness rating",
          description: "Effectiveness must be between 1 and 5",
          variant: "destructive"
        })
        return entry
      }

      if (updates.difficulty !== undefined && !validateDifficulty(updates.difficulty)) {
        toast({
          title: "Invalid difficulty rating",
          description: "Difficulty must be between 1 and 5",
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

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.name.trim() || !newSkill.category.trim()) {
      toast({
        title: "Invalid Input",
        description: "Both skill name and category are required",
        variant: "destructive"
      })
      return
    }

    onNewSkill({
      name: newSkill.name.trim(),
      category: newSkill.category.trim(),
      is_custom: true
    })
    
    setNewSkill({ name: '', category: '' })
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map((skill) => {
          const entry = entries.find(e => e.skill_id === skill.id)
          
          return (
            <Card key={skill.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{skill.name}</h4>
                  <div className="text-sm text-muted-foreground">{skill.category}</div>
                </div>
                <Button
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
                    <Label>Difficulty Level (1-5)</Label>
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
                      value={entry.notes}
                      onChange={(e) => updateEntry(skill.id, { 
                        notes: e.target.value 
                      })}
                      placeholder="Add notes about using this skill..."
                    />
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {showAddForm ? (
          <form onSubmit={handleAddSkill} className="space-y-4">
            <div className="space-y-2">
              <Label>Skill Name</Label>
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter skill name"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={newSkill.category}
                onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Mindfulness, Interpersonal"
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
              Add Skill
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 