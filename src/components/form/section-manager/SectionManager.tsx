'use client'

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, GripVertical } from 'lucide-react'
import type { FormSection } from '@/lib/types/form'

interface SectionManagerProps {
  sections: FormSection[]
  onOrderChange: (sections: FormSection[]) => void
  onVisibilityChange: (sectionId: string, isVisible: boolean) => void
}

export function SectionManager({
  sections,
  onOrderChange,
  onVisibilityChange
}: SectionManagerProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onOrderChange(items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {sections.map((section, index) => (
              <Draggable
                key={section.id}
                draggableId={section.id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'opacity-50' : ''}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{section.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {section.is_required && (
                            <span className="text-xs text-muted-foreground">
                              Required
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => 
                              onVisibilityChange(section.id, !section.is_visible)
                            }
                            className="h-8 w-8"
                          >
                            {section.is_visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
} 