'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useLocalStore } from '@/lib/stores/localStore'
import { cn } from '@/lib/utils'

interface Medication {
  id: string
  name: string
  taken: boolean
}

interface TestMedicationTrackerProps {
  onMedicationsChange?: (medications: Medication[]) => void
}

export function TestMedicationTracker({
  onMedicationsChange
}: TestMedicationTrackerProps) {
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)
  const [medications, setMedications] = useState<Medication[]>(
    formDraft.medications ?? []
  )
  const [newMedName, setNewMedName] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [notes, setNotes] = useState(formDraft.medicationNotes ?? '')

  // Update local state when form draft changes
  useEffect(() => {
    setMedications(formDraft.medications ?? [])
    setNotes(formDraft.medicationNotes ?? '')
  }, [formDraft.medications, formDraft.medicationNotes])

  const updateMedications = (newMedications: Medication[]) => {
    setMedications(newMedications)
    setFormDraft({ ...formDraft, medications: newMedications })
    onMedicationsChange?.(newMedications)
  }

  const handleAddMedication = () => {
    if (!newMedName.trim()) return

    const newMed: Medication = {
      id: crypto.randomUUID(),
      name: newMedName.trim(),
      taken: false
    }

    updateMedications([...medications, newMed])
    setNewMedName('')
  }

  const handleToggleMedication = (id: string) => {
    const updatedMeds = medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    )
    updateMedications(updatedMeds)
  }

  const handleRemoveMedication = (id: string) => {
    const updatedMeds = medications.filter(med => med.id !== id)
    updateMedications(updatedMeds)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value
    setNotes(newNotes)
    setFormDraft({ ...formDraft, medicationNotes: newNotes })
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    if (!isEditMode) {
      setNewMedName('')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Medication Tracker</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {medications.length === 0 && !isEditMode && (
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
        {/* Add New Medication - Only shown in edit mode */}
        {isEditMode && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter medication name and dosage"
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMedication()}
            />
            <Button 
              onClick={handleAddMedication}
              disabled={!newMedName.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Medication List */}
        <div className="space-y-2">
          {medications.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              No medications added yet
            </div>
          ) : (
            medications.map(med => (
              <div
                key={med.id}
                className="flex flex-col gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={med.id}
                      checked={med.taken}
                      onCheckedChange={() => handleToggleMedication(med.id)}
                    />
                    <Label
                      htmlFor={med.id}
                      className={cn(
                        med.taken && "text-muted-foreground"
                      )}
                    >
                      {med.name}
                    </Label>
                  </div>
                  {isEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMedication(med.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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