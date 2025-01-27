'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sectionTemplates } from './sectionTemplates'
import { SectionTemplate, TemplateConfig } from './templateTypes'
import { TestSection, SectionType } from './types'
import { useToast } from '@/components/ui/use-toast'

interface TestSectionCreatorProps {
  onSectionCreate: (section: TestSection) => void
}

const IconWrapper = ({ icon: Icon }: { icon: React.ComponentType<any> }) => {
  return <Icon className="h-6 w-6" />
}

export function TestSectionCreator({ onSectionCreate }: TestSectionCreatorProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<SectionTemplate | null>(null)
  const [title, setTitle] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleTemplateSelect = (template: SectionTemplate) => {
    setSelectedTemplate(template)
    setTitle(template.title)
  }

  const handleCreate = () => {
    if (selectedTemplate && title.trim()) {
      try {
        const newSection = selectedTemplate.createSection({ 
          title: title.trim() 
        })
        
        onSectionCreate(newSection)
        setIsOpen(false)
        setSelectedTemplate(null)
        setTitle('')
      } catch (error) {
        console.error('Error creating section:', error)
        toast({
          title: "Error",
          description: "Failed to create section",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          aria-label="Add new section"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Section
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl"
        aria-labelledby="dialog-title"
      >
        <DialogHeader>
          <DialogTitle id="dialog-title">Add New Section</DialogTitle>
          <DialogDescription>
            Choose a section type to add to your form
          </DialogDescription>
        </DialogHeader>
        
        {!selectedTemplate ? (
          <div className="grid grid-cols-2 gap-4">
            {sectionTemplates.map(template => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleTemplateSelect(template)}
                role="button"
                tabIndex={0}
                aria-label={`Add ${template.title}`}
              >
                <CardHeader className="flex flex-row items-center space-x-4">
                  <IconWrapper icon={template.icon} />
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section title"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title}
              >
                Create Section
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 