import { TestSection, SectionType } from './types'

export interface SectionTemplate {
  id: string
  type: SectionType
  title: string
  description: string
  icon: React.ComponentType<any>
  createSection: (config: TemplateConfig) => TestSection
}

export interface TemplateConfig {
  title: string
} 