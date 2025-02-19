'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerWithRangeProps {
  date?: DateRange
  onChange?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  date,
  onChange
}: DatePickerWithRangeProps) {
  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full p-3">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-screen p-3 sm:w-auto sm:p-4">
          <div className="sm:min-w-[550px]">
            <Calendar
              mode="range"
              selected={date}
              onSelect={onChange}
              numberOfMonths={2}
              defaultMonth={date?.from}
              disabled={{ after: new Date() }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 