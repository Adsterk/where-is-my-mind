import { useEffect, useState, useRef } from 'react';
import { useSupabase } from '@/components/providers';
import { useLocalStore } from '@/lib/stores/localStore';
import type { FormDraft } from '@/lib/types/components';
import type { FormState, MedicationItem, TrackingItem } from '@/lib/stores/localStore';

interface UseFormInitializationReturn {
  isLoading: boolean;
  error: Error | null;
}

interface TrackingData {
  medications?: { items: MedicationItem[] };
  behaviors?: { items: Omit<TrackingItem, 'effectiveness' | 'quality' | 'impact'>[] };
  skills?: { items: Omit<TrackingItem, 'severity' | 'quality' | 'impact'>[] };
  social?: { items: Omit<TrackingItem, 'severity' | 'effectiveness' | 'impact'>[] };
  selfCare?: { items: Omit<TrackingItem, 'severity' | 'effectiveness' | 'quality'>[] };
}

interface LastEntry {
  date: string;
  is_bipolar: boolean;
  tracking_data: TrackingData;
}

// List of fields that should be preserved during reset
const PRESERVED_FIELDS = ['isBipolarMode'] as const;
type PreservedField = typeof PRESERVED_FIELDS[number];

export function useFormInitialization(): UseFormInitializationReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { supabase, user } = useSupabase();
  const { formDraft, setFormDraft } = useLocalStore();
  const initialized = useRef(false);

  useEffect(() => {
    const initializeForm = async () => {
      if (!user || initialized.current) return;

      try {
        setIsLoading(true);
        setError(null);

        const today = new Date().toISOString().split('T')[0];

        // Check if we have a draft from today with changes
        if (formDraft.draftDate === today && formDraft.isDraftDirty) {
          console.log('Using existing draft with changes');
          setIsLoading(false);
          return;
        }

        // Fetch last entry to use as template
        const { data: lastEntry, error: fetchError } = await supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        // Create base form state from last entry
        const baseFormData: FormState = {
          initialized: true,
          moodScore: 5,
          isBipolarMode: lastEntry?.is_bipolar ?? false,
          moodNotes: '',
          sleepHours: 7,
          sleepNotes: '',
          medications: lastEntry?.tracking_data?.medications?.items.map((item: MedicationItem) => ({
            ...item,
            taken: false
          })) ?? [],
          behaviors: lastEntry?.tracking_data?.behaviors?.items.map((item: Omit<TrackingItem, 'effectiveness' | 'quality' | 'impact'>) => ({
            ...item,
            completed: false,
            severity: undefined
          })) ?? [],
          skills: lastEntry?.tracking_data?.skills?.items.map((item: Omit<TrackingItem, 'severity' | 'quality' | 'impact'>) => ({
            ...item,
            completed: false,
            effectiveness: undefined
          })) ?? [],
          socialActivities: lastEntry?.tracking_data?.social?.items.map((item: Omit<TrackingItem, 'severity' | 'effectiveness' | 'impact'>) => ({
            ...item,
            completed: false,
            quality: undefined
          })) ?? [],
          selfCareActivities: lastEntry?.tracking_data?.selfCare?.items.map((item: Omit<TrackingItem, 'severity' | 'effectiveness' | 'quality'>) => ({
            ...item,
            completed: false,
            impact: undefined
          })) ?? [],
          medicationNotes: '',
          behaviorNotes: '',
          skillsNotes: '',
          socialNotes: '',
          selfCareNotes: ''
        };

        // If we have a draft from today, merge preserved fields
        const mergedFormData = formDraft.draftDate === today
          ? {
              ...baseFormData,
              ...Object.fromEntries(
                PRESERVED_FIELDS.map(field => [
                  field,
                  (formDraft.formData as Record<PreservedField, unknown>)[field] ?? baseFormData[field as keyof FormState]
                ])
              )
            }
          : baseFormData;

        // Initialize new form draft
        const newDraft = {
          draftDate: today,
          isDraftDirty: false,
          lastEntryDate: lastEntry?.date ?? null,
          lastSyncDate: new Date().toISOString(),
          formData: mergedFormData,
          modifiedFields: new Set<keyof FormState>(),
          offlineChanges: {
            hasPendingChanges: false,
            lastModified: null
          }
        };

        console.log('Initializing new form draft:', newDraft);
        setFormDraft(newDraft);
        initialized.current = true;

      } catch (err) {
        console.error('Error initializing form:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize form'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
  }, [user, formDraft.draftDate]);

  return { isLoading, error };
} 