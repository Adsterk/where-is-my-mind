import { MoodEntryForm } from '@/components/forms/MoodEntryForm'

export default function DailyMoodPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Daily Mood Entry</h1>
      <MoodEntryForm />
    </div>
  )
} 