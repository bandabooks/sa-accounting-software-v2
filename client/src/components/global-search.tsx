import { useState, useEffect, useRef } from "react";
import { Search, X, FileText, User, Building, Package, ShoppingCart, Receipt } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
  metadata: any;
}

interface SearchResponse {
  results: SearchResult[];
  groupedResults: Record<string, SearchResult[]>;
  totalCount: number;
  query: string;
}

const iconMap = {
  User,
  Building,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
};

const typeDisplayNames = {
  customer: "Customers",
  supplier: "Suppliers", 
  invoice: "Invoices",
  product: "Products",
  purchase_order: "Purchase Orders",
  estimate: "Estimates",
};

const typeColors = {
  customer: "bg-blue-100 text-blue-800 border-blue-200",
  supplier: "bg-green-100 text-green-800 border-green-200",
  invoice: "bg-purple-100 text-purple-800 border-purple-200",
  product: "bg-orange-100 text-orange-800 border-orange-200",
  purchase_order: "bg-indigo-100 text-indigo-800 border-indigo-200",
  estimate: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Handle search results
  const { data: searchResults, isLoading } = useQuery<SearchResponse>({
    queryKey: ["/api/search", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close search
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={16} /> : <Search size={16} />;
  };

  const hasResults = searchResults && searchResults.results.length > 0;
  const shouldShowResults = isOpen && debouncedQuery.length >= 2;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search everything... (Ctrl+K)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {shouldShowResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          ) : hasResults ? (
            <ScrollArea className="max-h-80">
              <div className="p-2">
                {Object.entries(searchResults.groupedResults).map(([type, results]) => (
                  <div key={type} className="mb-4 last:mb-0">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                      {typeDisplayNames[type as keyof typeof typeDisplayNames] || type} ({results.length})
                    </div>
                    <div className="space-y-1 mt-2">
                      {results.map((result) => (
                        <Link key={`${result.type}-${result.id}`} href={result.url}>
                          <div
                            onClick={handleResultClick}
                            className="flex items-center space-x-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                          >
                            <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                              {renderIcon(result.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {result.title}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={`text-xs px-2 py-0.5 ${typeColors[result.type as keyof typeof typeColors] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                                >
                                  {typeDisplayNames[result.type as keyof typeof typeDisplayNames] || result.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {result.subtitle}
                              </p>
                              {result.metadata && (
                                <div className="flex space-x-3 mt-1">
                                  {result.metadata.status && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      Status: {result.metadata.status}
                                    </span>
                                  )}
                                  {result.metadata.email && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {result.metadata.email}
                                    </span>
                                  )}
                                  {result.metadata.phone && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {result.metadata.phone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : debouncedQuery.length >= 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for "{debouncedQuery}"</p>
              <p className="text-xs mt-1">Try different keywords or check spelling</p>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Start typing to search...</p>
              <p className="text-xs mt-1">Search customers, invoices, products, and more</p>
            </div>
          )}

          {/* Footer with shortcut tip */}
          {hasResults && (
            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-750">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">↵</kbd> to open • <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">Esc</kbd> to close
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}