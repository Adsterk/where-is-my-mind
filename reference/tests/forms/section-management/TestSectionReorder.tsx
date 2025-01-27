'use client'

import { useState, useEffect } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  closestCenter,
  UniqueIdentifier
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TestSection } from './types'

interface TestSectionReorderProps {
  initialSections: TestSection[]
  onSectionsReorder: (sections: TestSection[]) => void
  children: React.ReactNode
}

function SortableSection({ 
  section, 
  children, 
  isDragging,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast 
}: {
  section: TestSection
  children: React.ReactNode
  isDragging: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: section.id })

  return (
    <div 
      ref={setNodeRef} 
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
      }}
      className="mb-4"
    >
      <Card className={`${isDragging ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{section.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-8 w-8 p-0"
              aria-label={`Move ${section.title} up`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-8 w-8 p-0"
              aria-label={`Move ${section.title} down`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost"
              {...attributes} 
              {...listeners}
              className="cursor-grab active:cursor-grabbing h-8 w-8 p-0"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export function TestSectionReorder({ 
  initialSections, 
  onSectionsReorder,
  children 
}: TestSectionReorderProps) {
  const [sections, setSections] = useState(initialSections)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  useEffect(() => {
    setSections(initialSections)
  }, [initialSections])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(section => section.id === active.id)
      const newIndex = sections.findIndex(section => section.id === over.id)

      const newSections = [...sections]
      const [movedSection] = newSections.splice(oldIndex, 1)
      newSections.splice(newIndex, 0, movedSection)

      setSections(newSections)
      onSectionsReorder(newSections)
    }

    setActiveId(null)
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...sections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)
    setSections(newSections)
    onSectionsReorder(newSections)
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext items={sections} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <SortableSection
              key={section.id}
              section={section}
              isDragging={activeId === section.id}
              onMoveUp={() => moveSection(index, Math.max(0, index - 1))}
              onMoveDown={() => moveSection(index, Math.min(sections.length - 1, index + 1))}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
            >
              {children}
            </SortableSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 