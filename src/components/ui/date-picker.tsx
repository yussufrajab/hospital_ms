'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date',
  className,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-gray-500 dark:text-gray-400',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  dateFrom?: Date
  dateTo?: Date
  onDateFromChange?: (date: Date | undefined) => void
  onDateToChange?: (date: Date | undefined) => void
  className?: string
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[200px] justify-start text-left font-normal',
              !dateFrom && 'text-gray-500 dark:text-gray-400'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFrom ? format(dateFrom, 'PPP') : <span>From date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateFrom}
            onSelect={onDateFromChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <span className="text-gray-500">to</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-[200px] justify-start text-left font-normal',
              !dateTo && 'text-gray-500 dark:text-gray-400'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTo ? format(dateTo, 'PPP') : <span>To date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dateTo}
            onSelect={onDateToChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
