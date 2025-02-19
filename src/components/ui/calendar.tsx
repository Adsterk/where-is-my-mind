"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      className={className}
      classNames={{
        months: "flex flex-col sm:flex-row sm:gap-4 gap-2",
        month: "w-full",
        caption: "flex justify-center relative items-center h-10",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: "text-sm font-medium text-center",
        row: "grid grid-cols-7",
        cell: "text-center text-sm relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 p-0",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent/50",
        day_hidden: "invisible",
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar } 