import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FormState, FormSection, TrackingItem, MoodEntry } from '@/lib/types/form'

interface FormStore extends FormState {
  // Section actions
  setSections: (sections: FormSection[]) => void
  updateSectionOrder: (sections: FormSection[]) => void
  updateSectionVisibility: (sectionId: string, isVisible: boolean) => void
  
  // Tracking item actions
  setTrackingItems: (sectionId: string, items: TrackingItem[]) => void
  addTrackingItem: (sectionId: string, item: TrackingItem) => void
  updateTrackingItem: (sectionId: string, itemId: string, updates: Partial<TrackingItem>) => void
  removeTrackingItem: (sectionId: string, itemId: string) => void
  
  // Entry actions
  setCurrentEntry: (entry: MoodEntry | null) => void
  updateCurrentEntry: (updates: Partial<MoodEntry>) => void
  clearCurrentEntry: () => void
  
  // Form state
  setIsDirty: (isDirty: boolean) => void
  resetStore: () => void
}

const initialState: FormState = {
  sections: [],
  trackingItems: {},
  currentEntry: null,
  isDirty: false,
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Section actions
      setSections: (sections) => set({ sections }),
      updateSectionOrder: (sections) => set({ sections, isDirty: true }),
      updateSectionVisibility: (sectionId, isVisible) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, is_visible: isVisible }
              : section
          ),
          isDirty: true,
        })),

      // Tracking item actions
      setTrackingItems: (sectionId, items) =>
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: items,
          },
        })),
      addTrackingItem: (sectionId, item) =>
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: [...(state.trackingItems[sectionId] || []), item],
          },
          isDirty: true,
        })),
      updateTrackingItem: (sectionId, itemId, updates) =>
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: state.trackingItems[sectionId]?.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ) || [],
          },
          isDirty: true,
        })),
      removeTrackingItem: (sectionId, itemId) =>
        set((state) => ({
          trackingItems: {
            ...state.trackingItems,
            [sectionId]: state.trackingItems[sectionId]?.filter(
              (item) => item.id !== itemId
            ) || [],
          },
          isDirty: true,
        })),

      // Entry actions
      setCurrentEntry: (entry) => set({ currentEntry: entry }),
      updateCurrentEntry: (updates) =>
        set((state) => ({
          currentEntry: state.currentEntry
            ? { ...state.currentEntry, ...updates }
            : null,
          isDirty: true,
        })),
      clearCurrentEntry: () => set({ currentEntry: null, isDirty: false }),

      // Form state
      setIsDirty: (isDirty) => set({ isDirty }),
      resetStore: () => set(initialState),
    }),
    {
      name: 'mood-tracker-form-store',
      partialize: (state) => ({
        currentEntry: state.currentEntry,
        isDirty: state.isDirty,
      }),
    }
  )
) 