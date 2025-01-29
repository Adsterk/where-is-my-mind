# Component Implementation Guide

## Form Components

### MoodScore Component
```typescript
// components/form/mood-score/MoodScore.tsx
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MoodScoreProps {
  value: number;
  isBipolar: boolean;
  onChange: (value: number) => void;
  onBipolarChange: (value: boolean) => void;
}

export function MoodScore({
  value,
  isBipolar,
  onChange,
  onBipolarChange
}: MoodScoreProps) {
  const getSliderColor = (value: number) => {
    if (isBipolar) {
      return value < 5 ? 'bg-red-500' 
        : value > 5 ? 'bg-yellow-500' 
        : 'bg-green-500';
    }
    return value <= 3 ? 'bg-red-500'
      : value <= 7 ? 'bg-yellow-500'
      : 'bg-green-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Bipolar Scale</span>
            <Switch
              checked={isBipolar}
              onCheckedChange={onBipolarChange}
            />
          </div>
          
          <Slider
            value={[value]}
            min={0}
            max={10}
            step={1}
            onValueChange={([newValue]) => onChange(newValue)}
            className={getSliderColor(value)}
          />
          
          <div className="flex justify-between text-sm">
            {isBipolar ? (
              <>
                <span>Severe Depression</span>
                <span>Optimal</span>
                <span>Severe Mania</span>
              </>
            ) : (
              <>
                <span>Worst</span>
                <span>Best</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### TrackingSection Component
```typescript
// components/form/tracking/TrackingSection.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrackingItem } from '@/lib/types/database';

interface TrackingSectionProps {
  title: string;
  description?: string;
  items: TrackingItem[];
  onItemAdd: (name: string) => void;
  onItemToggle: (itemId: string, checked: boolean) => void;
  onItemDelete: (itemId: string) => void;
}

export function TrackingSection({
  title,
  description,
  items,
  onItemAdd,
  onItemToggle,
  onItemDelete
}: TrackingSectionProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAdd = () => {
    if (newItemName.trim()) {
      onItemAdd(newItemName.trim());
      setNewItemName('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add new item..."
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
            />
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
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
                  />
                  <label htmlFor={item.id} className="text-sm">
                    {item.name}
                  </label>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onItemDelete(item.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### SectionManager Component
```typescript
// components/form/section-manager/SectionManager.tsx
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { FormSection } from '@/lib/types/database';

interface SectionManagerProps {
  sections: FormSection[];
  onOrderChange: (sections: FormSection[]) => void;
  onVisibilityChange: (sectionId: string, isVisible: boolean) => void;
}

export function SectionManager({
  sections,
  onOrderChange,
  onVisibilityChange
}: SectionManagerProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onOrderChange(items);
  };

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
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{section.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => 
                            onVisibilityChange(section.id, !section.is_visible)
                          }
                        >
                          {section.is_visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
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
  );
}
```

## Form Page Implementation

```typescript
// app/(form)/page.tsx
'use client';

import { useEffect } from 'react';
import { useFormState } from '@/lib/hooks/useFormState';
import { MoodScore } from '@/components/form/mood-score/MoodScore';
import { TrackingSection } from '@/components/form/tracking/TrackingSection';
import { useLocalStore } from '@/lib/stores/localStore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function DailyFormPage() {
  const { user } = useUser(); // From your auth provider
  const {
    formLayout,
    trackingItems,
    updateLayout,
    updateTrackingItems,
    saveFormDraft,
    loadFormDraft
  } = useFormState(user?.id);
  
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(loadFormDraft() || {
    moodScore: 5,
    isBipolar: false,
    trackedItems: {}
  });

  // Save draft periodically
  useEffect(() => {
    const timer = setInterval(() => {
      saveFormDraft(formData);
    }, 30000); // Every 30 seconds

    return () => clearInterval(timer);
  }, [formData]);

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('daily_entries')
        .insert({
          user_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          mood_score: formData.moodScore,
          is_bipolar: formData.isBipolar,
          tracking_data: formData.trackedItems
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your daily entry has been saved.',
      });
      
      // Clear draft after successful submission
      saveFormDraft({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your entry. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daily Mood Tracking</h1>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit Form'}
        </Button>
      </div>

      {isEditing ? (
        <SectionManager
          sections={formLayout}
          onOrderChange={updateLayout}
          onVisibilityChange={(sectionId, isVisible) => {
            const newLayout = formLayout.map(section =>
              section.id === sectionId
                ? { ...section, is_visible: isVisible }
                : section
            );
            updateLayout(newLayout);
          }}
        />
      ) : (
        <>
          <MoodScore
            value={formData.moodScore}
            isBipolar={formData.isBipolar}
            onChange={(value) => 
              setFormData(prev => ({ ...prev, moodScore: value }))
            }
            onBipolarChange={(value) => 
              setFormData(prev => ({ ...prev, isBipolar: value }))
            }
          />

          {formLayout.map((section) => (
            section.is_visible && (
              <TrackingSection
                key={section.id}
                title={section.name}
                items={trackingItems[section.id] || []}
                onItemAdd={(name) => {
                  const newItem = {
                    id: crypto.randomUUID(),
                    name,
                    is_active: true,
                    display_order: trackingItems[section.id]?.length || 0
                  };
                  updateTrackingItems(section.id, [
                    ...(trackingItems[section.id] || []),
                    newItem
                  ]);
                }}
                onItemToggle={(itemId, checked) => {
                  setFormData(prev => ({
                    ...prev,
                    trackedItems: {
                      ...prev.trackedItems,
                      [itemId]: checked
                    }
                  }));
                }}
                onItemDelete={(itemId) => {
                  updateTrackingItems(
                    section.id,
                    trackingItems[section.id].filter(item => item.id !== itemId)
                  );
                }}
              />
            )
          ))}

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubmit}
          >
            Save Daily Entry
          </Button>
        </>
      )}
    </div>
  );
}
```

## Implementation Notes

### Component Design Rules
1. Keep components focused and single-responsibility
2. Use proper TypeScript types
3. Implement proper prop validation
4. Handle loading and error states
5. Maintain consistent styling

### State Management
1. Use local state for UI-only concerns
2. Use form state for user input
3. Implement proper data persistence
4. Handle optimistic updates
5. Provide proper feedback

### Performance Considerations
1. Memoize expensive computations
2. Implement proper loading states
3. Debounce frequent updates
4. Optimize re-renders
5. Handle cleanup properly

### Accessibility
1. Use proper ARIA labels
2. Support keyboard navigation
3. Maintain proper focus management
4. Provide proper feedback
5. Support screen readers