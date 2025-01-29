// Database type definitions

export interface UserPreferences {
  id: string;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  form_layout: FormSection[];
  draft_data: Record<string, any>;
  draft_last_accessed?: string;
  created_at: string;
  updated_at: string;
}

export interface FormSection {
  id: string;
  name: string;
  type: 'mood' | 'sleep' | 'medication' | 'behavior' | 'skill' | 'social' | 'spiritual';
  default_order: number;
  is_required: boolean;
  created_at: string;
}

export interface UserSection {
  id: string;
  user_id: string;
  section_id: string;
  display_order: number;
  is_visible: boolean;
}

export interface TrackingItem {
  id: string;
  user_id: string;
  section_id: string;
  name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  date: string;
  mood_score?: number;
  is_bipolar: boolean;
  sleep_hours?: number;
  tracking_data: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// Helper types
export type SectionType = FormSection['type'];
export type ThemePreference = UserPreferences['theme_preference'];

// Form state types
export interface FormState {
  sections: FormSection[];
  trackingItems: Record<string, TrackingItem[]>;
  draft?: Record<string, any>;
  lastSaved?: string;
}

// Database response types
export type DBResult<T> = {
  data: T | null;
  error: Error | null;
};

export type DBArrayResult<T> = {
  data: T[] | null;
  error: Error | null;
};
