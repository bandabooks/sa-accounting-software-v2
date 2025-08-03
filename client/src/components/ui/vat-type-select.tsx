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
  const systemVatTypes = Array.isArray(vatTypesData) ? vatTypesData : [];

  // Create comprehensive VAT options with inclusive/exclusive variants
  const vatOptions = [];
  
  // Add system VAT types with inclusive/exclusive variants where applicable
  systemVatTypes.forEach((vatType: any) => {
    const rate = parseFloat(vatType.rate || "0");
    
    if (rate > 0) {
      // For VAT rates > 0, provide both inclusive and exclusive options
      vatOptions.push({
        id: `${vatType.id}_inc`,
        code: `${vatType.code}_INC`,
        name: `${vatType.name} (VAT Inclusive)`,
        rate: rate,
        isInclusive: true,
        systemVatTypeId: vatType.id
      });
      
      vatOptions.push({
        id: `${vatType.id}_exc`,
        code: `${vatType.code}_EXC`,
        name: `${vatType.name} (VAT Exclusive)`,
        rate: rate,
        isInclusive: false,
        systemVatTypeId: vatType.id
      });
    } else {
      // For 0% rates (Zero-rated, Exempt), just add single option
      vatOptions.push({
        id: `${vatType.id}_single`,
        code: vatType.code,
        name: vatType.name,
        rate: rate,
        isInclusive: false,
        systemVatTypeId: vatType.id
      });
    }
  });

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
        {vatOptions.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {option.code}
              </Badge>
              <span>{option.name}</span>
              <span className="text-gray-500">({option.rate}%)</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};