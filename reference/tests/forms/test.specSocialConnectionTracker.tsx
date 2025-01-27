'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Check, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export interface TestSocialConnection {
  id: string
  name: string
}

export interface TestSocialConnectionEntry {
  connection_id: string
  quality_rating: number
  impact_rating: number
  notes?: string
}

interface TestSocialConnectionTrackerProps {
  connections: TestSocialConnection[]
  entries: TestSocialConnectionEntry[]
  onConnectionAdd: (connection: Omit<TestSocialConnection, 'id'>) => void
  onEntryChange: (entries: TestSocialConnectionEntry[]) => void
}

export function TestSocialConnectionTracker({
  connections,
  entries,
  onConnectionAdd,
  onEntryChange
}: TestSocialConnectionTrackerProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newConnection, setNewConnection] = useState('')

  const handleAddConnection = () => {
    if (!newConnection.trim()) {
      toast({
        title: "Required",
        description: "Connection name is required",
        variant: "destructive"
      })
      return
    }

    onConnectionAdd({
      name: newConnection.trim()
    })
    
    setNewConnection('')
    setShowAddForm(false)

    toast({
      title: "Success",
      description: "Social connection added successfully",
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddConnection()
    }
  }

  const toggleConnection = (connectionId: string) => {
    const existingEntry = entries.find(e => e.connection_id === connectionId)
    
    if (existingEntry) {
      onEntryChange(entries.filter(e => e.connection_id !== connectionId))
    } else {
      onEntryChange([...entries, {
        connection_id: connectionId,
        quality_rating: 3,
        impact_rating: 3
      }])
    }
  }

  const updateEntry = (connectionId: string, updates: Partial<TestSocialConnectionEntry>) => {
    onEntryChange(
      entries.map(entry => 
        entry.connection_id === connectionId 
          ? { ...entry, ...updates }
          : entry
      )
    )
  }

  return (
    <div className="space-y-4">
      {!showAddForm ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Social Connection
        </Button>
      ) : (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Connection Name</Label>
              <Input
                value={newConnection}
                onChange={(e) => setNewConnection(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter connection name"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button"
                onClick={handleAddConnection}
              >
                Save
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setNewConnection('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {connections.length > 0 && (
        <div className="space-y-2">
          {connections.map((connection) => {
            const entry = entries.find(e => e.connection_id === connection.id)
            
            return (
              <Card key={connection.id} className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{connection.name}</h4>
                  <Button
                    type="button"
                    variant={entry ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleConnection(connection.id)}
                  >
                    {entry ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>

                {entry && (
                  <div className="space-y-4 mt-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Quality Rating (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={entry.quality_rating}
                        onChange={(e) => updateEntry(connection.id, { 
                          quality_rating: parseInt(e.target.value) 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Impact Rating (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={entry.impact_rating}
                        onChange={(e) => updateEntry(connection.id, { 
                          impact_rating: parseInt(e.target.value) 
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(connection.id, { 
                          notes: e.target.value 
                        })}
                        placeholder="Add any notes..."
                      />
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 