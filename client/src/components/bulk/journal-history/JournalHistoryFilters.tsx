import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

interface JournalHistoryFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onPresetSelect: (preset: string) => void;
}

export function JournalHistoryFilters({
  dateRange,
  onDateRangeChange,
  onPresetSelect,
}: JournalHistoryFiltersProps) {
  const handlePresetChange = (value: string) => {
    onPresetSelect(value);
    
    const today = new Date();
    let from: Date;
    let to: Date;
    
    switch (value) {
      case 'today':
        from = startOfDay(today);
        to = endOfDay(today);
        break;
      case 'yesterday':
        from = startOfDay(subDays(today, 1));
        to = endOfDay(subDays(today, 1));
        break;
      case 'last7days':
        from = startOfDay(subDays(today, 6));
        to = endOfDay(today);
        break;
      case 'last30days':
        from = startOfDay(subDays(today, 29));
        to = endOfDay(today);
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = endOfDay(today);
        break;
      case 'lastMonth':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }
    
    onDateRangeChange({ from, to });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select onValueChange={handlePresetChange} defaultValue="today">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="lastMonth">Last Month</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "PP")} -{" "}
                  {format(dateRange.to, "PP")}
                </>
              ) : (
                format(dateRange.from, "PP")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}