import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  subtext?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Search and select...",
  className,
  disabled = false,
  clearable = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.subtext?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  const selectOption = (option: Option) => {
    onValueChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "cursor-pointer transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1 gap-2">
          {isOpen && <Search className="h-4 w-4 text-muted-foreground" />}
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              placeholder="Type to search..."
            />
          ) : (
            <span className={cn(
              "flex-1 truncate",
              !selectedOption && "text-muted-foreground"
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {clearable && selectedOption && (
            <button
              type="button"
              onClick={clearSelection}
              className="h-4 w-4 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )} />
        </div>
      </div>

      {isOpen && (
        <div
          ref={optionsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
        >
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              No options found
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  index === highlightedIndex && "bg-accent text-accent-foreground",
                  option.value === value && "bg-primary text-primary-foreground"
                )}
                onClick={() => selectOption(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{option.label}</span>
                  {option.subtext && (
                    <span className="text-xs text-muted-foreground">
                      {option.subtext}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}