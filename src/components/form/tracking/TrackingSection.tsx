'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { TrackingItem } from '@/lib/types/form'

interface TrackingSectionProps {
  title: string
  description?: string
  items: TrackingItem[]
  onItemAdd: (name: string) => void
  onItemToggle: (itemId: string, checked: boolean) => void
  onItemDelete: (itemId: string) => void
  isEditing?: boolean
}

export function TrackingSection({
  title,
  description,
  items,
  onItemAdd,
  onItemToggle,
  onItemDelete,
  isEditing = false
}: TrackingSectionProps) {
  const [newItemName, setNewItemName] = useState('')

  const handleAdd = () => {
    if (newItemName.trim()) {
      onItemAdd(newItemName.trim())
      setNewItemName('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing && (
            <div className="flex gap-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add new item..."
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleAdd} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={item.is_active}
                    onCheckedChange={(checked) => 
                      onItemToggle(item.id, checked as boolean)
                    }
                    disabled={!isEditing}
                  />
                  <label 
                    htmlFor={item.id} 
                    className="text-sm select-none cursor-pointer"
                  >
                    {item.name}
                  </label>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onItemDelete(item.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 