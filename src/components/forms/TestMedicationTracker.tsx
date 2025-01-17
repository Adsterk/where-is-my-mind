'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface TestMedication {
  id: string
  name: string
  dosage: string
}

export interface TestMedicationEntry {
  medication_id: string
  time_taken: string
  notes?: string
  side_effects?: string
}

interface TestMedicationTrackerProps {
  medications: TestMedication[]
  entries: TestMedicationEntry[]
  onMedicationAdd: (medication: Omit<TestMedication, 'id'>) => void
  onEntryChange: (entries: TestMedicationEntry[]) => void
}

export function TestMedicationTracker({
  medications,
  entries,
  onMedicationAdd,
  onEntryChange
}: TestMedicationTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '' })
  
  // Reference for the dosage input
  const dosageInputRef = useRef<HTMLInputElement>(null)

  const handleAddMedication = () => {
    if (!newMedication.name.trim()) {
      toast({
        title: "Required",
        description: "Medication name is required",
        variant: "destructive"
      })
      return
    }

    onMedicationAdd({
      name: newMedication.name.trim(),
      dosage: newMedication.dosage.trim()
    })
    
    setNewMedication({ name: '', dosage: '' })
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Medication added successfully",
    })
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission
      dosageInputRef.current?.focus() // Move focus to dosage input
    }
  }

  const handleDosageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission
      if (newMedication.name.trim()) {
        handleAddMedication() // Only save if name is provided
      }
    }
  }

  const toggleMedication = (medicationId: string) => {
    const existingEntry = entries.find(e => e.medication_id === medicationId)
    
    if (existingEntry) {
      onEntryChange(entries.filter(e => e.medication_id !== medicationId))
    } else {
      onEntryChange([...entries, {
        medication_id: medicationId,
        time_taken: new Date().toISOString().slice(0, 16),
        notes: '',
        side_effects: ''
      }])
    }
  }

  const updateEntry = (medicationId: string, updates: Partial<TestMedicationEntry>) => {
    onEntryChange(
      entries.map(entry => 
        entry.medication_id === medicationId 
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
          Add Medication
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medication Name</Label>
              <Input
                value={newMedication.name}
                onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={handleNameKeyDown}
                placeholder="Enter medication name"
                autoFocus // Focus when form opens
              />
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input
                ref={dosageInputRef}
                value={newMedication.dosage}
                onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                onKeyDown={handleDosageKeyDown}
                placeholder="Enter dosage"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleAddMedication}
              >
                Save
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewMedication({ name: '', dosage: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {medications.length > 0 && (
        <div className="space-y-2">
          {medications.map((medication) => {
            const entry = entries.find(e => e.medication_id === medication.id)
            
            return (
              <Card key={medication.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{medication.name}</h4>
                    <p className="text-sm text-muted-foreground">{medication.dosage}</p>
                  </div>
                  <Button
                    type="button"
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