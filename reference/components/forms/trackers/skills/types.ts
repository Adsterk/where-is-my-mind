import type { EntryWithType } from '@/types/entries'

export interface Skill {
  id: string
  name: string
  category: string
  is_custom: boolean
}

export interface SkillEntry {
  skills_id: string
  effectiveness: 'none' | 'mild' | 'moderate' | 'significant'
  difficulty: number
  notes?: string
}

export type TypedSkillEntry = EntryWithType<'skill', SkillEntry>

export interface SkillTrackerProps {
  items: Skill[]
  entries: TypedSkillEntry[]
  onUpdate: (items: Skill[], entries: TypedSkillEntry[]) => void
  onNewSkill?: (skill: Omit<Skill, 'id'>) => void
  onDeleteItem?: (itemId: string) => void
  isEditing?: boolean
}
