'use client'

import { MoodEntryForm } from '@/components/forms/MoodEntryForm'
import { Card } from '@/components/ui/card'

export default function DailyMoodPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Mood Entry</h1>
      <Card>
        <MoodEntryForm />
      </Card>
    </div>
  )
} 