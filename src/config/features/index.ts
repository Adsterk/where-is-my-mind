export const features = {
  auth: {
    enabled: true,
    emailVerification: true,
    passwordReset: true,
  },
  moodTracking: {
    enabled: true,
    components: {
      moodScore: true,
      sleepScore: true,
      medicationTracker: true,
      behaviorTracker: true,
      skillsTracker: true,
      socialTracker: true,
      selfCareTracker: true,
    },
  },
  dashboard: {
    enabled: true,
    components: {
      moodChart: true,
      moodOverview: true,
      moodPatterns: true,
      recentEntries: true,
      basicStats: true,
    },
  },
  settings: {
    enabled: true,
    components: {
      userPreferences: true,
      dataManagement: true,
      accountSettings: true,
    },
  },
} as const

export type Feature = keyof typeof features
export type MoodTrackingComponent = keyof typeof features.moodTracking.components
export type DashboardComponent = keyof typeof features.dashboard.components
export type SettingsComponent = keyof typeof features.settings.components
