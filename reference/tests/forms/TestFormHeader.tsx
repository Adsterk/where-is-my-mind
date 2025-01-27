'use client'

import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useEditMode } from './context/EditModeContext'

export function TestFormHeader() {
  const { isEditing, toggleEditMode } = useEditMode()

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Test Mood Entry Form</CardTitle>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {isEditing ? 'Done Editing' : 'Edit Form'}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleEditMode}
          aria-label={isEditing ? "Stop editing form" : "Edit form"}
          aria-pressed={isEditing}
        >
          <Pencil className={`h-4 w-4 ${isEditing ? 'text-primary' : ''}`} />
        </Button>
      </div>
    </CardHeader>
  )
} 