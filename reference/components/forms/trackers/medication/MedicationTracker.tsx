'use client'

import { useState } from 'react'
import { 
  Button,
  Input,
  Label,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui'
import { Check, Plus, Trash2, Clock, FileText, AlertCircle } from 'lucide-react'
import { useFormEdit } from '@/components/providers'
import { useToast } from '@/hooks'
import { validateTimeFormat, sanitizeText, validateEffectiveness } from '@/lib/validation'
import type { 
  Medication, 
  MedicationEntry, 
  MedicationSchedule,
  NewMedicationState,
  MedicationTrackerProps 
} from './types'
import type { TypedMedicationEntry } from '@/types/entries'

export function MedicationTracker({
  items = [],
  entries = [],
  onUpdate,
  onNewMedication,
  onDeleteItem,
  isEditing = false
}: MedicationTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedication, setNewMedication] = useState<NewMedicationState>({
    name: '',
    dosage: '',
    schedule: 'as_needed'
  })

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMedication.name.trim()) {
      toast({
        title: "Error",
        description: "Medication name is required",
        variant: "destructive"
      })
      return
    }

    onNewMedication?.({
      name: sanitizeText(newMedication.name),
      dosage: sanitizeText(newMedication.dosage),
      schedule: newMedication.schedule,
      is_custom: true
    })

    setNewMedication({ name: '', dosage: '', schedule: 'as_needed' })
    setShowAddForm(false)
  }

  const toggleMedication = (medicationId: string) => {
    const existingEntry = entries.find(e => e.medication_id === medicationId)
    
    if (existingEntry) {
      onUpdate(
        items,
        entries.filter(e => e.medication_id !== medicationId)
      )
    } else {
      const newEntry: TypedMedicationEntry = {
        type: 'medication',
        medication_id: medicationId,
        time_taken: new Date().toISOString(),
        effectiveness: 'moderate',
        side_effects: ''
      }
      onUpdate(items, [...entries, newEntry])
    }
  }

  const updateEntry = (medicationId: string, updates: Partial<MedicationEntry>) => {
    const updatedEntries = entries.map(entry => {
      if (entry.medication_id !== medicationId) return entry
      
      const updatedEntry = { ...entry, ...updates }

      if (updates.effectiveness !== undefined && !validateEffectiveness(Number(updates.effectiveness))) {
        toast({
          title: "Invalid Rating", 
          description: "Please select a valid effectiveness rating",
          variant: "destructive"
        })
        return entry
      }

      if (updates.side_effects !== undefined) {
        updatedEntry.side_effects = sanitizeText(updates.side_effects) || ''
      }

      if (updates.notes !== undefined) {
        updatedEntry.notes = sanitizeText(updates.notes) || ''
      }

      return updatedEntry
    })

    onUpdate(items, updatedEntries)
  }

  const handleTimeChange = (medicationId: string, timeStr: string) => {
    if (validateTimeFormat(timeStr)) {
      const entry = entries.find(e => e.medication_id === medicationId)
      if (!entry) return

      // Create a new date from the existing time
      const date = new Date(entry.time_taken)
      
      // Parse time string safely
      const [hoursStr, minutesStr] = timeStr.split(':')
      const hours = parseInt(hoursStr, 10)
      const minutes = parseInt(minutesStr, 10)
      
      // Only update if we have valid numbers
      if (!isNaN(hours) && !isNaN(minutes)) {
        date.setHours(hours, minutes)
        updateEntry(medicationId, {
          time_taken: date.toISOString()
        })
      }
    }
  }

  return (
    <CardContent>
      <div className="space-y-4">
        {items?.length > 0 && (
          <div className="grid gap-4">
            {items.map((medication) => {
              if (!medication) return null
              const entry = entries?.find(e => e?.medication_id === medication.id)
              
              return (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{medication.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {medication.dosage && (
                            <p>Dosage: {medication.dosage}</p>
                          )}
                          <p>Schedule: {medication.schedule ? medication.schedule.replace('_', ' ') : 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isEditing && medication.is_custom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteItem?.(medication.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMedication(medication.id)}
                        >
                          {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {entry && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Time Taken
                          </Label>
                          <Input
                            type="time"
                            value={entry.time_taken.split('T')[1].substring(0, 5)}
                            onChange={(e) => handleTimeChange(entry.medication_id, e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Notes
                          </Label>
                          <Input
                            value={entry.notes || ''}
                            onChange={(e) => updateEntry(entry.medication_id, {
                              notes: e.target.value
                            })}
                            placeholder="Add any notes..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Side Effects
                          </Label>
                          <Input
                            value={entry.side_effects || ''}
                            onChange={(e) => updateEntry(entry.medication_id, {
                              side_effects: e.target.value
                            })}
                            placeholder="Any side effects?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Effectiveness</Label>
                          <Select
                            value={entry.effectiveness}
                            onValueChange={(value) => updateEntry(entry.medication_id, {
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {showAddForm ? (
          <form onSubmit={handleAddMedication} className="space-y-4">
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
                placeholder="e.g., 50mg"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select
                value={newMedication.schedule}
                onValueChange={(value: MedicationSchedule) => setNewMedication(prev => ({ 
                  ...prev, 
                  schedule: value
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
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
              Add Medication
            </Button>
          )
        )}
      </div>
    </CardContent>
  )
} 