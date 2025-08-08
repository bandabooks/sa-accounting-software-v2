import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";

interface SearchComboOption {
  value: string;
  label: string;
  description?: string;
  searchableText?: string;
  data?: any; // Additional data for the option
}

interface SearchComboProps {
  value?: string;
  onValueChange: (value: string, option?: SearchComboOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  endpoint: string; // API endpoint for server-side search
  searchParam?: string; // Query parameter name for search (default: "search")
  minSearchLength?: number; // Minimum search length before triggering search
  debounceMs?: number; // Debounce delay in milliseconds
  maxResults?: number; // Maximum number of results to show
  emptyMessage?: string;
  createLabel?: string; // Label for create option
  onCreate?: (searchTerm: string) => void; // Callback for creating new items
  renderOption?: (option: SearchComboOption) => React.ReactNode; // Custom option renderer
  // ARIA accessibility props
  "aria-label"?: string;
  "aria-describedby"?: string;
  id?: string;
}

const SearchCombo = React.forwardRef<HTMLButtonElement, SearchComboProps>(({
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  endpoint,
  searchParam = "search",
  minSearchLength = 1,
  debounceMs = 300,
  maxResults = 100,
  emptyMessage = "No options found",
  createLabel,
  onCreate,
  renderOption,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  id,
}, ref) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<List>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Fetch options from server
  const { data: options = [], isLoading, error } = useQuery<SearchComboOption[]>({
    queryKey: [endpoint, debouncedSearchTerm],
    queryFn: async () => {
      if (debouncedSearchTerm.length < minSearchLength && debouncedSearchTerm.length > 0) {
        return [];
      }

      const url = new URL(endpoint, window.location.origin);
      if (debouncedSearchTerm) {
        url.searchParams.set(searchParam, debouncedSearchTerm);
      }
      url.searchParams.set('limit', maxResults.toString());

      const response = await fetch(url.toString(), {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch options: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: open && (debouncedSearchTerm.length >= minSearchLength || debouncedSearchTerm === ""),
    staleTime: 30000, // Cache results for 30 seconds
    retry: 1,
  });

  // Find selected option
  const selectedOption = useMemo(() => {
    return options.find(option => option.value === value);
  }, [options, value]);

  // Handle option selection
  const handleSelect = useCallback((selectedValue: string) => {
    const option = options.find(opt => opt.value === selectedValue);
    onValueChange(selectedValue, option);
    setOpen(false);
    setSearchTerm("");
  }, [options, onValueChange]);

  // Handle create new option
  const handleCreate = useCallback(() => {
    if (onCreate && searchTerm.trim()) {
      onCreate(searchTerm.trim());
      setOpen(false);
      setSearchTerm("");
    }
  }, [onCreate, searchTerm]);

  // Clear selection
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange("", undefined);
  }, [onValueChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setSearchTerm("");
    }
  }, [open]);

  // Focus management
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Option renderer for virtualized list
  const OptionItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const option = options[index];
    if (!option) return null;

    const isSelected = value === option.value;
    const isHighlighted = false; // Could add keyboard navigation highlighting

    return (
      <div style={style}>
        <div
          role="option"
          aria-selected={isSelected}
          className={cn(
            "relative flex cursor-default select-none items-center px-3 py-2 text-sm outline-none",
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            isSelected && "bg-accent text-accent-foreground",
            isHighlighted && "bg-accent/50"
          )}
          onClick={() => handleSelect(option.value)}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
        >
          {renderOption ? renderOption(option) : (
            <>
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {option.description}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }, [options, value, renderOption, handleSelect]);

  const displayValue = selectedOption?.label || placeholder;
  const hasValue = !!selectedOption;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          id={id}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
          onKeyDown={handleKeyDown}
        >
          <span className={cn("truncate", !hasValue && "text-muted-foreground")}>
            {displayValue}
          </span>
          <div className="flex items-center gap-1">
            {hasValue && !disabled && (
              <X
                className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              autoComplete="off"
              aria-label="Search options"
            />
          </div>
        </div>

        <div className="max-h-[300px] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-6 text-sm text-destructive">
              Failed to load options
            </div>
          ) : options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <div>{emptyMessage}</div>
              {onCreate && searchTerm.trim() && createLabel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={handleCreate}
                >
                  {createLabel.replace("{search}", searchTerm.trim())}
                </Button>
              )}
            </div>
          ) : (
            <div role="listbox">
              <List
                ref={listRef}
                height={Math.min(options.length * 48, 288)} // 48px per item, max 6 items visible
                itemCount={options.length}
                itemSize={48}
                width="100%"
              >
                {OptionItem}
              </List>
            </div>
          )}
        </div>

        {onCreate && searchTerm.trim() && options.length > 0 && createLabel && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={handleCreate}
            >
              {createLabel.replace("{search}", searchTerm.trim())}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

SearchCombo.displayName = "SearchCombo";

export { SearchCombo };
export type { SearchComboOption, SearchComboProps };