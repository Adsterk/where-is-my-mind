'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  LoadingSpinner 
} from '@/components/ui'
import { useToast, useFormPersistence } from '@/hooks'
import { useRouter } from 'next/navigation'
import { useSupabase, useFormEdit } from '@/components/providers'
import { 
  MoodTracker,
  SleepTracker,
  MedicationTrackerWithErrorBoundary,
  ActivityTracker,
  BehaviorTracker,
  SkillTracker,
  SocialConnectionTracker,
  SpiritualityTracker,
  type Activity,
  type ActivityEntry,
  type TypedActivityEntry,
  type Behavior,
  type BehaviorEntry,
  type TypedBehaviorEntry,
  type Medication,
  type MedicationEntry,
  type TypedMedicationEntry,
  type Skill,
  type SkillEntry,
  type TypedSkillEntry,
  type SocialConnection,
  type SocialConnectionEntry,
  type TypedSocialEntry,
  type SpiritualPractice,
  type SpiritualPracticeEntry,
  type TypedSpiritualityEntry
} from '../trackers'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Edit, ChevronUp, ChevronDown, X, Trash2 } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableSection } from './DraggableSection'
import { 
  getEntryId, 
  TypedEntry
} from '@/types/entries'
import { convertEntries } from './type-utils'
import type { SectionId, SectionEntryMap, TrackerSectionId } from '@/types/forms'
import { createTrackerSection } from './section-renderer'
import type { Section } from '@/components/forms/types'
import type { FormData } from '@/types/forms'
import { createTracker } from './tracker-factory'

const initialFormData: FormData = {
  moodAndNotes: {
    mood_score: 5,
    notes: null,
    is_bipolar_scale: false
  },
  sleep: {
    sleep_hours: 8,
    sleep_quality: null
  },
  medications: { items: [], entries: [] },
  activities: { items: [], entries: [] },
  behaviors: { items: [], entries: [] },
  skills: { items: [], entries: [] },
  socialConnections: { items: [], entries: [] },
  spirituality: { items: [], entries: [] }
}

// First, add a type guard helper
function getTypedEntries<T extends TrackerSectionId>(
  entries: any[],
  sectionId: T
): SectionEntryMap[T] {
  const typeMap = {
    medications: 'medication',
    activities: 'activity',
    behaviors: 'behavior',
    skills: 'skill',
    socialConnections: 'social',
    spirituality: 'spirituality'
  } as const

  return entries.filter(entry => entry?.type === typeMap[sectionId]) as SectionEntryMap[T]
}

export function MoodEntryForm() {
  const { supabase, user } = useSupabase()
  const { isEditing, setIsEditing } = useFormEdit()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  
  // Use form persistence for the whole form state
  const [formData, setFormData] = useFormPersistence('mood-entry-form', initialFormData)

  // Add handlers for each tracker type BEFORE they're used
  const handleNewMedication = (medication: Omit<Medication, 'id'>) => {
    const newMedication = { ...medication, id: crypto.randomUUID() }
    setFormData(prev => ({
      ...prev,
      medications: {
        items: [...prev.medications.items, newMedication],
        entries: prev.medications.entries
      }
    }))
  }

  const handleNewActivity = (activity: Omit<Activity, 'id'>) => {
    const newActivity = { ...activity, id: crypto.randomUUID() }
    setFormData(prev => ({
      ...prev,
      activities: {
        items: [...prev.activities.items, newActivity],
        entries: prev.activities.entries
      }
    }))
  }

  const handleNewBehavior = (behavior: Omit<Behavior, 'id'>) => {
    const newBehavior = { ...behavior, id: crypto.randomUUID() }
    setFormData(prev => ({
      ...prev,
      behaviors: {
        items: [...prev.behaviors.items, newBehavior],
        entries: prev.behaviors.entries
      }
    }))
  }

  const handleNewSkill = (skill: Omit<Skill, 'id'>) => {
    const newSkill = { ...skill, id: crypto.randomUUID() }
    setFormData(prev => ({
      ...prev,
      skills: {
        items: [...prev.skills.items, newSkill],
        entries: prev.skills.entries
      }
    }))
  }

  const handleNewConnection = (connection: Omit<SocialConnection, 'id'>) => {
    const newConnection = { ...connection, id: crypto.randomUUID() }
    setFormData(prev => ({
      ...prev,
      socialConnections: {
        items: [...prev.socialConnections.items, newConnection],
        entries: prev.socialConnections.entries
      }
    }))
  }

  const handleNewPractice = (practice: Omit<SpiritualPractice, 'id'>) => {
    const newPractice = { ...practice, id: crypto.randomUUID() }
    setFormData(prev => ({
      ...prev,
      spirituality: {
        items: [...prev.spirituality.items, newPractice],
        entries: prev.spirituality.entries
      }
    }))
  }

  const handleActivityUpdate = (items: Activity[], entries: ActivityEntry[]) => {
    setFormData(prev => ({
      ...prev,
      activities: {
        items,
        entries: entries.map(entry => ({
          ...entry,
          type: 'activity' as const,
          activities_id: entry.activities_id
        })) as TypedActivityEntry[]
      }
    }))
  }

  const handleBehaviorUpdate = (items: Behavior[], entries: BehaviorEntry[]) => {
    setFormData(prev => ({
      ...prev,
      behaviors: {
        items,
        entries: entries.map(entry => ({
          ...entry,
          type: 'behavior' as const,
          behaviors_id: entry.behaviors_id
        })) as TypedBehaviorEntry[]
      }
    }))
  }

  const handleSkillUpdate = (items: Skill[], entries: SkillEntry[]) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        items,
        entries: entries.map(entry => ({
          ...entry,
          type: 'skill' as const,
          skills_id: entry.skills_id
        })) as TypedSkillEntry[]
      }
    }))
  }

  const handleSocialUpdate = (items: SocialConnection[], entries: SocialConnectionEntry[]) => {
    setFormData(prev => ({
      ...prev,
      socialConnections: {
        items,
        entries: entries.map(entry => ({
          ...entry,
          type: 'social' as const,
          social_id: entry.social_id
        })) as TypedSocialEntry[]
      }
    }))
  }

  const handleSpiritualityUpdate = (items: SpiritualPractice[], entries: SpiritualPracticeEntry[]) => {
    setFormData(prev => ({
      ...prev,
      spirituality: {
        items,
        entries: entries.map(entry => ({
          ...entry,
          type: 'spirituality' as const,
          spirituality_id: entry.spirituality_id
        })) as TypedSpiritualityEntry[]
      }
    }))
  }

  // THEN define sections that use these handlers
  const [sections, setSections] = useState<Section[]>(() => [
    // Non-tracker sections
    {
      id: 'mood',
      title: 'Mood',
      component: (
        <MoodTracker
          value={formData.moodAndNotes}
          onUpdate={(data) => setFormData(prev => ({
            ...prev,
            moodAndNotes: data
          }))}
        />
      ),
      isVisible: true
    },
    {
      id: 'sleep',
      title: 'Sleep',
      component: (
        <SleepTracker
          value={formData.sleep}
          onUpdate={(data) => setFormData(prev => ({
            ...prev,
            sleep: data
          }))}
        />
      ),
      isVisible: true
    },
    // Tracker sections using the factory
    createTracker('medications', {
      items: formData.medications.items,
      entries: formData.medications.entries,
      onUpdate: (items, entries) => setFormData(prev => ({
        ...prev,
        medications: { items, entries }
      })),
      isEditing,
      onDeleteItem: (itemId) => handleDeleteItem('medications', itemId)
    }),
    createTracker('activities', {
      items: formData.activities.items,
      entries: formData.activities.entries,
      onUpdate: (items, entries) => setFormData(prev => ({
        ...prev,
        activities: { items, entries }
      })),
      isEditing,
      onDeleteItem: (itemId) => handleDeleteItem('activities', itemId)
    }),
    {
      id: 'behaviors',
      title: 'Behaviors',
      component: (
        <BehaviorTracker
          items={formData.behaviors.items}
          entries={formData.behaviors.entries}
          onUpdate={handleBehaviorUpdate}
          onNewBehavior={handleNewBehavior}
          isEditing={isEditing}
        />
      ),
      isVisible: true
    },
    {
      id: 'skills',
      title: 'Skills',
      component: (
        <SkillTracker
          items={formData.skills.items}
          entries={formData.skills.entries as TypedSkillEntry[]}
          onUpdate={handleSkillUpdate}
          onNewSkill={handleNewSkill}
          isEditing={isEditing}
        />
      ),
      isVisible: true
    },
    {
      id: 'socialConnections' as const,
      title: 'Social Connections',
      component: (
        <SocialConnectionTracker
          items={formData.socialConnections.items}
          entries={formData.socialConnections.entries}
          onUpdate={handleSocialUpdate}
          onNewConnection={handleNewConnection}
          isEditing={isEditing}
        />
      ),
      isVisible: true
    },
    {
      id: 'spirituality',
      title: 'Spiritual Practices',
      component: (
        <SpiritualityTracker
          items={formData.spirituality.items}
          entries={formData.spirituality.entries as TypedSpiritualityEntry[]}
          onUpdate={handleSpiritualityUpdate}
          onNewPractice={handleNewPractice}
          isEditing={isEditing}
        />
      ),
      isVisible: true
    }
  ])

  // Update cleanup functionality
  useEffect(() => {
    return () => {
      if (!user) return
      const cleanupDrafts = async () => {
        try {
          const { error } = await supabase.rpc('cleanup_draft_entries', {
            p_user_id: user.id,
            p_hours_old: 24
          })
          if (error) {
            console.error('Failed to cleanup drafts:', error.message)
            // Only show toast for non-404 errors since 404 means function doesn't exist yet
            if (error.code !== 'PGRST404') {
              toast({
                title: "Error cleaning up drafts",
                description: error.message,
                variant: "destructive"
              })
            }
          }
        } catch (err) {
          console.error('Error during cleanup:', err)
        }
      }
      cleanupDrafts()
    }
  }, [user, supabase, toast])

  // Enhanced submit handler with validation
  const handleSubmit = async () => {
    if (!user) return
    
    // Validate required fields
    if (formData.moodAndNotes.mood_score < 1 || formData.moodAndNotes.mood_score > 10) {
      toast({
        title: "Invalid Mood Score",
        description: "Please enter a valid mood score between 1 and 10",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // First create the mood entry
      const { data: moodEntry, error: moodError } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: formData.moodAndNotes.mood_score,
          notes: formData.moodAndNotes.notes,
          is_bipolar_scale: formData.moodAndNotes.is_bipolar_scale,
          section_order: sections.map(s => s.id)
        })
        .select()
        .single()

      if (moodError) throw moodError

      // Then update all related entries
      await Promise.all([
        // Update medication entries
        ...formData.medications.entries.map(entry => 
          supabase.from('medication_entries').insert({
            ...entry,
            user_id: user.id,
            mood_entry_id: moodEntry.id,
            is_draft: false
          })
        ),
        // Similar updates for other entry types
      ])

      // Clear form persistence
      localStorage.removeItem('mood-entry-form')
      
      toast({
        title: "Success!",
        description: "Your mood entry has been saved."
      })
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Failed to save mood entry:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save mood entry",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle section reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Handle section deletion
  const handleDeleteSection = useCallback((sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId))
  }, [])

  // Keyboard navigation
  useHotkeys('up', () => {
    if (activeSection) {
      const currentIndex = sections.findIndex(s => s.id === activeSection)
      const prevIndex = Math.max(0, currentIndex - 1)
      setActiveSection(sections[prevIndex].id)
    }
  }, [sections, activeSection])

  useHotkeys('down', () => {
    if (activeSection) {
      const currentIndex = sections.findIndex(s => s.id === activeSection)
      const nextIndex = Math.min(sections.length - 1, currentIndex + 1)
      setActiveSection(sections[nextIndex].id)
    }
  }, [sections, activeSection])

  useHotkeys('e', () => {
    setIsEditing(prev => !prev)
  }, [setIsEditing])

  // Then update the handleDeleteItem function
  const handleDeleteItem = useCallback((sectionId: TrackerSectionId, itemId: string) => {
    setFormData((prev: FormData) => {
      const section = prev[sectionId]
      if (!('items' in section) || !Array.isArray(section.items)) return prev

      const newData = { ...prev }
      const newSection = { ...section }
      
      // Filter out the deleted item
      newSection.items = section.items.filter(item => item.id !== itemId)

      // Filter out related entries with proper typing
      if ('entries' in section && Array.isArray(section.entries)) {
        const typedEntries = getTypedEntries(section.entries, sectionId)
        
        newSection.entries = typedEntries.filter(entry => {
          switch (sectionId) {
            case 'medications':
              return (entry as TypedMedicationEntry).medication_id !== itemId
            case 'activities':
              return (entry as TypedActivityEntry).activities_id !== itemId
            case 'behaviors':
              return (entry as TypedBehaviorEntry).behaviors_id !== itemId
            case 'skills':
              return (entry as TypedSkillEntry).skills_id !== itemId
            case 'socialConnections':
              return (entry as TypedSocialEntry).social_id !== itemId
            case 'spirituality':
              return (entry as TypedSpiritualityEntry).spirituality_id !== itemId
            default:
              return true
          }
        }) as SectionEntryMap[typeof sectionId]
      }

      return {
        ...prev,
        [sectionId]: newSection
      } as FormData
    })
  }, [])

  // Add edit controls to each section
  const renderSectionHeader = (section: Section, index: number) => (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">{section.title}</h3>
      {isEditing && (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className={activeSection === section.id ? 'ring-2 ring-primary' : ''}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

  // Update the renderSection function
  const renderSection = (section: Section) => section.component

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Done Editing' : 'Edit Form'}
          </Button>
        </div>

        <SortableContext
          items={sections}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <DraggableSection
              key={section.id}
              id={section.id}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      Delete Section
                    </Button>
                  )}
                </div>
                {renderSection(section)}
              </div>
            </DraggableSection>
          ))}
        </SortableContext>
        
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner /> : 'Save Entry'}
          </Button>
        </div>
      </div>
    </DndContext>
  )
} 