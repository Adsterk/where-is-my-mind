'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStore } from '@/lib/stores/localStore'
import { useSupabase } from '@/components/providers'
import type { TrackingItem, RatingValue, SeverityValue } from '@/lib/types/entries'
import type { FormDraft, FormState } from '@/lib/stores/localStore'

interface BaseTrackerProps {
  title: string
  items: TrackingItem[]
  notes: string | null
  isEditing?: boolean
  itemPlaceholder?: string
  notesPlaceholder?: string
  showSeverity?: boolean
  showEffectiveness?: boolean
  showQuality?: boolean
  showImpact?: boolean
  sectionId: string
}

type SectionMapping = {
  [key: string]: {
    items: keyof FormState;
    notes: keyof FormState;
  };
};

// Memoize section mapping to prevent recreation
const SECTION_MAPPING: SectionMapping = {
  'behaviors': { items: 'behaviors', notes: 'behaviorNotes' },
  'medications': { items: 'medications', notes: 'medicationNotes' },
  'skills': { items: 'skills', notes: 'skillsNotes' },
  'social': { items: 'socialActivities', notes: 'socialNotes' },
  'self-care': { items: 'selfCareActivities', notes: 'selfCareNotes' }
} as const;

// Memoize conversion function
const convertFromStoredItem = (
  item: TrackingItem,
  options: {
    showSeverity?: boolean
    showEffectiveness?: boolean
    showQuality?: boolean
    showImpact?: boolean
  }
): TrackingItem => ({
  id: item.id,
  name: item.name,
  completed: item.completed,
  severity: options.showSeverity ? item.severity : undefined,
  effectiveness: options.showEffectiveness ? item.effectiveness : undefined,
  quality: options.showQuality ? item.quality : undefined,
  impact: options.showImpact ? item.impact : undefined
})

export function BaseTracker({
  title,
  items,
  notes,
  isEditing = true,
  itemPlaceholder = "Add new item...",
  notesPlaceholder = "Add any notes...",
  showSeverity = false,
  showEffectiveness = false,
  showQuality = false,
  showImpact = false,
  sectionId
}: BaseTrackerProps) {
  const [newItemName, setNewItemName] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [localItems, setLocalItems] = useState<TrackingItem[]>(items)
  
  const { user } = useSupabase()
  const formDraft = useLocalStore((state) => state.formDraft)
  const setFormDraft = useLocalStore((state) => state.setFormDraft)

  // Memoize section data to prevent unnecessary recalculations
  const section = useMemo(() => SECTION_MAPPING[sectionId], [sectionId])

  // Memoize form data access
  const formData = useMemo(() => {
    if (!section) return { items: [], notes: null }
    return {
      items: Array.isArray(formDraft.formData[section.items]) 
        ? formDraft.formData[section.items] as TrackingItem[]
        : [],
      notes: formDraft.formData[section.notes] as string | null
    }
  }, [formDraft.formData, section])

  // Load persisted items on mount and when form draft changes
  useEffect(() => {
    if (!user || !section) return

    const today = new Date().toISOString().split('T')[0]
    
    // Only update if the draft date matches today and there are actual changes
    if (formDraft.draftDate === today && formData.items.length > 0) {
      const convertedItems = formData.items.map((item: TrackingItem) => 
        convertFromStoredItem(item, {
          showSeverity,
          showEffectiveness,
          showQuality,
          showImpact
        })
      )
      
      // Only update if items have actually changed
      const hasChanged = JSON.stringify(convertedItems) !== JSON.stringify(localItems)
      if (hasChanged) {
        setLocalItems(convertedItems)
      }
    }
  }, [user, formData.items, showSeverity, showEffectiveness, showQuality, showImpact])

  // Debounced update to form draft
  useEffect(() => {
    if (!isEditing || !user || !section) return

    const timeoutId = setTimeout(() => {
      setFormDraft(prev => ({
        ...prev,
        isDraftDirty: true,
        formData: {
          ...prev.formData,
          [section.items]: localItems,
          [section.notes]: notes
        },
        offlineChanges: {
          hasPendingChanges: true,
          lastModified: new Date().toISOString()
        }
      }))
    }, 300) // Increased debounce time

    return () => clearTimeout(timeoutId)
  }, [localItems, notes, isEditing, user, section])

  const handleAddItem = useCallback((e?: React.FormEvent) => {
    e?.preventDefault() // Prevent form submission
    e?.stopPropagation() // Stop event bubbling
    
    if (!newItemName.trim()) return

    const newItem: TrackingItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      completed: false,
      ...(showSeverity && { severity: undefined }),
      ...(showEffectiveness && { effectiveness: undefined }),
      ...(showQuality && { quality: undefined }),
      ...(showImpact && { impact: undefined })
    }

    const updatedItems = [...localItems, newItem]
    setLocalItems(updatedItems)
    
    // Get the correct field names based on section ID
    const section = SECTION_MAPPING[sectionId]
    if (!section) return
    
    // Immediately update form draft
    setFormDraft(prev => ({
      ...prev,
      isDraftDirty: true,
      formData: {
        ...prev.formData,
        [section.items]: updatedItems
      },
      offlineChanges: {
        hasPendingChanges: true,
        lastModified: new Date().toISOString()
      }
    }))

    setNewItemName('')
  }, [newItemName, showSeverity, showEffectiveness, showQuality, showImpact, localItems, sectionId, setFormDraft])

  const handleToggleItem = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event bubbling

    const updatedItems = localItems.map(item => {
      if (item.id === id) {
        const newCompleted = !item.completed
        return {
          ...item,
          completed: newCompleted,
          // Reset ratings when unchecking
          ...((!newCompleted && showSeverity) && { severity: undefined }),
          ...((!newCompleted && showEffectiveness) && { effectiveness: undefined }),
          ...((!newCompleted && showQuality) && { quality: undefined }),
          ...((!newCompleted && showImpact) && { impact: undefined })
        }
      }
      return item
    })

    setLocalItems(updatedItems)

    // Get the correct field names based on section ID
    const section = SECTION_MAPPING[sectionId]
    if (!section) return
    
    // Immediately update form draft
    setFormDraft(prev => ({
      ...prev,
      isDraftDirty: true,
      formData: {
        ...prev.formData,
        [section.items]: updatedItems
      },
      offlineChanges: {
        hasPendingChanges: true,
        lastModified: new Date().toISOString()
      }
    }))
  }, [showSeverity, showEffectiveness, showQuality, showImpact, localItems, sectionId, setFormDraft])

  const handleRemoveItem = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event bubbling

    const updatedItems = localItems.filter(item => item.id !== id)
    setLocalItems(updatedItems)

    // Get the correct field names based on section ID
    const section = SECTION_MAPPING[sectionId]
    if (!section) return
    
    // Immediately update form draft
    setFormDraft(prev => ({
      ...prev,
      isDraftDirty: true,
      formData: {
        ...prev.formData,
        [section.items]: updatedItems
      },
      offlineChanges: {
        hasPendingChanges: true,
        lastModified: new Date().toISOString()
      }
    }))
  }, [localItems, sectionId, setFormDraft])

  const handleRatingChange = useCallback((e: React.MouseEvent, id: string, type: 'severity' | 'effectiveness' | 'quality' | 'impact', value: SeverityValue | RatingValue) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event bubbling

    const updatedItems = localItems.map(item =>
      item.id === id ? { ...item, [type]: value } : item
    )
    setLocalItems(updatedItems)

    // Get the correct field names based on section ID
    const section = SECTION_MAPPING[sectionId]
    if (!section) return
    
    // Immediately update form draft
    setFormDraft(prev => ({
      ...prev,
      isDraftDirty: true,
      formData: {
        ...prev.formData,
        [section.items]: updatedItems
      },
      offlineChanges: {
        hasPendingChanges: true,
        lastModified: new Date().toISOString()
      }
    }))
  }, [localItems, sectionId, setFormDraft])

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault() // Prevent form submission
    const newNotes = e.target.value || null
    
    // Get the correct field names based on section ID
    const section = SECTION_MAPPING[sectionId]
    if (!section) return
    
    // Update form draft with new notes
    setFormDraft(prev => ({
      ...prev,
      isDraftDirty: true,
      formData: {
        ...prev.formData,
        [section.notes]: newNotes
      },
      offlineChanges: {
        hasPendingChanges: true,
        lastModified: new Date().toISOString()
      }
    }))
  }, [sectionId, setFormDraft])

  const toggleEditMode = useCallback((e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event bubbling
    
    setIsEditMode(prev => !prev)
    setNewItemName('')
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {isEditing && (
          <Button
            type="button"
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
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Item Form */}
        {isEditing && isEditMode && (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder={itemPlaceholder}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddItem()
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                handleAddItem()
              }}
              className="h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-2">
          {localItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Switch
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={(checked) => {
                      handleToggleItem({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent, item.id)
                    }}
                    disabled={!isEditing}
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn(
                      "line-clamp-1",
                      item.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </Label>
                </div>
                {isEditing && isEditMode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleRemoveItem(e, item.id)}
                    className="h-8 w-8 hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Rating Controls */}
              {item.completed && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {showSeverity && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Severity</Label>
                      <div className="flex gap-2">
                        {['mild', 'moderate', 'severe'].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={item.severity === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => handleRatingChange(e, item.id, 'severity', value as SeverityValue)}
                            disabled={!isEditing}
                            className="h-7"
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showEffectiveness && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Effectiveness</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['not helpful', 'somewhat helpful', 'very helpful'].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={item.effectiveness === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => handleRatingChange(e, item.id, 'effectiveness', value as RatingValue)}
                            disabled={!isEditing}
                            className={cn(
                              "h-7",
                              value === 'not helpful' && "col-span-1",
                              value === 'somewhat helpful' && "col-span-2",
                              value === 'very helpful' && "col-span-3"
                            )}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showQuality && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Quality</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['not helpful', 'somewhat helpful', 'very helpful'].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={item.quality === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => handleRatingChange(e, item.id, 'quality', value as RatingValue)}
                            disabled={!isEditing}
                            className={cn(
                              "h-7",
                              value === 'not helpful' && "col-span-1",
                              value === 'somewhat helpful' && "col-span-2",
                              value === 'very helpful' && "col-span-3"
                            )}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showImpact && (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Impact</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['not helpful', 'somewhat helpful', 'very helpful'].map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={item.impact === value ? 'default' : 'outline'}
                            size="sm"
                            onClick={(e) => handleRatingChange(e, item.id, 'impact', value as RatingValue)}
                            disabled={!isEditing}
                            className={cn(
                              "h-7",
                              value === 'not helpful' && "col-span-1",
                              value === 'somewhat helpful' && "col-span-2",
                              value === 'very helpful' && "col-span-3"
                            )}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder={notesPlaceholder}
            value={notes || ''}
            onChange={handleNotesChange}
            disabled={!isEditing}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
    </Card>
  )
} 