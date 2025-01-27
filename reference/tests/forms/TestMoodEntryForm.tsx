'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { TestMoodAndNotesTracker } from './test.specMoodAndNotesTracker'
import { TestSleepTracker } from './test.specSleepTracker'
import { TestMedicationTracker } from './test.specMedicationTracker'
import { TestSection, SectionType } from './section-management/types'
import { EditModeProvider, useEditMode } from './context/EditModeContext'
import { TestFormHeader } from './TestFormHeader'
import { getStorageData, setStorageData } from './utils/storage'
import { useHotkeys } from 'react-hotkeys-hook'
import { TestSectionCreator } from './section-management/TestSectionCreator'
import { 
  DndContext, 
  useSensors, 
  useSensor,
  PointerSensor,
  closestCenter 
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import { TestSectionReorder } from './section-management/TestSectionReorder'

// Update FormData interface to include custom sections
interface FormData {
  moodAndNotes: {
    mood_score: number
    notes: string | null
    is_bipolar_scale: boolean
  }
  sleep: {
    sleep_hours: number
    sleep_quality: string | null
  }
  medications: {
    items: Array<{
      id: string
      name: string
      dosage: string
    }>
    entries: Array<{
      medication_id: string
      time_taken: string
      notes?: string
      side_effects?: string
    }>
  }
  customSections: Array<{
    id: string
    type: SectionType
    title: string
    config: any
  }>
}

const defaultFormData: FormData = {
  moodAndNotes: {
    mood_score: 7,
    notes: null,
    is_bipolar_scale: false
  },
  sleep: {
    sleep_hours: 8,
    sleep_quality: null
  },
  medications: {
    items: [],
    entries: []
  },
  customSections: []
}

export function TestMoodEntryFormContent() {
  const { isEditing, toggleEditMode } = useEditMode()
  const { toast } = useToast()
  const isInitialMount = useRef(true)
  
  // Initialize with default data
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(true)

  // Load data after mount
  useEffect(() => {
    if (isInitialMount.current) {
      try {
        const savedData = getStorageData('test-form-data', defaultFormData)
        // Ensure customSections is initialized
        const validatedData = {
          ...savedData,
          customSections: Array.isArray(savedData.customSections) 
            ? savedData.customSections 
            : []
        }
        setFormData(validatedData)
      } catch (error) {
        console.error('Error loading form data:', error)
        setFormData(defaultFormData)
      } finally {
        setIsLoading(false)
        isInitialMount.current = false
      }
    }
  }, [])

  // Add debounced autosave
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStorageData('test-form-data', formData)
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [formData])

  // Handle form data updates
  const handleFormDataUpdate = useCallback((section: keyof FormData, data: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [section]: data
      }
      setStorageData('test-form-data', newData)
      return newData
    })
  }, [])

  // Create sections with loading state
  const createSections = useCallback((currentFormData: FormData): TestSection[] => {
    if (isLoading || !currentFormData) {
      return []
    }

    const defaultSections: TestSection[] = [
      {
        id: 'mood',
        type: 'mood' as SectionType,
        title: 'Mood and Notes',
        component: (
          <TestMoodAndNotesTracker 
            key="mood-tracker"
            value={currentFormData.moodAndNotes}
            onUpdate={(data) => handleFormDataUpdate('moodAndNotes', data)}
          />
        ),
        isVisible: true
      },
      {
        id: 'sleep',
        type: 'sleep' as SectionType,
        title: 'Sleep',
        component: (
          <TestSleepTracker
            key="sleep-tracker"
            value={currentFormData.sleep}
            onUpdate={(data) => handleFormDataUpdate('sleep', data)}
          />
        ),
        isVisible: true
      },
      {
        id: 'medications',
        type: 'medication' as SectionType,
        title: 'Medications',
        component: (
          <TestMedicationTracker
            key="medication-tracker"
            medications={currentFormData.medications.items}
            entries={currentFormData.medications.entries}
            onMedicationAdd={(medication) => {
              const newMedication = {
                id: crypto.randomUUID(),
                ...medication
              }
              handleFormDataUpdate('medications', {
                items: [...currentFormData.medications.items, newMedication],
                entries: currentFormData.medications.entries
              })
            }}
            onEntryChange={(entries) => {
              handleFormDataUpdate('medications', {
                ...currentFormData.medications,
                entries
              })
            }}
          />
        ),
        isVisible: true
      }
    ]

    const customSections = currentFormData.customSections?.map(section => ({
      id: section.id,
      type: section.type as SectionType,
      title: section.title,
      component: createSectionComponent({
        id: section.id,
        type: section.type as SectionType,
        title: section.title,
        isVisible: true,
        component: null
      },
      currentFormData,
      handleFormDataUpdate),
      isVisible: true
    })) || []

    return [...defaultSections, ...customSections]
  }, [handleFormDataUpdate, isLoading])

  // Initialize sections with loading state
  const [orderedSections, setOrderedSections] = useState<TestSection[]>([])

  useEffect(() => {
    if (!isLoading) {
      const savedOrder = getStorageData('section-order', null)
      const sections = createSections(formData)
      
      if (savedOrder) {
        const orderedSections = savedOrder
          .map(id => sections.find(s => s.id === id))
          .filter((s): s is TestSection => s !== undefined)
        
        const remainingSections = sections.filter(s => !savedOrder.includes(s.id))
        setOrderedSections([...orderedSections, ...remainingSections])
      } else {
        setOrderedSections(sections)
      }
    }
  }, [formData, createSections, isLoading])

  const handleSectionsReorder = useCallback((newSections: TestSection[]) => {
    setOrderedSections(newSections)
    // Persist the new order without triggering form submission
    setStorageData('section-order', newSections.map(s => s.id))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Ensure form doesn't submit accidentally
    
    // Only proceed if this was triggered by the submit button
    if (!(e.target as HTMLFormElement).checkValidity()) {
      return
    }

    // Validate form data
    const validationErrors = validateFormData(formData)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast({
          title: "Validation Error",
          description: error,
          variant: "destructive"
        })
      })
      return
    }

    if (confirm('Form submitted successfully. Would you like to clear the form?')) {
      setFormData(defaultFormData)
      localStorage.removeItem('test-form-data')
      localStorage.removeItem('section-order')
      toast({
        title: "Form Cleared",
        description: "All data has been cleared"
      })
    } else {
      toast({
        title: "Form Submitted",
        description: "Your data has been kept for further editing"
      })
    }
  }

  // Add validation function
  const validateFormData = (data: FormData): string[] => {
    const errors: string[] = []
    
    if (data.moodAndNotes.mood_score < 1 || data.moodAndNotes.mood_score > 10) {
      errors.push("Mood score must be between 1 and 10")
    }
    
    if (data.sleep.sleep_hours < 0 || data.sleep.sleep_hours > 24) {
      errors.push("Sleep hours must be between 0 and 24")
    }

    return errors
  }

  // Add keyboard shortcuts
  useHotkeys('ctrl+e', (e) => {
    e.preventDefault()
    toggleEditMode()
  }, [toggleEditMode])

  useHotkeys('esc', () => {
    if (isEditing) {
      toggleEditMode()
    }
  }, [isEditing, toggleEditMode])

  const handleSectionCreate = useCallback((newSection: TestSection) => {
    if (!newSection || !formData) return

    try {
      // Create the actual component based on the section type
      const sectionWithComponent: TestSection = {
        ...newSection,
        component: createSectionComponent(newSection, formData, handleFormDataUpdate)
      }

      // Update sections immediately
      const newSections = [...(orderedSections || []), sectionWithComponent]
      setOrderedSections(newSections)
      
      // Save the new order
      setStorageData('section-order', newSections.map(s => s.id))

      // Save the section data
      setFormData(prev => ({
        ...prev,
        customSections: [
          ...(prev.customSections || []),
          {
            id: newSection.id,
            type: newSection.type,
            title: newSection.title,
            config: {}
          }
        ]
      }))

      // Scroll after a brief delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(`section-${newSection.id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } catch (error) {
      console.error('Error creating section:', error)
    }
  }, [formData, orderedSections, handleFormDataUpdate])

  // Update the renderSections function to properly use TestSectionReorder
  const renderSections = useCallback(() => {
    if (!orderedSections) return null

    if (isEditing) {
      return (
        <TestSectionReorder 
          initialSections={orderedSections}
          onSectionsReorder={handleSectionsReorder}
        >
          {orderedSections.map(section => (
            <div key={section.id}>
              {section.component}
            </div>
          ))}
        </TestSectionReorder>
      )
    }

    // View mode rendering
    return orderedSections.map(section => (
      <Card 
        key={section.id} 
        id={`section-${section.id}`}
        className="mb-6"
      >
        <CardHeader>
          <CardTitle>{section.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {section.component}
        </CardContent>
      </Card>
    ))
  }, [isEditing, orderedSections, handleSectionsReorder])

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading form...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <TestFormHeader />
        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          onKeyDown={(e) => {
            // Prevent form submission on arrow keys
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
              e.preventDefault()
            }
          }}
        >
          {isEditing && (
            <div className="px-6">
              <TestSectionCreator onSectionCreate={handleSectionCreate} />
            </div>
          )}
          
          <div className="space-y-6 p-6">
            {renderSections()}
          </div>

          <div className="px-6 pb-6">
            <Button type="submit">Submit Test Form</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

// Update the createSectionComponent function to handle all section types
function createSectionComponent(
  section: TestSection, 
  formData: FormData, 
  handleFormDataUpdate: (section: keyof FormData, data: any) => void
) {
  switch (section.type) {
    case 'medication':
      return (
        <TestMedicationTracker
          key={`medication-${section.id}`}
          medications={formData.medications.items}
          entries={formData.medications.entries}
          onMedicationAdd={(medication) => {
            const newMedication = {
              id: crypto.randomUUID(),
              ...medication
            }
            handleFormDataUpdate('medications', {
              items: [...formData.medications.items, newMedication],
              entries: formData.medications.entries
            })
          }}
          onEntryChange={(entries) => {
            handleFormDataUpdate('medications', {
              ...formData.medications,
              entries
            })
          }}
        />
      )
    case 'activity':
      return (
        <div key={`activity-${section.id}`} className="p-4">
          <p>Activity Tracker Component (Coming Soon)</p>
        </div>
      )
    // Add other cases for different section types with placeholder components
    default:
      return (
        <div key={`${section.type}-${section.id}`} className="p-4">
          <p>{section.title} Component (Coming Soon)</p>
        </div>
      )
  }
}

export default function TestMoodEntryForm() {
  return (
    <EditModeProvider>
      <TestMoodEntryFormContent />
    </EditModeProvider>
  )
} 