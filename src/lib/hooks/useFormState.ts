import { useState, useEffect, useCallback } from 'react';
import { useLocalStore } from '../stores/localStore';
import { supabaseClient } from '../supabase/client';
import type { FormSection, TrackingItem, DBResult, DBArrayResult, DailyEntry } from '@/lib/types/database';
import type { FormData } from '@/lib/types/components';

interface FormState {
  loading: boolean;
  error: Error | null;
  formLayout: FormSection[];
  trackingItems: Record<string, TrackingItem[]>;
  updateLayout: (layout: FormSection[]) => Promise<void>;
  updateTrackingItems: (sectionId: string, items: TrackingItem[]) => Promise<void>;
  saveFormDraft: (data: Record<string, any>) => void;
  loadFormDraft: () => Record<string, any>;
  submitForm: (data: FormData) => Promise<void>;
  isSubmitting: boolean;
  submitError: Error | null;
  validateForm: (data: FormData) => boolean;
}

export function useFormState(userId: string): FormState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const localStore = useLocalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<Error | null>(null);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    
    async function loadFormData() {
      try {
        if (!mounted) return;
        setLoading(true);
        
        // Load form layout
        const { data: layoutData, error: layoutError }: DBArrayResult<FormSection> = await supabaseClient
          .from('user_sections')
          .select('*')
          .eq('user_id', userId)
          .order('display_order');

        if (layoutError) throw layoutError;
        if (mounted) localStore.setFormLayout(layoutData || []);

        // Load tracking items
        const { data: itemsData, error: itemsError }: DBArrayResult<TrackingItem> = await supabaseClient
          .from('tracking_items')
          .select('*')
          .eq('user_id', userId)
          .order('display_order');

        if (itemsError) throw itemsError;

        if (mounted) {
          // Group items by section
          const groupedItems = (itemsData || []).reduce((acc, item) => {
            if (!acc[item.section_id]) {
              acc[item.section_id] = [];
            }
            acc[item.section_id].push(item);
            return acc;
          }, {} as Record<string, TrackingItem[]>);

          Object.entries(groupedItems).forEach(([sectionId, items]) => {
            localStore.setTrackingItems(sectionId, items);
          });
        }

      } catch (err) {
        if (mounted) setError(err as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFormData();
    
    return () => {
      mounted = false;
    };
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

  const validateForm = useCallback((data: FormData): boolean => {
    // Validate required fields based on form layout
    const requiredSections = localStore.formLayout.filter(section => section.is_required);
    
    for (const section of requiredSections) {
      switch (section.type) {
        case 'mood':
          if (data.moodScore === undefined) return false;
          break;
        case 'tracking':
          const sectionItems = localStore.trackingItems[section.id] || [];
          const hasTrackedItems = sectionItems.some(item => 
            data.trackedItems[item.id] !== undefined
          );
          if (!hasTrackedItems) return false;
          break;
      }
    }
    
    return true;
  }, [localStore.formLayout, localStore.trackingItems]);

  const submitForm = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (!validateForm(data)) {
        throw new Error('Please fill in all required fields');
      }

      const entry: Partial<DailyEntry> = {
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        mood_score: data.moodScore,
        is_bipolar: data.isBipolar,
        tracking_data: data.trackedItems
      };

      const { error } = await supabaseClient
        .from('daily_entries')
        .upsert(entry);

      if (error) throw error;

      // Clear draft after successful submission
      localStore.clearFormDraft();

    } catch (err) {
      setSubmitError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
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
    loadFormDraft: () => localStore.formDraft,
    submitForm,
    isSubmitting,
    submitError,
    validateForm
  };
} 