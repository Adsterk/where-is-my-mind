import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import type { ThemePreference } from '@/lib/types/database';
import type { FormSection } from '@/lib/types/components';

export type SeverityValue = 'mild' | 'moderate' | 'severe';
export type RatingValue = 'not helpful' | 'somewhat helpful' | 'very helpful';

export interface TrackingItem {
  id: string;
  name: string;
  completed: boolean;
  severity?: SeverityValue;
  effectiveness?: RatingValue;
  quality?: RatingValue;
  impact?: RatingValue;
}

export interface MedicationItem {
  id: string;
  name: string;
  completed: boolean;
}

export interface FormState {
  initialized: boolean;
  moodScore: number;
  isBipolarMode: boolean;
  moodNotes: string;
  sleepHours: number;
  sleepNotes: string;
  medications: MedicationItem[];
  behaviors: Array<Omit<TrackingItem, 'effectiveness' | 'quality' | 'impact'>>;
  skills: Array<Omit<TrackingItem, 'severity' | 'quality' | 'impact'>>;
  socialActivities: Array<Omit<TrackingItem, 'severity' | 'effectiveness' | 'impact'>>;
  selfCareActivities: Array<Omit<TrackingItem, 'severity' | 'effectiveness' | 'quality'>>;
  medicationNotes: string;
  behaviorNotes: string;
  skillsNotes: string;
  socialNotes: string;
  selfCareNotes: string;
}

export interface FormDraft {
  draftDate: string | null;
  isDraftDirty: boolean;
  lastEntryDate: string | null;
  lastSyncDate: string | null;
  formData: FormState;
  modifiedFields: Set<keyof FormState>;
  offlineChanges: {
    hasPendingChanges: boolean;
    lastModified: string | null;
  };
}

export interface LocalStore {
  // Theme Preferences
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  
  // Form Layout
  formLayout: FormSection[];
  setFormLayout: (layout: FormSection[]) => void;
  
  // Form Draft
  formDraft: FormDraft;
  setFormDraft: (draft: FormDraft | ((prev: FormDraft) => FormDraft)) => void;
  updateFormField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  markDraftDirty: (isDirty: boolean) => void;
  clearFormDraft: () => void;
  resetFormToDefaults: () => void;

  // Form Layout and Tracking
  trackingItems: Record<string, any>;
  setTrackingItems: (items: Record<string, any>) => void;
  updateLayout: (layout: FormSection[]) => void;
  validateForm: () => boolean;
}

const initialFormState: FormState = {
  initialized: false,
  moodScore: 5,
  isBipolarMode: false,
  moodNotes: '',
  sleepHours: 7,
  sleepNotes: '',
  medications: [],
  behaviors: [],
  skills: [],
  socialActivities: [],
  selfCareActivities: [],
  medicationNotes: '',
  behaviorNotes: '',
  skillsNotes: '',
  socialNotes: '',
  selfCareNotes: ''
};

const initialFormDraft: FormDraft = {
  draftDate: null,
  isDraftDirty: false,
  lastEntryDate: null,
  lastSyncDate: null,
  formData: initialFormState,
  modifiedFields: new Set(),
  offlineChanges: {
    hasPendingChanges: false,
    lastModified: null
  }
};

// List of fields that should be preserved during reset
const PRESERVED_FIELDS = ['isBipolarMode'] as const;

// Custom persist options type
interface CustomPersistOptions extends Omit<PersistOptions<LocalStore>, 'serialize' | 'deserialize'> {
  serialize: (state: LocalStore) => string;
  deserialize: (str: string) => LocalStore;
}

export const useLocalStore = create<LocalStore>()(
  persist(
    (set, get) => ({
      // Theme Preferences
      themePreference: 'system',
      setThemePreference: (theme) => set({ themePreference: theme }),
      
      // Form Layout
      formLayout: [],
      setFormLayout: (layout) => set({ formLayout: layout }),
      
      // Form Draft
      formDraft: initialFormDraft,
      setFormDraft: (draft) => set((state) => ({
        formDraft: typeof draft === 'function' ? draft(state.formDraft) : draft
      })),
      updateFormField: (field, value) => set((state) => {
        const newModifiedFields = new Set(state.formDraft.modifiedFields);
        if (!PRESERVED_FIELDS.includes(field as any)) {
          newModifiedFields.add(field);
        }
        
        return {
          formDraft: {
            ...state.formDraft,
            isDraftDirty: true,
            formData: {
              ...state.formDraft.formData,
              [field]: value
            },
            modifiedFields: newModifiedFields,
            offlineChanges: {
              hasPendingChanges: true,
              lastModified: new Date().toISOString()
            }
          }
        };
      }),
      markDraftDirty: (isDirty) => set((state) => ({
        formDraft: {
          ...state.formDraft,
          isDraftDirty: isDirty,
          offlineChanges: {
            ...state.formDraft.offlineChanges,
            hasPendingChanges: isDirty,
            lastModified: isDirty ? new Date().toISOString() : state.formDraft.offlineChanges.lastModified
          }
        }
      })),
      clearFormDraft: () => set({ formDraft: initialFormDraft }),
      resetFormToDefaults: () => set((state) => {
        // Create new form data with preserved fields
        const preservedData = PRESERVED_FIELDS.reduce((acc, field) => ({
          ...acc,
          [field]: state.formDraft.formData[field]
        }), {});

        return {
          formDraft: {
            ...state.formDraft,
            isDraftDirty: false,
            formData: {
              ...initialFormState,
              ...preservedData
            },
            modifiedFields: new Set(),
            offlineChanges: {
              hasPendingChanges: false,
              lastModified: null
            }
          }
        };
      }),

      // Form Layout and Tracking
      trackingItems: {},
      setTrackingItems: (items) => set({ trackingItems: items }),
      updateLayout: (layout) => set({ formLayout: layout }),
      validateForm: () => {
        const { formDraft, formLayout } = get();
        const requiredSections = formLayout.filter(section => section.is_required);
        
        for (const section of requiredSections) {
          switch (section.type) {
            case 'mood':
              if (formDraft.formData.moodScore === undefined) return false;
              break;
            case 'sleep':
              if (formDraft.formData.sleepHours === undefined) return false;
              break;
            case 'tracking':
              // Add tracking validation if needed
              break;
          }
        }
        return true;
      },
    }),
    {
      name: 'form-storage',
      serialize: (state: LocalStore) => {
        // Convert Set to Array for serialization
        const formDraft = {
          ...state.formDraft,
          modifiedFields: Array.from(state.formDraft.modifiedFields)
        };
        return JSON.stringify({ ...state, formDraft });
      },
      deserialize: (str: string) => {
        const state = JSON.parse(str) as LocalStore;
        // Convert Array back to Set after deserialization
        const formDraft = {
          ...state.formDraft,
          modifiedFields: new Set(state.formDraft.modifiedFields)
        };
        return { ...state, formDraft };
      }
    } as CustomPersistOptions
  )
); 