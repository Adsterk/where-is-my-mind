// User Preferences Types
export interface UserPreferencesData {
  use_bipolar_scale: boolean
}

export interface ThemePreference {
  theme: string
}

// Component Props Types
export interface PreferenceUpdateFunction<T> {
  (key: keyof T, value: T[keyof T]): Promise<void>
}

export interface ThemeUpdateFunction {
  (theme: string): Promise<void>
}

// Data Management Types
export interface ExportedData {
  daily_entries: any[] // Replace with proper type when available
  exported_at: string
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Component Props
export interface AccountSettingsProps {
  onDelete?: () => void
}

export interface UserPreferencesProps {
  initialPreferences?: UserPreferencesData
  onPreferenceChange?: PreferenceUpdateFunction<UserPreferencesData>
  onThemeChange?: ThemeUpdateFunction
}

export interface DataManagementProps {
  onExport?: () => Promise<void>
}
