export type SectionType = 'mood' | 'sleep' | 'medication' | 'activity' | 'behavior' | 'skills' | 'social' | 'spirituality'

export interface TestSection {
  id: string
  title: string
  type: SectionType
  component: React.ReactNode
  isVisible: boolean
}

export interface SortableSectionProps {
  section: TestSection
  children: React.ReactNode
  isDragging?: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

export interface TestSectionReorderProps {
  children?: React.ReactNode
  initialSections: TestSection[]
  onSectionsReorder?: (sections: TestSection[]) => void
} 