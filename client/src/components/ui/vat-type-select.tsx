import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface VATTypeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  companyId?: number;
}

export const VATTypeSelect: React.FC<VATTypeSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select VAT type",
  disabled = false,
  className,
  companyId = 2
}) => {
  // Fetch VAT types from the existing system VAT module
  const { data: vatTypesData = [], isError, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-types"],
    retry: false, // Don't retry on auth errors
  });

  // Ensure we have array of VAT types from the system
  const vatTypes = Array.isArray(vatTypesData) ? vatTypesData : [];

  // Show loading state while fetching VAT types
  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading VAT types..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {vatTypes.map((vatType: any) => (
          <SelectItem key={vatType.id} value={vatType.id.toString()}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {vatType.code}
              </Badge>
              <span>{vatType.name}</span>
              <span className="text-gray-500">({vatType.rate}%)</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};