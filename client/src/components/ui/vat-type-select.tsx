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

// Default South African VAT types for fallback
const DEFAULT_VAT_TYPES = [
  { id: 1, code: "STD", name: "VAT Exclusive", rate: 15, description: "Standard VAT rate (exclusive)" },
  { id: 2, code: "INC", name: "VAT Inclusive", rate: 15, description: "Standard VAT rate (inclusive)" },
  { id: 3, code: "ZER", name: "Zero-rated", rate: 0, description: "Zero-rated supplies" },
  { id: 4, code: "EXM", name: "Exempt", rate: 0, description: "VAT exempt supplies" },
  { id: 5, code: "NOV", name: "No VAT", rate: 0, description: "No VAT applicable" }
];

export const VATTypeSelect: React.FC<VATTypeSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select VAT type",
  disabled = false,
  className,
  companyId = 2
}) => {
  // Fetch VAT types from the database VAT module with fallback
  const { data: apiVatTypes = [], isError } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-types"],
    retry: false, // Don't retry on auth errors
  });

  // Use API data if available, otherwise use default types
  const vatTypes = apiVatTypes.length > 0 ? apiVatTypes : DEFAULT_VAT_TYPES;

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