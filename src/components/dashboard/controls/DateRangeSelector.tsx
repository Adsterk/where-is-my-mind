'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns'

interface DateRangeSelectorProps {
  onRangeChange: (start: Date, end: Date) => void
}

export function DateRangeSelector({ onRangeChange }: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState(
    subDays(new Date(), 7).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onRangeChange(
      startOfDay(new Date(startDate)),
      endOfDay(new Date(endDate))
    )
  }

  const setPresetRange = (days: number) => {
    const end = new Date()
    const start = subDays(end, days)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
    onRangeChange(startOfDay(start), endOfDay(end))
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPresetRange(7)}
            >
              Last 7 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPresetRange(30)}
            >
              Last 30 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPresetRange(90)}
            >
              Last 90 Days
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button type="submit" className="self-end">
              Apply Range
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 