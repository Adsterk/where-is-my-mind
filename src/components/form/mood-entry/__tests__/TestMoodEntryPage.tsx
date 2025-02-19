'use client'

import { useState, useEffect } from 'react'
import { TestMoodScore } from './TestMoodScore'
import { TestSleepScore } from './TestSleepScore'
import { TestMedicationTracker } from './TestMedicationTracker'
import { TestBehaviorTracker } from './TestBehaviorTracker'
import { TestSkillsTracker } from './TestSkillsTracker'
import { TestSocialTracker } from './TestSocialTracker'
import { TestSelfCareTracker } from './TestSelfCareTracker'
import { useLocalStore } from '@/lib/stores/localStore'

export default function TestMoodEntryPage() {
  const formDraft = useLocalStore((state) => state.formDraft)

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <TestMoodScore />
        <TestSleepScore />
        <TestMedicationTracker />
        <TestBehaviorTracker />
        <TestSkillsTracker />
        <TestSocialTracker />
        <TestSelfCareTracker />
        
        {/* Debug View */}
        <div className="mt-8 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2">Form Draft State</h3>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(formDraft, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 