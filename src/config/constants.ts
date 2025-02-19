// App constants
export const APP_NAME = 'Where Is My Mind'
export const APP_DESCRIPTION = 'A mood tracking application to help you understand your mental health patterns'

// Auth constants
export const MIN_PASSWORD_LENGTH = 8
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

// Form constants
export const MOOD_SCORE_MIN = 1
export const MOOD_SCORE_MAX = 10
export const SLEEP_HOURS_MIN = 0
export const SLEEP_HOURS_MAX = 24

// Dashboard constants
export const DEFAULT_DATE_RANGE = 7 // days
export const MAX_DATE_RANGE = 90 // days
export const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#f43f5e',
  tertiary: '#10b981',
  background: '#f8fafc',
} as const

// API constants
export const API_RATE_LIMIT = 100 // requests per minute
export const API_TIMEOUT = 10000 // 10 seconds

// Cache constants
export const CACHE_TTL = 3600 // 1 hour
export const STALE_TIME = 300 // 5 minutes
