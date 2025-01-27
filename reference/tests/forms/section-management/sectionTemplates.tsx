import { 
  Activity, 
  Brain, 
  Heart, 
  Users, 
  Dumbbell,
  Pill
} from 'lucide-react'
import { SectionTemplate } from './templateTypes'
import { TestSection, SectionType } from './types'

export const sectionTemplates: SectionTemplate[] = [
  {
    id: 'medication',
    type: 'medication' as SectionType,
    title: 'Medication Tracker',
    description: 'Track your medications and when you take them',
    icon: Pill,
    createSection: (config): TestSection => ({
      id: crypto.randomUUID(),
      type: 'medication',
      title: config.title || 'Medications',
      component: null,
      isVisible: true
    })
  },
  {
    id: 'activity',
    type: 'activity' as SectionType,
    title: 'Activity Tracker',
    description: 'Track your daily activities and exercises',
    icon: Activity,
    createSection: (config): TestSection => ({
      id: crypto.randomUUID(),
      type: 'activity',
      title: config.title || 'Activities',
      component: null,
      isVisible: true
    })
  },
  {
    id: 'behavior',
    type: 'behavior' as SectionType,
    title: 'Behavior Tracker',
    description: 'Monitor and track behavioral patterns',
    icon: Brain,
    createSection: (config): TestSection => ({
      id: crypto.randomUUID(),
      type: 'behavior',
      title: config.title || 'Behaviors',
      component: null,
      isVisible: true
    })
  },
  {
    id: 'skills',
    type: 'skills' as SectionType,
    title: 'Skills Tracker',
    description: 'Track your coping skills and their effectiveness',
    icon: Dumbbell,
    createSection: (config): TestSection => ({
      id: crypto.randomUUID(),
      type: 'skills',
      title: config.title || 'Skills Practice',
      component: null,
      isVisible: true
    })
  },
  {
    id: 'social',
    type: 'social' as SectionType,
    title: 'Social Connections',
    description: 'Track your social interactions and support network',
    icon: Users,
    createSection: (config): TestSection => ({
      id: crypto.randomUUID(),
      type: 'social',
      title: config.title || 'Social Connections',
      component: null,
      isVisible: true
    })
  },
  {
    id: 'spirituality',
    type: 'spirituality' as SectionType,
    title: 'Spirituality Tracker',
    description: 'Track your spiritual practices and experiences',
    icon: Heart,
    createSection: (config): TestSection => ({
      id: crypto.randomUUID(),
      type: 'spirituality',
      title: config.title || 'Spiritual Practice',
      component: null,
      isVisible: true
    })
  }
] 