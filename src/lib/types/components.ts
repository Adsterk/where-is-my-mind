import type { FormSection, TrackingItem } from './database';

// MoodScore Component Types
export interface MoodScoreProps {
  value: number;
  isBipolar: boolean;
  onChange: (value: number) => void;
  onBipolarChange: (value: boolean) => void;
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
  moodScore: number;
  isBipolar: boolean;
  trackedItems: Record<string, boolean>;
  notes?: string;
} 