import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UNIFIED_VAT_TYPES } from "../../../shared/vat-constants";

interface VATTypeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const VATTypeSelect: React.FC<VATTypeSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select VAT type",
  disabled = false,
  className
}) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {UNIFIED_VAT_TYPES.map((vatType) => (
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