# State Management and Data Persistence

## Local Storage Implementation

### Store Configuration
```typescript
// lib/stores/localStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormSection, TrackingItem } from '@/lib/types/database';

interface LocalStore {
  // Theme Preferences
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
  
  // Form Layout
  formLayout: FormSection[];
  setFormLayout: (layout: FormSection[]) => void;
  
  // Tracking Items
  trackingItems: Record<string, TrackingItem[]>;
  setTrackingItems: (sectionId: string, items: TrackingItem[]) => void;
  addTrackingItem: (sectionId: string, item: TrackingItem) => void;
  removeTrackingItem: (sectionId: string, itemId: string) => void;
  
  // Form Draft
  formDraft: Record<string, any>;
  setFormDraft: (draft: Record<string, any>) => void;
  clearFormDraft: () => void;
}

export const useLocalStore = create<LocalStore>()(
  persist(
    (set) => ({
      // Theme Preferences
      themePreference: 'system',
      setThemePreference: (theme) => set({ themePreference: theme }),
      
      // Form Layout
      formLayout: [],
      setFormLayout: (layout) => set({ formLayout: layout }),
      
      // Tracking Items
      trackingItems: {},
      setTrackingItems: (sectionId, items) => 
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: items
          }
        })),
      addTrackingItem: (sectionId, item) =>
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: [...(state.trackingItems[sectionId] || []), item]
          }
        })),
      removeTrackingItem: (sectionId, itemId) =>
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: state.trackingItems[sectionId]?.filter(
              item => item.id !== itemId
            ) || []
          }
        })),
      
      // Form Draft
      formDraft: {},
      setFormDraft: (draft) => set({ formDraft: draft }),
      clearFormDraft: () => set({ formDraft: {} })
    }),
    {
      name: 'mood-tracker-store',
      partialize: (state) => ({
        themePreference: state.themePreference,
        formLayout: state.formLayout,
        trackingItems: state.trackingItems,
        formDraft: state.formDraft
      })
    }
  )
);
```

## Form State Management

### Custom Hook for Form State
```typescript
// lib/hooks/useFormState.ts
import { useState, useEffect } from 'react';
import { useLocalStore } from '../stores/localStore';
import { supabaseClient } from '../supabase/client';
import { FormSection, TrackingItem } from '@/lib/types/database';

interface FormState {
  loading: boolean;
  error: Error | null;
  formLayout: FormSection[];
  trackingItems: Record<string, TrackingItem[]>;
  updateLayout: (layout: FormSection[]) => Promise<void>;
  updateTrackingItems: (sectionId: string, items: TrackingItem[]) => Promise<void>;
  saveFormDraft: (data: Record<string, any>) => void;
  loadFormDraft: () => Record<string, any>;
}

export function useFormState(userId: string): FormState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const localStore = useLocalStore();

  // Load initial data
  useEffect(() => {
    async function loadFormData() {
      try {
        setLoading(true);
        
        // Load form layout
        const { data: layoutData, error: layoutError } = await supabaseClient
          .from('user_sections')
          .select('*')
          .eq('user_id', userId)
          .order('display_order');

        if (layoutError) throw layoutError;
        localStore.setFormLayout(layoutData);

        // Load tracking items
        const { data: itemsData, error: itemsError } = await supabaseClient
          .from('tracking_items')
          .select('*')
          .eq('user_id', userId)
          .order('display_order');

        if (itemsError) throw itemsError;

        // Group items by section
        const groupedItems = itemsData.reduce((acc, item) => {
          if (!acc[item.section_id]) {
            acc[item.section_id] = [];
          }
          acc[item.section_id].push(item);
          return acc;
        }, {} as Record<string, TrackingItem[]>);

        Object.entries(groupedItems).forEach(([sectionId, items]) => {
          localStore.setTrackingItems(sectionId, items);
        });

      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [userId]);

  // Update layout with optimistic updates
  const updateLayout = async (layout: FormSection[]) => {
    try {
      // Update local state immediately
      localStore.setFormLayout(layout);

      // Update server
      const { error } = await supabaseClient
        .from('user_sections')
        .upsert(
          layout.map((section, index) => ({
            user_id: userId,
            section_id: section.id,
            display_order: index
          }))
        );

      if (error) throw error;
    } catch (err) {
      // Revert on error
      setError(err as Error);
      // Reload original data
      loadFormData();
    }
  };

  // Update tracking items with optimistic updates
  const updateTrackingItems = async (sectionId: string, items: TrackingItem[]) => {
    try {
      // Update local state immediately
      localStore.setTrackingItems(sectionId, items);

      // Update server
      const { error } = await supabaseClient
        .from('tracking_items')
        .upsert(
          items.map((item, index) => ({
            ...item,
            user_id: userId,
            section_id: sectionId,
            display_order: index
          }))
        );

      if (error) throw error;
    } catch (err) {
      // Revert on error
      setError(err as Error);
      // Reload original data
      loadFormData();
    }
  };

  return {
    loading,
    error,
    formLayout: localStore.formLayout,
    trackingItems: localStore.trackingItems,
    updateLayout,
    updateTrackingItems,
    saveFormDraft: localStore.setFormDraft,
    loadFormDraft: () => localStore.formDraft
  };
}
```

## Implementation Notes

### State Management Rules
1. Always update local state first for immediate feedback
2. Use optimistic updates for better UX
3. Implement proper error handling and rollback
4. Keep server state in sync with local state
5. Handle offline scenarios gracefully

### Data Persistence Strategy
1. Use local storage for immediate state persistence
2. Implement background syncing with server
3. Handle conflicts between local and server state
4. Maintain data integrity across sessions
5. Clean up stale data periodically

### Error Handling
1. Implement proper error boundaries
2. Provide user feedback for errors
3. Retry failed server operations
4. Roll back optimistic updates on failure
5. Log errors for debugging

### Performance Considerations
1. Debounce frequent updates
2. Batch server requests when possible
3. Implement proper loading states
4. Cache frequently accessed data
5. Clean up subscriptions and listeners