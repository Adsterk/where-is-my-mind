'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useFormEdit } from './FormEditContext'
import { validateTimeFormat, sanitizeText } from '@/lib/validation'
import { useToast } from '@/hooks/use-toast'

export interface Medication {
  id: string
  name: string
  dosage: string
  is_custom: boolean
}

export interface MedicationEntry {
  medication_id: string
  time_taken: string
  notes?: string
  side_effects?: string
}

interface MedicationTrackerProps {
  items: Medication[]
  entries: MedicationEntry[]
  onUpdate: (items: Medication[], entries: MedicationEntry[]) => void
  onNewMedication?: (medication: Omit<Medication, 'id'>) => void
}

export function MedicationTracker({ 
  items,
  entries,
  onUpdate,
  onNewMedication 
}: MedicationTrackerProps) {
  const { isEditing } = useFormEdit()
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '' })

  const validateEntry = (entry: MedicationEntry): boolean => {
    if (!validateTimeFormat(entry.time_taken)) {
      toast({
        title: "Invalid Time Format",
        description: "Please enter a valid time",
        variant: "destructive"
      })
      return false
    }
    return true
  }

  const handleAddMedication = () => {
    if (!newMedication.name.trim()) {
      toast({
        title: "Invalid Input",
        description: "Medication name is required",
        variant: "destructive"
      })
      return
    }
    
    if (onNewMedication) {
      onNewMedication({
        name: newMedication.name.trim(),
        dosage: newMedication.dosage.trim(),
        is_custom: true
      })
    }
    
    setNewMedication({ name: '', dosage: '' })
    setShowAddForm(false)
  }

  const toggleMedication = (medicationId: string) => {
    const existingEntry = entries.find(e => e.medication_id === medicationId)
    
    if (existingEntry) {
      onUpdate(items, entries.filter(e => e.medication_id !== medicationId))
    } else {
      const newEntry: MedicationEntry = {
        medication_id: medicationId,
        time_taken: new Date().toISOString().slice(0, 16),
        notes: '',
        side_effects: ''
      }
      
      if (validateEntry(newEntry)) {
        onUpdate(items, [...entries, newEntry])
      }
    }
  }

  const updateEntry = (medicationId: string, updates: Partial<MedicationEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.medication_id !== medicationId) return entry
      
      const updatedEntry = { ...entry, ...updates }
      if (updates.time_taken && !validateTimeFormat(updates.time_taken)) {
        toast({
          title: "Invalid Time Format",
          description: "Please enter a valid time",
          variant: "destructive"
        })
        return entry
      }

      if (updates.notes !== undefined) {
        updatedEntry.notes = sanitizeText(updates.notes) || ''
      }
      
      if (updates.side_effects !== undefined) {
        updatedEntry.side_effects = sanitizeText(updates.side_effects) || ''
      }

      return updatedEntry
    })

    onUpdate(items, updatedEntries)
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          setShowAddForm(true)
        }}
      >
        Add Medication
      </Button>

      {showAddForm && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medication Name</Label>
              <Input
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter medication name"
              />
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="Enter dosage"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMedication}>Save</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((medication) => {
            const entry = entries.find(e => e.medication_id === medication.id)
            
            return (
              <Card key={medication.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{medication.name}</h4>
                    <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                  </div>
                  <Button
                    variant={entry ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleMedication(medication.id)}
                  >
                    {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {entry && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Time Taken</Label>
                      <Input
                        type="datetime-local"
                        value={entry.time_taken}
                        onChange={(e) => updateEntry(medication.id, { 
                          time_taken: e.target.value 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(medication.id, { 
                          notes: e.target.value 
                        })}
                        placeholder="Add any notes..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Side Effects (optional)</Label>
                      <Input
                        value={entry.side_effects || ''}
                        onChange={(e) => updateEntry(medication.id, { 
                          side_effects: e.target.value 
                        })}
                        placeholder="Document any side effects..."
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