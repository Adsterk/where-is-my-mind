import { MoodOverview } from '@/components/dashboard/MoodOverview'
import { RecentEntries } from '@/components/dashboard/RecentEntries'
import { BasicStats } from '@/components/dashboard/BasicStats'

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <MoodOverview />
      <BasicStats />
      <RecentEntries />
    </div>
  )
} 