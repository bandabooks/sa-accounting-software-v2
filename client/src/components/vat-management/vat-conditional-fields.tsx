import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VatConditionalFieldsProps {
  companyId: number;
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

interface VatFieldWrapperProps {
  companyId: number;
  children: React.ReactNode;
  showAlternative?: React.ReactNode;
  className?: string;
}

export function VatRateSelect({ companyId, value, onValueChange, label = "VAT Rate", placeholder = "Select VAT rate", className }: VatConditionalFieldsProps) {
  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  const { data: vatTypes } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-types"],
    enabled: vatSettings?.isVatRegistered,
  });

  if (!vatSettings?.isVatRegistered) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-gray-400">{label}</Label>
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
          <EyeOff className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">VAT not applicable (company not VAT registered)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {vatTypes?.map((vatType: any) => (
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
    </div>
  );
}

export function VatAmountInput({ companyId, value, onValueChange, label = "VAT Amount", placeholder = "0.00", className }: VatConditionalFieldsProps) {
  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  if (!vatSettings?.isVatRegistered) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-gray-400">{label}</Label>
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
          <EyeOff className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">R 0.00 (VAT not applicable)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input
        type="number"
        step="0.01"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      />
    </div>
  );
}

export function VatFieldWrapper({ companyId, children, showAlternative, className }: VatFieldWrapperProps) {
  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  if (!vatSettings?.isVatRegistered) {
    return (
      <div className={cn("relative", className)}>
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-md">
          {showAlternative || (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-md shadow-sm border">
              <EyeOff className="h-4 w-4" />
              VAT not applicable
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

export function VatStatusIndicator({ companyId, className }: { companyId: number; className?: string }) {
  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  if (!vatSettings) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {vatSettings.isVatRegistered ? (
        <>
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <Eye className="h-3 w-3 mr-1" />
            VAT Registered
          </Badge>
          {vatSettings.vatNumber && (
            <span className="text-sm text-gray-600">
              VAT: {vatSettings.vatNumber}
            </span>
          )}
        </>
      ) : (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          <EyeOff className="h-3 w-3 mr-1" />
          Non-VAT
        </Badge>
      )}
    </div>
  );
}

export function VatComplianceGuide({ companyId }: { companyId: number }) {
  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  if (!vatSettings) return null;

  if (!vatSettings.isVatRegistered) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-800 mb-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">VAT Compliance Guide</span>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Your company is not VAT registered</p>
          <p>• VAT fields are hidden from all transactions and reports</p>
          <p>• Register for VAT when your turnover exceeds R1 million annually</p>
          <p>• Contact SARS for VAT registration assistance</p>
        </div>
      </div>
    );
  }

  const getSubmissionFrequency = (months: number) => {
    switch (months) {
      case 1: return "Monthly";
      case 2: return "Bi-Monthly";
      case 6: return "Bi-Annual";
      default: return `Every ${months} months`;
    }
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-2 text-green-800 mb-2">
        <Eye className="h-4 w-4" />
        <span className="font-medium">VAT Compliance Status</span>
      </div>
      <div className="text-sm text-green-700 space-y-1">
        <p>• VAT Registration: {vatSettings.vatNumber || "Pending"}</p>
        <p>• Submission Period: {getSubmissionFrequency(vatSettings.vatPeriodMonths || 2)}</p>
        <p>• Due Date: {vatSettings.vatSubmissionDay || 25}th of each period</p>
        <p>• All VAT calculations and reporting features are active</p>
      </div>
    </div>
  );
}