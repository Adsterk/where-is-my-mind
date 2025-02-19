// Common Types
export interface DateRange {
  from: Date;
  to?: Date;
}

// Chart Types
export interface MoodChartProps {
  dateRange: DateRange
}

export interface MoodDataPoint {
  date: string
  score: number
  tooltip: string
}

// Pattern Types
export interface MoodPatternsProps {
  dateRange: DateRange
}

export interface Pattern {
  type: 'trend' | 'variability' | 'scale'
  description: string
}

// Stats Types
export interface Stats {
  averageMood: number | null
  totalEntries: number
  highestMood: number
  lowestMood: number
  regularEntries: number
  bipolarEntries: number
  averageBipolarMood: number | null
  averageRegularMood: number | null
  isUsingBipolarScale: boolean
}

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
}

export interface BasicStatsProps {
  initialData?: any[] | null
}

// Overview Types
export interface MoodOverviewProps {
  initialData?: {
    mood_score: number
    date: string
    is_bipolar: boolean
  } | null
}

// Recent Entries Types
export interface RecentEntriesProps {
  initialData?: any[] | null
}

// Control Types
export interface DateRangeSelectorProps {
  defaultValue?: DateRange
  onRangeChange: (start: Date, end: Date) => void
}
