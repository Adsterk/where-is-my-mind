'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { DatePickerWithRange } from '@/components/ui/date-picker'
import type { DateRange as AppDateRange } from '../types'
import type { DateRange as DayPickerDateRange } from 'react-day-picker'

interface DateRangeSelectorProps {
  defaultValue?: AppDateRange
  onRangeChange: (from: Date, to: Date) => void
}

export function DateRangeSelector({ defaultValue, onRangeChange }: DateRangeSelectorProps) {
  const [dateRange, setDateRange] = useState<DayPickerDateRange | undefined>(() => {
    if (defaultValue?.from && defaultValue?.to) {
      return defaultValue;
    }
    return {
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    };
  });

  const [activeRange, setActiveRange] = useState<'last7' | 'last30' | 'last90'>('last7');

  useEffect(() => {
    if (defaultValue?.from && defaultValue?.to) {
      setDateRange(defaultValue)
    }
  }, [defaultValue])

  const handleDateRangeChange = (range: DayPickerDateRange | undefined) => {
    if (range?.from) {
      setDateRange(range)
      // Only trigger the change if we have both dates
      if (range.to) {
        onRangeChange(range.from, range.to)
        setActiveRange('last7') // Reset active range when custom dates are selected
      }
    }
  }

  const handleRangeSelect = (range: 'last7' | 'last30' | 'last90') => {
    setActiveRange(range);
    const to = new Date();
    const from = new Date(Date.now() - (range === 'last7' ? 7 : range === 'last30' ? 30 : 90) * 24 * 60 * 60 * 1000);
    const newRange = { from, to };
    setDateRange(newRange);
    onRangeChange(from, to);
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeRange === 'last7' ? 'default' : 'outline'}
              onClick={() => handleRangeSelect('last7')}
              size="sm"
            >
              Last 7 Days
            </Button>
            <Button
              variant={activeRange === 'last30' ? 'default' : 'outline'}
              onClick={() => handleRangeSelect('last30')}
              size="sm"
            >
              Last 30 Days
            </Button>
            <Button
              variant={activeRange === 'last90' ? 'default' : 'outline'}
              onClick={() => handleRangeSelect('last90')}
              size="sm"
            >
              Last 90 Days
            </Button>
          </div>
          <div>
            <DatePickerWithRange
              date={dateRange as AppDateRange}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 