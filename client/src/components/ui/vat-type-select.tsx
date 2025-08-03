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

// Standard South African VAT types with inclusive/exclusive options
const DEFAULT_VAT_TYPES = [
  { id: "vat_inclusive", code: "INC", name: "VAT Inclusive (15%)", rate: 15, description: "Standard VAT rate inclusive" },
  { id: "vat_exclusive", code: "EXC", name: "VAT Exclusive (15%)", rate: 15, description: "Standard VAT rate exclusive" },
  { id: "zero_rated", code: "ZER", name: "Zero-rated (0%)", rate: 0, description: "Zero-rated supplies" },
  { id: "exempt", code: "EXM", name: "Exempt (0%)", rate: 0, description: "VAT exempt supplies" }
];

export const VATTypeSelect: React.FC<VATTypeSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select VAT type",
  disabled = false,
  className,
  companyId = 2
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {DEFAULT_VAT_TYPES.map((vatType) => (
          <SelectItem key={vatType.id} value={vatType.id}>
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