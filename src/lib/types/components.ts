import type { FormSection, TrackingItem } from './database';

// MoodScore Component Types
export interface MoodScoreProps {
  score: number;
  bipolarMode: boolean;
  notes: string;
  onScoreChange: (value: number) => void;
  onBipolarToggle: (checked: boolean) => void;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

// SleepScore Component Types
export interface SleepScoreProps {
  hours: number;
  notes: string;
  onHoursChange: (value: number) => void;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

// TrackingSection Component Types
export interface TrackingSectionProps {
  title: string;
  description?: string;
  items: TrackingItem[];
  onItemAdd: (name: string) => void;
  onItemToggle: (itemId: string, checked: boolean) => void;
  onItemDelete: (itemId: string) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

// SectionManager Component Types
export interface SectionManagerProps {
  sections: FormSection[];
  onOrderChange: (sections: FormSection[]) => void;
  onVisibilityChange: (sectionId: string, isVisible: boolean) => void;
  disabled?: boolean;
}

// Form State Types
export interface FormData {
  initialized: boolean;
  moodScore: number;
  isBipolarMode: boolean;
  moodNotes: string;
  sleepHours: number;
  sleepNotes: string;
  medications: Array<{
    id: string;
    name: string;
    taken: boolean;
  }>;
  behaviors: Array<{
    id: string;
    name: string;
    completed: boolean;
    severity?: 'mild' | 'moderate' | 'severe';
  }>;
  skills: Array<{
    id: string;
    name: string;
    completed: boolean;
    effectiveness?: 'not helpful' | 'somewhat helpful' | 'very helpful';
  }>;
  socialActivities: Array<{
    id: string;
    name: string;
    completed: boolean;
    quality?: 'not helpful' | 'somewhat helpful' | 'very helpful';
  }>;
  selfCareActivities: Array<{
    id: string;
    name: string;
    completed: boolean;
    impact?: 'not helpful' | 'somewhat helpful' | 'very helpful';
  }>;
  medicationNotes: string;
  behaviorNotes: string;
  skillsNotes: string;
  socialNotes: string;
  selfCareNotes: string;
}

// Form Draft Types
export interface FormDraft {
  draftDate: string | null;      // YYYY-MM-DD in user's timezone
  isDraftDirty: boolean;         // Has the form been modified?
  lastEntryDate: string | null;  // Date of the last entry used as template
  lastSyncDate: string | null;   // Last time the draft was synced with server
  formData: FormData;
  offlineChanges: {
    hasPendingChanges: boolean;
    lastModified: string | null;
  };
}

export type { FormSection }; 