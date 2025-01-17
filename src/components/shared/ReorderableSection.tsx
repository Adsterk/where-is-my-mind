'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReorderableSectionProps {
  id: string
  title: string
  children: React.ReactNode
  isEditing: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDelete?: () => void
}

export function ReorderableSection({
  id,
  title,
  children,
  isEditing,
  onMoveUp,
  onMoveDown,
  onDelete
}: ReorderableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined
  }

  // Add handlers to prevent form submission
  const handleMoveUp = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    onMoveUp?.()
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    onMoveDown?.()
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={cn(
        'relative',
        isDragging && 'opacity-50',
        isEditing && 'border-dashed'
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>{title}</CardTitle>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMoveUp}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div
                {...attributes}
                {...listeners}
                className="h-8 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing rounded-md hover:bg-accent"
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleMoveDown}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        {children}
      </Card>
    </div>
  )
} 