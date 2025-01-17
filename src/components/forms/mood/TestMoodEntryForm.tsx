'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { TestMoodAndNotesTracker } from './TestMoodAndNotesTracker'
import type { TestMoodAndNotesEntry } from './TestMoodAndNotesTracker'
import { TestSleepTracker } from './TestSleepTracker'
import type { TestSleepEntry } from './TestSleepTracker'
import { TestMedicationTracker } from './TestMedicationTracker'
import type { TestMedication, TestMedicationEntry } from './TestMedicationTracker'
import { TestActivityTracker } from './TestActivityTracker'
import type { TestActivity, TestActivityEntry } from './TestActivityTracker'
import { TestSocialConnectionTracker } from './TestSocialConnectionTracker'
import type { TestSocialConnection, TestSocialConnectionEntry } from './TestSocialConnectionTracker'
import { TestProblematicBehaviorTracker } from './TestProblematicBehaviorTracker'
import type { TestBehavior, TestBehaviorEntry } from './TestProblematicBehaviorTracker'
import { TestSkillsTracker } from './TestSkillsTracker'
import type { TestSkill, TestSkillEntry } from './TestSkillsTracker'
import { TestSpiritualityTracker } from './TestSpiritualityTracker'
import type { TestSpiritualPractice, TestSpiritualPracticeEntry } from './TestSpiritualityTracker'

interface TestFormData {
  moodAndNotes: TestMoodAndNotesEntry
  sleep: TestSleepEntry
  medications: {
    items: TestMedication[]
    entries: TestMedicationEntry[]
  }
  activities: {
    items: TestActivity[]
    entries: TestActivityEntry[]
  }
  socialConnections: {
    items: TestSocialConnection[]
    entries: TestSocialConnectionEntry[]
  }
  behaviors: {
    items: TestBehavior[]
    entries: TestBehaviorEntry[]
  }
  skills: {
    items: TestSkill[]
    entries: TestSkillEntry[]
  }
  spiritualPractices: {
    items: TestSpiritualPractice[]
    entries: TestSpiritualPracticeEntry[]
  }
}

export function TestMoodEntryForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<TestFormData>({
    moodAndNotes: {
      mood_score: 5,
      notes: null,
      is_bipolar_scale: false
    },
    sleep: {
      sleep_hours: 7,
      sleep_quality: null
    },
    medications: {
      items: [],
      entries: []
    },
    activities: {
      items: [],
      entries: []
    },
    socialConnections: {
      items: [],
      entries: []
    },
    behaviors: {
      items: [],
      entries: []
    },
    skills: {
      items: [],
      entries: []
    },
    spiritualPractices: {
      items: [],
      entries: []
    }
  })

  const handleMoodAndNotesUpdate = (data: TestMoodAndNotesEntry) => {
    setFormData(prev => ({
      ...prev,
      moodAndNotes: data
    }))
  }

  const handleSleepUpdate = (data: TestSleepEntry) => {
    setFormData(prev => ({
      ...prev,
      sleep: data
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form Data:', formData)
    toast({
      title: "Success",
      description: "Form data logged to console",
    })
  }

  const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const handleNewMedication = (medication: Omit<TestMedication, 'id'>) => {
    const newMedication: TestMedication = {
      id: generateTempId(),
      ...medication
    }

    setFormData(prev => ({
      ...prev,
      medications: {
        items: [...prev.medications.items, newMedication],
        entries: prev.medications.entries
      }
    }))
  }

  const handleMedicationEntries = (entries: TestMedicationEntry[]) => {
    setFormData(prev => ({
      ...prev,
      medications: {
        ...prev.medications,
        entries
      }
    }))
  }

  const handleNewActivity = (activity: Omit<TestActivity, 'id'>) => {
    const newActivity: TestActivity = {
      id: generateTempId(),
      ...activity
    }

    setFormData(prev => ({
      ...prev,
      activities: {
        items: [...prev.activities.items, newActivity],
        entries: prev.activities.entries
      }
    }))
  }

  const handleActivityEntries = (entries: TestActivityEntry[]) => {
    setFormData(prev => ({
      ...prev,
      activities: {
        ...prev.activities,
        entries
      }
    }))
  }

  const handleNewSocialConnection = (connection: Omit<TestSocialConnection, 'id'>) => {
    const newConnection: TestSocialConnection = {
      id: generateTempId(),
      ...connection
    }

    setFormData(prev => ({
      ...prev,
      socialConnections: {
        items: [...prev.socialConnections.items, newConnection],
        entries: prev.socialConnections.entries
      }
    }))
  }

  const handleSocialConnectionEntries = (entries: TestSocialConnectionEntry[]) => {
    setFormData(prev => ({
      ...prev,
      socialConnections: {
        ...prev.socialConnections,
        entries
      }
    }))
  }

  const handleNewBehavior = (behavior: Omit<TestBehavior, 'id'>) => {
    const newBehavior: TestBehavior = {
      id: generateTempId(),
      ...behavior
    }

    setFormData(prev => ({
      ...prev,
      behaviors: {
        items: [...prev.behaviors.items, newBehavior],
        entries: prev.behaviors.entries
      }
    }))
  }

  const handleBehaviorEntries = (entries: TestBehaviorEntry[]) => {
    setFormData(prev => ({
      ...prev,
      behaviors: {
        ...prev.behaviors,
        entries
      }
    }))
  }

  const handleNewSkill = (skill: Omit<TestSkill, 'id'>) => {
    const newSkill: TestSkill = {
      id: generateTempId(),
      ...skill
    }

    setFormData(prev => ({
      ...prev,
      skills: {
        items: [...prev.skills.items, newSkill],
        entries: prev.skills.entries
      }
    }))
  }

  const handleSkillEntries = (entries: TestSkillEntry[]) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        entries
      }
    }))
  }

  const handleNewSpiritualPractice = (practice: Omit<TestSpiritualPractice, 'id'>) => {
    const newPractice: TestSpiritualPractice = {
      id: generateTempId(),
      ...practice
    }

    setFormData(prev => ({
      ...prev,
      spiritualPractices: {
        items: [...prev.spiritualPractices.items, newPractice],
        entries: prev.spiritualPractices.entries
      }
    }))
  }

  const handleSpiritualPracticeEntries = (entries: TestSpiritualPracticeEntry[]) => {
    setFormData(prev => ({
      ...prev,
      spiritualPractices: {
        ...prev.spiritualPractices,
        entries
      }
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mood and Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <TestMoodAndNotesTracker
            value={formData.moodAndNotes}
            onUpdate={handleMoodAndNotesUpdate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sleep</CardTitle>
        </CardHeader>
        <CardContent>
          <TestSleepTracker
            value={formData.sleep}
            onUpdate={handleSleepUpdate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medications</CardTitle>
        </CardHeader>
        <CardContent>
          <TestMedicationTracker
            medications={formData.medications.items}
            entries={formData.medications.entries}
            onMedicationAdd={handleNewMedication}
            onEntryChange={handleMedicationEntries}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <TestActivityTracker
            activities={formData.activities.items}
            entries={formData.activities.entries}
            onActivityAdd={handleNewActivity}
            onEntryChange={handleActivityEntries}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <TestSocialConnectionTracker
            connections={formData.socialConnections.items}
            entries={formData.socialConnections.entries}
            onConnectionAdd={handleNewSocialConnection}
            onEntryChange={handleSocialConnectionEntries}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Problematic Behaviors</CardTitle>
        </CardHeader>
        <CardContent>
          <TestProblematicBehaviorTracker
            behaviors={formData.behaviors.items}
            entries={formData.behaviors.entries}
            onBehaviorAdd={handleNewBehavior}
            onEntryChange={handleBehaviorEntries}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <TestSkillsTracker
            skills={formData.skills.items}
            entries={formData.skills.entries}
            onSkillAdd={handleNewSkill}
            onEntryChange={handleSkillEntries}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spiritual Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <TestSpiritualityTracker
            practices={formData.spiritualPractices.items}
            entries={formData.spiritualPractices.entries}
            onPracticeAdd={handleNewSpiritualPractice}
            onEntryChange={handleSpiritualPracticeEntries}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Save Entry
      </Button>
    </form>
  )
} 