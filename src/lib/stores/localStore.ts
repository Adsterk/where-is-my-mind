import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FormSection, TrackingItem, ThemePreference } from '@/lib/types/database';

interface LocalStore {
  // Theme Preferences
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  
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