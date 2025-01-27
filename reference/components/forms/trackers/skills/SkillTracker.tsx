'use client'

import { useState } from 'react'
import { 
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from '@/components/providers'
import { useToast } from '@/hooks'
import { validateDifficulty, sanitizeText } from '@/lib/validation'
import type { 
  Skill, 
  SkillEntry, 
  TypedSkillEntry,
  SkillTrackerProps 
} from './types'

export function SkillTracker({
  items,
  entries,
  onUpdate,
  onNewSkill,
  onDeleteItem,
  isEditing
}: SkillTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', category: '' })

  const toggleSkill = (skillId: string) => {
    const existingEntry = entries.find(e => e.skills_id === skillId)
    
    if (existingEntry) {
      onUpdate(
        items,
        entries.filter(e => e.skills_id !== skillId)
      )
    } else {
      const newEntry: TypedSkillEntry = {
        type: 'skill',
        skills_id: skillId,
        effectiveness: 'moderate',
        difficulty: 3
      }
      onUpdate(items, [...entries, newEntry])
    }
  }

  const updateEntry = (skillId: string, updates: Partial<SkillEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.skills_id !== skillId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.difficulty !== undefined && !validateDifficulty(updates.difficulty)) {
        toast({
          title: "Invalid Rating",
          description: "Difficulty must be between 1 and 5",
          variant: "destructive"
        })
        return entry
      }

      return updatedEntry
    })
    
    onUpdate(items, updatedEntries)
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.name.trim()) return

    onNewSkill({
      name: sanitizeText(newSkill.name),
      category: sanitizeText(newSkill.category),
      is_custom: true
    })
    setNewSkill({ name: '', category: '' })
    setShowAddForm(false)
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items.map(skill => {
          const entry = entries.find(e => e.skills_id === skill.id)
          
          return (
            <Card key={skill.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{skill.name}</h4>
                  {skill.category && (
                    <p className="text-sm text-muted-foreground">{skill.category}</p>
                  )}
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
                    <Label>Effectiveness</Label>
                    <Select
                      value={entry.effectiveness}
                      onValueChange={(value) => updateEntry(skill.id, {
                        effectiveness: value as 'none' | 'mild' | 'moderate' | 'significant'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="mild">Mild</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="significant">Significant</SelectItem>
                      </SelectContent>
                    </Select>
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
              <Label>Category (optional)</Label>
              <Input
                value={newSkill.category}
                onChange={(e) => setNewSkill(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Mindfulness, Communication"
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
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 