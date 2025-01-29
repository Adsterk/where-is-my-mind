export interface Section {
  id: string
  title: string
  component: React.ReactNode
  isVisible: boolean
  order: number
}

export interface FormSection {
  items: any[]
  entries: any[]
}

export interface FormDataType {
  moodAndNotes: {
    mood_score: number
    notes: string | null
    is_bipolar_scale: boolean
  }
  sleep: {
    sleep_hours: number
    sleep_quality: number | null
  }
  medications: FormSection
  activities: FormSection
  behaviors: FormSection
  skills: FormSection
  socialConnections: FormSection
  spirituality: FormSection
} 